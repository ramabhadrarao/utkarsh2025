// src/pages/EventManagement.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, MapPin, Trophy, Users } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

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
    _id: string;
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
  isActive: boolean;
}

interface Organizer {
  _id: string;
  name: string;
  email: string;
  assignedEvents: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const EventManagement: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical',
    registrationFee: '',
    prizeAmount: '',
    maxParticipants: '',
    rules: [''],
    startDate: '',
    endDate: '',
    venue: '',
    organizer: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchOrganizers();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/all`);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users?role=organizer`);
      setOrganizers(response.data);
    } catch (error) {
      console.error('Failed to fetch organizers:', error);
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      registrationFee: event.registrationFee.toString(),
      prizeAmount: event.prizeAmount.toString(),
      maxParticipants: event.maxParticipants.toString(),
      rules: event.rules,
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      venue: event.venue,
      organizer: event.organizer._id
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`${API_BASE_URL}/events/${eventId}`);
        fetchEvents();
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('registrationFee', formData.registrationFee);
      formDataToSend.append('prizeAmount', formData.prizeAmount);
      formDataToSend.append('maxParticipants', formData.maxParticipants);
      formDataToSend.append('rules', JSON.stringify(formData.rules.filter(rule => rule.trim())));
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('venue', formData.venue);
      formDataToSend.append('organizer', formData.organizer);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      attachmentFiles.forEach(file => {
        formDataToSend.append('attachments', file);
      });

      if (editMode && selectedEvent) {
        await axios.put(`${API_BASE_URL}/events/${selectedEvent._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`${API_BASE_URL}/events`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'technical',
      registrationFee: '',
      prizeAmount: '',
      maxParticipants: '',
      rules: [''],
      startDate: '',
      endDate: '',
      venue: '',
      organizer: ''
    });
    setImageFile(null);
    setAttachmentFiles([]);
    setEditMode(false);
    setSelectedEvent(null);
    setError('');
  };

  const addRule = () => {
    setFormData(prev => ({ ...prev, rules: [...prev.rules, ''] }));
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Event Management</h1>
            <p className="text-gray-300">Create and manage fest events</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        </div>

        {/* Events Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Events Yet</h3>
              <p className="text-gray-400">Create your first event to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Event</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Category</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Dates</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Venue</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Fee</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Prize</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Status</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4 px-2">
                        <div>
                          <p className="text-white font-medium">{event.title}</p>
                          <p className="text-gray-400 text-sm">by {event.organizer.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          event.category === 'technical' ? 'bg-blue-500/20 text-blue-300' :
                          event.category === 'hackathon' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {event.category}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-gray-300 text-sm">
                        {new Date(event.startDate).toLocaleDateString()} -<br/>
                        {new Date(event.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-2 text-gray-300">{event.venue}</td>
                      <td className="py-4 px-2 text-white">₹{event.registrationFee}</td>
                      <td className="py-4 px-2 text-yellow-400">₹{event.prizeAmount}</td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          event.isActive 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {event.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(event._id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {editMode ? 'Edit Event' : 'Create New Event'}
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter event title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="technical" className="bg-slate-800">Technical</option>
                        <option value="non-technical" className="bg-slate-800">Non-Technical</option>
                        <option value="hackathon" className="bg-slate-800">Hackathon</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter event description"
                    />
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Registration Fee (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.registrationFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prize Amount (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.prizeAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, prizeAmount: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Participants *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  {/* Date and Venue */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Venue *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.venue}
                        onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter venue"
                      />
                    </div>
                  </div>

                  {/* Organizer Assignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assign Organizer *
                    </label>
                    <select
                      required
                      value={formData.organizer}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" className="bg-slate-800">Select an organizer</option>
                      {organizers.map((org) => (
                        <option key={org._id} value={org._id} className="bg-slate-800">
                          {org.name} ({org.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rules */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rules & Regulations *
                    </label>
                    <div className="space-y-2">
                      {formData.rules.map((rule, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={rule}
                            onChange={(e) => updateRule(index, e.target.value)}
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Rule ${index + 1}`}
                          />
                          {formData.rules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRule(index)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addRule}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                      >
                        + Add Rule
                      </button>
                    </div>
                  </div>

                  {/* Files */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Event Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Attachments
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setAttachmentFiles(Array.from(e.target.files || []))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Saving...' : editMode ? 'Update Event' : 'Create Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;