import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import News from '../models/News.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalOrganizers = await User.countDocuments({ role: 'organizer', isActive: true });
    const totalEvents = await Event.countDocuments({ isActive: true });
    const totalRegistrations = await Registration.countDocuments();
    const pendingVerifications = await Registration.countDocuments({ status: 'pending' });
    
    // Revenue calculation
    const approvedRegistrations = await Registration.find({ status: 'approved' });
    const totalRevenue = approvedRegistrations.reduce((sum, reg) => sum + reg.totalAmount, 0);

    // Event-wise registrations
    const eventStats = await Registration.aggregate([
      { $unwind: '$events' },
      { 
        $group: {
          _id: '$events.event',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $project: {
          eventTitle: '$event.title',
          registrations: '$count',
          revenue: 1
        }
      }
    ]);

    res.json({
      totalStudents,
      totalOrganizers,
      totalEvents,
      totalRegistrations,
      pendingVerifications,
      totalRevenue,
      eventStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role, isActive: true } : { isActive: true };
    
    const users = await User.find(filter)
      .select('-password')
      .populate('assignedEvents', 'title')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create organizer
router.post('/organizers', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const organizer = new User({
      name,
      email,
      password,
      phone,
      role: 'organizer'
    });

    await organizer.save();

    res.status(201).json({ 
      message: 'Organizer created successfully',
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        role: organizer.role
      }
    });
  } catch (error) {
    console.error('Create organizer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign events to organizer
router.patch('/organizers/:id/assign-events', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { eventIds } = req.body;
    
    const organizer = await User.findByIdAndUpdate(
      req.params.id,
      { assignedEvents: eventIds },
      { new: true }
    ).populate('assignedEvents', 'title');

    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Update events to have this organizer
    await Event.updateMany(
      { _id: { $in: eventIds } },
      { organizer: organizer._id }
    );

    res.json({ message: 'Events assigned successfully', organizer });
  } catch (error) {
    console.error('Assign events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all registrations
router.get('/registrations', authenticateToken, isAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('student', 'name email college')
      .populate('events.event', 'title category')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(registrations);
  } catch (error) {
    console.error('Get all registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;