import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/utkarsh2025');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@utkarsh2025.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@utkarsh2025.com');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@utkarsh2025.com',
      password: 'admin123456', // This will be hashed automatically
      role: 'admin',
      college: 'Swarnandhra College of Engineering and Technology',
      phone: '9999999999',
      isActive: true
    });

    await adminUser.save();

    console.log('Admin user created successfully!');
    console.log('=====================================');
    console.log('Admin Credentials:');
    console.log('Email: admin@utkarsh2025.com');
    console.log('Password: admin123456');
    console.log('=====================================');
    console.log('Please change the password after first login!');

    // Create some sample organizers
    const organizers = [
      {
        name: 'Technical Event Organizer',
        email: 'tech.organizer@utkarsh2025.com',
        password: 'organizer123',
        role: 'organizer',
        college: 'Swarnandhra College of Engineering and Technology',
        phone: '9876543210',
        isActive: true
      },
      {
        name: 'Non-Tech Event Organizer',
        email: 'nontech.organizer@utkarsh2025.com',
        password: 'organizer123',
        role: 'organizer',
        college: 'Swarnandhra College of Engineering and Technology',
        phone: '9876543211',
        isActive: true
      },
      {
        name: 'Hackathon Organizer',
        email: 'hackathon.organizer@utkarsh2025.com',
        password: 'organizer123',
        role: 'organizer',
        college: 'Swarnandhra College of Engineering and Technology',
        phone: '9876543212',
        isActive: true
      }
    ];

    for (const organizerData of organizers) {
      const existingOrganizer = await User.findOne({ email: organizerData.email });
      if (!existingOrganizer) {
        const organizer = new User(organizerData);
        await organizer.save();
        console.log(`Organizer created: ${organizerData.email}`);
      }
    }

    console.log('\nOrganizer Credentials:');
    console.log('Tech Organizer - Email: tech.organizer@utkarsh2025.com, Password: organizer123');
    console.log('Non-Tech Organizer - Email: nontech.organizer@utkarsh2025.com, Password: organizer123');
    console.log('Hackathon Organizer - Email: hackathon.organizer@utkarsh2025.com, Password: organizer123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

// Run the seeder
seedAdmin();