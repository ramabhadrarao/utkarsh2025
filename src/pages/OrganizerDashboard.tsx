import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Registration {
  _id: string;
  student: {
    name: string;
    email: string;
    college: string;
    phone: string;
  };
  events: Array<{
    event: {
      _id: string;
      title: string;
      category: string;
    };
  }>;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentDetails: {
    upiTransactionId: string;
    paymentScreenshot: string;
    paymentDate: string;
  };
  createdAt: string;
  remarks?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [verificationModal, setVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    status: 'pending',
    remarks: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/registrations/organizer`);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (registrationId: string, status: string, remarks: string) => {
    setSubmitting(true);
    try {
      await axios.patch(`${API_BASE_URL}/registrations/${registrationId}/verify`, {
        status,
        remarks
      });
      
      // Update local state
      setRegistrations(prev =>
        prev.map(reg =>
          reg._id === registrationId
            ? { ...reg, status: status as 'pending' | 'approved' | 'rejected', remarks }
            : reg
        )
      );
      
      setVerificationModal(false);
      setSelectedRegistration(null);
      setVerificationData({ status: 'pending', remarks: '' });
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openVerificationModal = (registration: Registration) => {
    setSelectedRegistration(registration);
    setVerificationData({
      status: registration.status,
      remarks: registration.remarks || ''
    });
    setVerificationModal(true);
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
  const pendingCount = registrations.filter(reg => reg.status === 'pending').length;
  const approvedCount = registrations.filter(reg => reg.status === 'approved').length;
  const rejectedCount = registrations.filter(reg => reg.status === 'rejected').length;

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
            Organizer Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Welcome, {user?.name}! Manage event registrations here.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{totalRegistrations}</p>
                <p className="text-gray-300 text-sm">Total Registrations</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{pendingCount}</p>
                <p className="text-gray-300 text-sm">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{approvedCount}</p>
                <p className="text-gray-300 text-sm">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{rejectedCount}</p>
                <p className="text-gray-300 text-sm">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Event Registrations</h2>
          
          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Registrations Yet</h3>
              <p className="text-gray-400">When students register for your events, they'll appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Student</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Events</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Amount</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Status</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Date</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration._id} className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
                      <td className="py-4 px-2">
                        <div>
                          <p className="text-white font-medium">{registration.student.name}</p>
                          <p className="text-gray-400 text-sm">{registration.student.email}</p>
                          <p className="text-gray-400 text-sm">{registration.student.college}</p>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="space-y-1">
                          {registration.events.map((eventReg, index) => (
                            <span key={index} className="block text-gray-300 text-sm">
                              {eventReg.event.title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-white font-semibold">₹{registration.totalAmount}</span>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-2 w-fit ${getStatusColor(registration.status)}`}>
                          {getStatusIcon(registration.status)}
                          <span>{registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}</span>
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-gray-300 text-sm">
                          {new Date(registration.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedRegistration(registration)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {registration.status === 'pending' && (
                            <button
                              onClick={() => openVerificationModal(registration)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Registration Detail Modal */}
        {selectedRegistration && !verificationModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Registration Details</h3>
                  <button
                    onClick={() => setSelectedRegistration(null)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Student Information</h4>
                    <div className="bg-white/5 rounded-lg p-4 space-y-2">
                      <p><span className="text-gray-400">Name:</span> <span className="text-white">{selectedRegistration.student.name}</span></p>
                      <p><span className="text-gray-400">Email:</span> <span className="text-white">{selectedRegistration.student.email}</span></p>
                      <p><span className="text-gray-400">College:</span> <span className="text-white">{selectedRegistration.student.college}</span></p>
                      <p><span className="text-gray-400">Phone:</span> <span className="text-white">{selectedRegistration.student.phone}</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Payment Details</h4>
                    <div className="bg-white/5 rounded-lg p-4 space-y-2">
                      <p><span className="text-gray-400">Amount:</span> <span className="text-white">₹{selectedRegistration.totalAmount}</span></p>
                      <p><span className="text-gray-400">Transaction ID:</span> <span className="text-white">{selectedRegistration.paymentDetails.upiTransactionId}</span></p>
                      <p><span className="text-gray-400">Payment Date:</span> <span className="text-white">{new Date(selectedRegistration.paymentDetails.paymentDate).toLocaleDateString()}</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Payment Screenshot</h4>
                    <div className="bg-white/5 rounded-lg p-4">
                      <img
                        src={`${API_BASE_URL.replace('/api', '')}/uploads/${selectedRegistration.paymentDetails.paymentScreenshot}`}
                        alt="Payment Screenshot"
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>

                  {selectedRegistration.remarks && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Remarks</h4>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-gray-300">{selectedRegistration.remarks}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setSelectedRegistration(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    Close
                  </button>
                  {selectedRegistration.status === 'pending' && (
                    <button
                      onClick={() => openVerificationModal(selectedRegistration)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      Verify Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Modal */}
        {verificationModal && selectedRegistration && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl max-w-md w-full">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Verify Registration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Verification Status
                    </label>
                    <select
                      value={verificationData.status}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="approved" className="bg-slate-800">Approve</option>
                      <option value="rejected" className="bg-slate-800">Reject</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Remarks (Optional)
                    </label>
                    <textarea
                      value={verificationData.remarks}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Add any remarks about the verification..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => {
                      setVerificationModal(false);
                      setSelectedRegistration(null);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleVerification(selectedRegistration._id, verificationData.status, verificationData.remarks)}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Updating...' : 'Update Status'}
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

export default OrganizerDashboard;