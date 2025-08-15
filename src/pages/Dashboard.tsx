import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, User, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Registration {
  _id: string;
  events: Array<{
    event: {
      _id: string;
      title: string;
      category: string;
      prizeAmount: number;
    };
    registrationDate: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentDetails: {
    upiTransactionId: string;
    paymentDate: string;
  };
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/registrations/my-registrations`);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    }
  };

  const totalRegistrations = registrations.length;
  const approvedRegistrations = registrations.filter(reg => reg.status === 'approved').length;
  const pendingRegistrations = registrations.filter(reg => reg.status === 'pending').length;
  const totalSpent = registrations.reduce((sum, reg) => reg.status === 'approved' ? sum + reg.totalAmount : sum, 0);

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
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xl text-gray-300">
            Track your UTKARSH 2025 registrations and participate in amazing events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{totalRegistrations}</p>
                <p className="text-gray-300 text-sm">Total Registrations</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{approvedRegistrations}</p>
                <p className="text-gray-300 text-sm">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{pendingRegistrations}</p>
                <p className="text-gray-300 text-sm">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">₹{totalSpent}</p>
                <p className="text-gray-300 text-sm">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/events"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Explore Events</h3>
                  <p className="text-blue-100">Discover all available competitions and events</p>
                </div>
                <Trophy className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
            </Link>

            <Link
              to="/register-events"
              className="group bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 p-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Register for Events</h3>
                  <p className="text-green-100">Select and register for multiple events at once</p>
                </div>
                <User className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
            </Link>
          </div>
        </div>

        {/* My Registrations */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">My Registrations</h2>
          
          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Registrations Yet</h3>
              <p className="text-gray-400 mb-6">You haven't registered for any events yet.</p>
              <Link
                to="/register-events"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Register Now
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {registrations.map((registration) => (
                <div key={registration._id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(registration.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(registration.status)}`}>
                        {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">₹{registration.totalAmount}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(registration.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Registered Events:</h4>
                      <div className="space-y-1">
                        {registration.events.map((eventReg, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">{eventReg.event.title}</span>
                            <span className="text-yellow-400">₹{eventReg.event.prizeAmount}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Payment Details:</h4>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-300">
                          Transaction ID: <span className="text-white">{registration.paymentDetails.upiTransactionId}</span>
                        </p>
                        <p className="text-gray-300">
                          Payment Date: <span className="text-white">
                            {new Date(registration.paymentDetails.paymentDate).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;