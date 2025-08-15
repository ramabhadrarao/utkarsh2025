// src/pages/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Trophy, DollarSign, Plus, Edit, Eye, FileText } from 'lucide-react';
import axios from 'axios';

interface Stats {
  totalStudents: number;
  totalOrganizers: number;
  totalEvents: number;
  totalRegistrations: number;
  pendingVerifications: number;
  totalRevenue: number;
  eventStats: Array<{
    eventTitle: string;
    registrations: number;
    revenue: number;
  }>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  phone?: string;
  assignedEvents: Array<{ _id: string; title: string }>;
  isActive: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateOrganizerModal, setShowCreateOrganizerModal] = useState(false);
  const [organizerFormData, setOrganizerFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/stats`),
        axios.get(`${API_BASE_URL}/admin/users`)
      ]);
      
      setStats(statsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await axios.post(`${API_BASE_URL}/admin/organizers`, organizerFormData);
      setShowCreateOrganizerModal(false);
      setOrganizerFormData({ name: '', email: '', password: '', phone: '' });
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create organizer');
    } finally {
      setSubmitting(false);
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
          <h1 className="text-4xl font-bold text-white mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Manage UTKARSH 2025 - Complete system overview and controls
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center space-x-4">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'Users' },
              { id: 'organizers', label: 'Organizers' },
              { id: 'events', label: 'Events' },
              { id: 'registrations', label: 'Registrations' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
                    <p className="text-gray-300 text-sm">Students</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-white">{stats.totalOrganizers}</p>
                    <p className="text-gray-300 text-sm">Organizers</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
                    <p className="text-gray-300 text-sm">Events</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-white">{stats.totalRegistrations}</p>
                    <p className="text-gray-300 text-sm">Registrations</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Eye className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-white">{stats.pendingVerifications}</p>
                    <p className="text-gray-300 text-sm">Pending</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-emerald-500/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-white">₹{stats.totalRevenue}</p>
                    <p className="text-gray-300 text-sm">Revenue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Statistics */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Event Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-4 px-2 text-gray-300 font-semibold">Event</th>
                      <th className="text-left py-4 px-2 text-gray-300 font-semibold">Registrations</th>
                      <th className="text-left py-4 px-2 text-gray-300 font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.eventStats.map((event, index) => (
                      <tr key={index} className="border-b border-white/10">
                        <td className="py-4 px-2 text-white">{event.eventTitle}</td>
                        <td className="py-4 px-2 text-gray-300">{event.registrations}</td>
                        <td className="py-4 px-2 text-green-400">₹{event.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">All Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Name</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Email</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Role</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">College</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(user => user.role === 'student').map((user) => (
                    <tr key={user._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4 px-2 text-white">{user.name}</td>
                      <td className="py-4 px-2 text-gray-300">{user.email}</td>
                      <td className="py-4 px-2">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-gray-300">{user.college || '-'}</td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          user.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Organizers Tab */}
        {activeTab === 'organizers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Organizers</h2>
              <button
                onClick={() => setShowCreateOrganizerModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Organizer</span>
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-4 px-2 text-gray-300 font-semibold">Name</th>
                      <th className="text-left py-4 px-2 text-gray-300 font-semibold">Email</th>
                      <th className="text-left py-4 px-2 text-gray-300 font-semibold">Phone</th>
                      <th className="text-left py-4 px-2 text-gray-300 font-semibold">Assigned Events</th>
                      <th className="text-left py-4 px-2 text-gray-300 font-semibold">Status</th>
                      <th className="text-left py-4 px-2 text-gray-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(user => user.role === 'organizer').map((organizer) => (
                      <tr key={organizer._id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-4 px-2 text-white">{organizer.name}</td>
                        <td className="py-4 px-2 text-gray-300">{organizer.email}</td>
                        <td className="py-4 px-2 text-gray-300">{organizer.phone || '-'}</td>
                        <td className="py-4 px-2">
                          <div className="space-y-1">
                            {organizer.assignedEvents.length > 0 ? (
                              organizer.assignedEvents.map((event) => (
                                <span key={event._id} className="block text-sm text-gray-300">
                                  {event.title}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">No events assigned</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            organizer.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {organizer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200">
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Event Management</h2>
                <Link
                  to="/admin/events"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Manage Events</span>
                </Link>
              </div>
              <p className="text-gray-300 mb-6">
                Create, edit, and manage all fest events from the dedicated event management page.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Events</h3>
                  <p className="text-3xl font-bold text-blue-400">{stats?.totalEvents || 0}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Active Events</h3>
                  <p className="text-3xl font-bold text-green-400">{stats?.totalEvents || 0}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Prize Pool</h3>
                  <p className="text-3xl font-bold text-yellow-400">₹1.5L</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Registration Overview</h2>
                <div className="flex space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total Registrations</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalRegistrations || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Pending Verifications</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats?.pendingVerifications || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">₹{stats?.totalRevenue || 0}</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-300">
                View and manage all student registrations from the registrations page.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">News & Announcements</h2>
                <Link
                  to="/admin/news"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Manage News</span>
                </Link>
              </div>
              <p className="text-gray-300">
                Create and manage fest announcements, updates, and important news that will be displayed on the home page.
              </p>
            </div>
          </div>
        )}

        {/* Create Organizer Modal */}
        {showCreateOrganizerModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl max-w-md w-full">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Create New Organizer</h3>
                
                <form onSubmit={handleCreateOrganizer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={organizerFormData.name}
                      onChange={(e) => setOrganizerFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter organizer's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={organizerFormData.email}
                      onChange={(e) => setOrganizerFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={organizerFormData.password}
                      onChange={(e) => setOrganizerFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Create a password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={organizerFormData.phone}
                      onChange={(e) => setOrganizerFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number (optional)"
                    />
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setShowCreateOrganizerModal(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Creating...' : 'Create Organizer'}
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

export default AdminDashboard;