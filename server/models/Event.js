import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'non-technical', 'hackathon']
  },
  image: {
    type: String,
    required: true
  },
  registrationFee: {
    type: Number,
    required: true,
    min: 0
  },
  prizeAmount: {
    type: Number,
    required: true,
    min: 0
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  rules: [{
    type: String,
    required: true
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Event', eventSchema);