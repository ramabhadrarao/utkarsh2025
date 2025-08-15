import React, { useState, useEffect } from 'react';
import { Check, Upload, Smartphone, QrCode } from 'lucide-react';
import axios from 'axios';

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  registrationFee: number;
  prizeAmount: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const EventRegistration: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // UPI Payment Details
  const upiId = "utkarsh2025@paytm"; // Replace with actual UPI ID
  const upiNumber = "9876543210"; // Replace with actual phone number

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

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const getTotalAmount = () => {
    return events
      .filter(event => selectedEvents.includes(event._id))
      .reduce((sum, event) => sum + event.registrationFee, 0);
  };

  const getSelectedEventDetails = () => {
    return events.filter(event => selectedEvents.includes(event._id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('File size should be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload only image files');
        return;
      }
      setPaymentScreenshot(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!paymentScreenshot) {
      setError('Please upload payment screenshot');
      setSubmitting(false);
      return;
    }

    if (!upiTransactionId.trim()) {
      setError('Please enter UPI transaction ID');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('eventIds', JSON.stringify(selectedEvents));
      formData.append('upiTransactionId', upiTransactionId);
      formData.append('paymentScreenshot', paymentScreenshot);

      await axios.post(`${API_BASE_URL}/registrations/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Registration submitted successfully! Awaiting verification.');
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const generateUpiLink = () => {
    const amount = getTotalAmount();
    return `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=UTKARSH2025 Event Registration`;
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Event Registration</h1>
          <p className="text-gray-300">Select events and complete your registration</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              {stepNum < 4 && (
                <div
                  className={`w-16 h-1 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          {/* Step 1: Event Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Select Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {events.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => handleEventToggle(event._id)}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedEvents.includes(event._id)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                        <p className="text-sm text-gray-300 mb-2">{event.category}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedEvents.includes(event._id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-white/40'
                      }`}>
                        {selectedEvents.includes(event._id) && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-yellow-400">Prize: ₹{event.prizeAmount}</span>
                      <span className="text-white font-semibold">Fee: ₹{event.registrationFee}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedEvents.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-semibold mb-2">Selected Events Summary:</h3>
                  <div className="space-y-1">
                    {getSelectedEventDetails().map((event) => (
                      <div key={event._id} className="flex justify-between text-sm">
                        <span className="text-gray-300">{event.title}</span>
                        <span className="text-white">₹{event.registrationFee}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/20 mt-2 pt-2 flex justify-between font-semibold">
                    <span className="text-white">Total Amount:</span>
                    <span className="text-green-400">₹{getTotalAmount()}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedEvents.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Information */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Payment Information</h2>
              
              <div className="bg-white/5 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Smartphone className="w-5 h-5 text-blue-400 mr-2" />
                        <span className="text-white font-medium">GPay/PhonePe/Paytm</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">UPI ID:</p>
                      <p className="text-white font-mono bg-white/5 p-2 rounded border-dashed border border-white/20">
                        {upiId}
                      </p>
                      <p className="text-gray-300 text-sm mt-2 mb-2">Mobile Number:</p>
                      <p className="text-white font-mono bg-white/5 p-2 rounded border-dashed border border-white/20">
                        {upiNumber}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <QrCode className="w-5 h-5 text-green-400 mr-2" />
                        <span className="text-white font-medium">Total Amount</span>
                      </div>
                      <p className="text-3xl font-bold text-green-400 mb-2">₹{getTotalAmount()}</p>
                      <a
                        href={generateUpiLink()}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 inline-block"
                      >
                        Pay with UPI App
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <h4 className="text-yellow-300 font-semibold mb-2">Payment Instructions:</h4>
                <ol className="text-gray-300 text-sm space-y-1">
                  <li>1. Use the UPI ID or mobile number above to make the payment</li>
                  <li>2. Enter the exact amount: ₹{getTotalAmount()}</li>
                  <li>3. Take a screenshot of the successful payment</li>
                  <li>4. Note down your UPI transaction ID</li>
                  <li>5. Upload the screenshot and transaction ID in the next step</li>
                </ol>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  I've Made the Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Proof */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Upload Payment Proof</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    UPI Transaction ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={upiTransactionId}
                    onChange={(e) => setUpiTransactionId(e.target.value)}
                    placeholder="Enter your UPI transaction ID"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    This is usually a 12-digit number starting with your bank's code
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Screenshot *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="screenshot-upload"
                      required
                    />
                    <label
                      htmlFor="screenshot-upload"
                      className="flex items-center justify-center w-full p-6 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors duration-200"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        {paymentScreenshot ? (
                          <p className="text-green-400">{paymentScreenshot.name}</p>
                        ) : (
                          <>
                            <p className="text-gray-300">Click to upload payment screenshot</p>
                            <p className="text-gray-500 text-sm">PNG, JPG up to 2MB</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-semibold mb-2">Registration Summary:</h4>
                  <div className="space-y-2">
                    {getSelectedEventDetails().map((event) => (
                      <div key={event._id} className="flex justify-between text-sm">
                        <span className="text-gray-300">{event.title}</span>
                        <span className="text-white">₹{event.registrationFee}</span>
                      </div>
                    ))}
                    <div className="border-t border-blue-500/30 pt-2 flex justify-between font-semibold">
                      <span className="text-white">Total Paid:</span>
                      <span className="text-green-400">₹{getTotalAmount()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Registration'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Registration Submitted!</h2>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
                <p className="text-green-200 mb-4">{success}</p>
                <div className="text-sm text-gray-300">
                  <p>Your registration has been submitted for verification.</p>
                  <p>You will be notified once the payment is verified by our team.</p>
                  <p className="mt-2 font-medium">Transaction ID: {upiTransactionId}</p>
                </div>
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedEvents([]);
                    setPaymentScreenshot(null);
                    setUpiTransactionId('');
                    setSuccess('');
                    setError('');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Register for More Events
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;