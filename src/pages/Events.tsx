import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Users, MapPin, Clock, FileText } from 'lucide-react';
import axios from 'axios';

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  registrationFee: number;
  prizeAmount: number;
  maxParticipants: number;
  rules: string[];
  organizer: {
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  venue: string;
  attachments: Array<{
    filename: string;
    originalName: string;
    path: string;
  }>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'hackathon':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'non-technical':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            UTKARSH 2025 Events
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Discover amazing competitions and challenges across multiple categories
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4">
            {['all', 'technical', 'non-technical', 'hackathon'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 capitalize ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category === 'all' ? 'All Events' : category.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image ? `${API_BASE_URL.replace('/api', '')}/uploads/${event.image}` : 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg'}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getCategoryColor(event.category)}`}>
                    {event.category.replace('-', ' ')}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    <Trophy className="w-4 h-4 inline mr-1" />
                    ₹{event.prizeAmount}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.venue}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    Max {event.maxParticipants} participants
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <p className="text-gray-400">Registration Fee</p>
                    <p className="text-white font-semibold">₹{event.registrationFee}</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Events Found</h3>
            <p className="text-gray-400">Try selecting a different category.</p>
          </div>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <img
                  src={selectedEvent.image ? `${API_BASE_URL.replace('/api', '')}/uploads/${selectedEvent.image}` : 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg'}
                  alt={selectedEvent.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-4 py-2 rounded-full font-semibold border ${getCategoryColor(selectedEvent.category)}`}>
                    {selectedEvent.category.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <h2 className="text-3xl font-bold text-white mb-4">{selectedEvent.title}</h2>
                <p className="text-gray-300 mb-6">{selectedEvent.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="w-5 h-5 mr-3 text-blue-400" />
                        <span>{new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-5 h-5 mr-3 text-red-400" />
                        <span>{selectedEvent.venue}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="w-5 h-5 mr-3 text-green-400" />
                        <span>Max {selectedEvent.maxParticipants} participants</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Trophy className="w-5 h-5 mr-3 text-yellow-400" />
                        <span>Prize Money: ₹{selectedEvent.prizeAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Organizer</h3>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white font-medium">{selectedEvent.organizer.name}</p>
                      <p className="text-gray-400">{selectedEvent.organizer.email}</p>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-white font-medium mb-2">Registration Fee</h4>
                      <p className="text-2xl font-bold text-green-400">₹{selectedEvent.registrationFee}</p>
                    </div>
                  </div>
                </div>

                {/* Rules */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Rules & Regulations
                  </h3>
                  <div className="bg-white/5 rounded-lg p-6">
                    <ul className="space-y-2">
                      {selectedEvent.rules.map((rule, index) => (
                        <li key={index} className="text-gray-300 flex items-start">
                          <span className="text-blue-400 mr-2">{index + 1}.</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Attachments */}
                {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Attachments</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedEvent.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={`${API_BASE_URL.replace('/api', '')}/uploads/${attachment.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                        >
                          <FileText className="w-5 h-5 text-blue-400 mr-3" />
                          <span className="text-gray-300">{attachment.originalName}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;