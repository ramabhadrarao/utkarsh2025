import express from 'express';
import multer from 'multer';
import path from 'path';
import Event from '../models/Event.js';
import { authenticateToken, isAdmin, isOrganizer } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all active events (public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events (admin/organizer)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    // If organizer, only show their assigned events
    if (req.user.role === 'organizer') {
      query = { organizer: req.user.userId };
    }
    
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (Admin only)
router.post('/', authenticateToken, isAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'attachments', maxCount: 5 }
]), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      registrationFee,
      prizeAmount,
      maxParticipants,
      rules,
      organizer,
      startDate,
      endDate,
      venue
    } = req.body;

    const eventData = {
      title,
      description,
      category,
      registrationFee: Number(registrationFee),
      prizeAmount: Number(prizeAmount),
      maxParticipants: Number(maxParticipants),
      rules: JSON.parse(rules),
      organizer,
      startDate,
      endDate,
      venue,
      image: req.files.image ? req.files.image[0].filename : '',
      attachments: req.files.attachments ? req.files.attachments.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path
      })) : []
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (Admin/Organizer)
router.put('/:id', authenticateToken, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'attachments', maxCount: 5 }
]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const {
      title,
      description,
      category,
      registrationFee,
      prizeAmount,
      maxParticipants,
      rules,
      startDate,
      endDate,
      venue,
      isActive
    } = req.body;

    // Update fields
    event.title = title || event.title;
    event.description = description || event.description;
    event.category = category || event.category;
    event.registrationFee = registrationFee ? Number(registrationFee) : event.registrationFee;
    event.prizeAmount = prizeAmount ? Number(prizeAmount) : event.prizeAmount;
    event.maxParticipants = maxParticipants ? Number(maxParticipants) : event.maxParticipants;
    event.rules = rules ? JSON.parse(rules) : event.rules;
    event.startDate = startDate || event.startDate;
    event.endDate = endDate || event.endDate;
    event.venue = venue || event.venue;
    
    if (typeof isActive !== 'undefined') {
      event.isActive = isActive;
    }

    // Update image if provided
    if (req.files.image) {
      event.image = req.files.image[0].filename;
    }

    // Update attachments if provided
    if (req.files.attachments) {
      event.attachments = req.files.attachments.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path
      }));
    }

    await event.save();

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle event status (Admin/Organizer)
router.patch('/:id/toggle-status', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    event.isActive = !event.isActive;
    await event.save();

    res.json({ message: 'Event status updated successfully', event });
  } catch (error) {
    console.error('Toggle event status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;