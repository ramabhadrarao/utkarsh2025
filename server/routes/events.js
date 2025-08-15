import express from 'express';
import multer from 'multer';
import path from 'path';
import Event from '../models/Event.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

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

// Get all active events
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

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');
    
    if (!event || !event.isActive) {
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

export default router;