import express from 'express';
import multer from 'multer';
import path from 'path';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import { authenticateToken, isOrganizer } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration for payment screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Register for events
router.post('/register', authenticateToken, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const { eventIds, upiTransactionId } = req.body;
    
    // Check if UPI transaction ID is already used
    const existingRegistration = await Registration.findOne({
      'paymentDetails.upiTransactionId': upiTransactionId
    });
    
    if (existingRegistration) {
      return res.status(400).json({ message: 'UPI Transaction ID already used' });
    }

    // Get events and calculate total amount
    const events = await Event.find({ _id: { $in: JSON.parse(eventIds) } });
    const totalAmount = events.reduce((sum, event) => sum + event.registrationFee, 0);

    const registration = new Registration({
      student: req.user.userId,
      events: events.map(event => ({ event: event._id })),
      totalAmount,
      paymentDetails: {
        upiTransactionId,
        paymentScreenshot: req.file.filename
      }
    });

    await registration.save();

    res.status(201).json({ 
      message: 'Registration submitted successfully. Awaiting verification.',
      registration 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user registrations
router.get('/my-registrations', authenticateToken, async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user.userId })
      .populate('events.event', 'title category prizeAmount')
      .sort({ createdAt: -1 });
    
    res.json(registrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get registrations for organizer's events
router.get('/organizer', authenticateToken, isOrganizer, async (req, res) => {
  try {
    const userEvents = await Event.find({ organizer: req.user.userId });
    const eventIds = userEvents.map(event => event._id);
    
    const registrations = await Registration.find({
      'events.event': { $in: eventIds }
    })
    .populate('student', 'name email college phone')
    .populate('events.event', 'title category')
    .sort({ createdAt: -1 });
    
    res.json(registrations);
  } catch (error) {
    console.error('Get organizer registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify registration (Organizer only)
router.patch('/:id/verify', authenticateToken, isOrganizer, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    const registration = await Registration.findById(req.params.id)
      .populate('events.event');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if organizer has permission for this registration
    const hasPermission = registration.events.some(reg => 
      reg.event.organizer.toString() === req.user.userId
    );
    
    if (!hasPermission) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    registration.status = status;
    registration.remarks = remarks;
    registration.verifiedBy = req.user.userId;
    registration.verificationDate = new Date();
    
    await registration.save();

    res.json({ message: 'Registration updated successfully', registration });
  } catch (error) {
    console.error('Verify registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;