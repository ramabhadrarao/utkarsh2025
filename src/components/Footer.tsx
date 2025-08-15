import React from 'react';
import { Mail, Phone, MapPin, Calendar, Users, Trophy } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Event Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-yellow-400">UTKARSH 2025</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm">September 9-11, 2025</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">₹1.5 Lakhs Total Prizes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm">By IT & DS Students</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-red-400 mt-0.5" />
                <div className="text-sm">
                  <p>Swarnandhra College of</p>
                  <p>Engineering and Technology</p>
                  <p>Seetharampuram, Narsapur</p>
                  <p>Andhra Pradesh - 534280</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="/events" className="block text-sm hover:text-blue-400 transition-colors">
                Events
              </a>
              <a href="/register" className="block text-sm hover:text-blue-400 transition-colors">
                Register
              </a>
              <a href="#rules" className="block text-sm hover:text-blue-400 transition-colors">
                Rules & Regulations
              </a>
              <a href="#prizes" className="block text-sm hover:text-blue-400 transition-colors">
                Prizes
              </a>
            </div>
          </div>

          {/* Fest Highlights */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Fest Highlights</h3>
            <div className="space-y-2 text-sm">
              <p className="text-blue-300">• Technical Competitions</p>
              <p className="text-green-300">• Non-Technical Events</p>
              <p className="text-purple-300">• 24-Hour Hackathon</p>
              <p className="text-yellow-300">• Networking Opportunities</p>
              <p className="text-pink-300">• Skill Development</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              © 2025 UTKARSH - Department of Information Technology, Swarnandhra College of Engineering and Technology
            </p>
            <p className="text-xs text-gray-500 mt-2">
              A vibrant celebration of Skill, Creativity and Teamwork!
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;