import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Users, MapPin, ArrowRight, Star, Zap, Target } from 'lucide-react';
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

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample hero images (you can replace with actual images)
  const heroImages = [
    'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg',
    'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg',
    'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg'
  ];

  useEffect(() => {
    fetchEvents();
    fetchNews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      setEvents(response.data.slice(0, 6)); // Show only 6 events on home page
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news`);
      setNews(response.data.slice(0, 5)); // Show latest 5 news items
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Latest News Ticker */}
      {news.length > 0 && (
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-3 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="bg-white text-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold mr-4 sm:mr-6 flex items-center shadow-lg min-w-fit">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-pulse" />
                <span className="text-xs sm:text-sm">LATEST</span>
              </div>
              <div className="overflow-hidden flex-1">
                <div className="animate-marquee whitespace-nowrap">
                  {news.map((item, index) => (
                    <span key={item._id} className="text-white text-sm sm:text-base mx-6 sm:mx-8">
                      {item.title}
                      {index < news.length - 1 && " • "}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section - Fixed for Mobile */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full h-full object-cover"
          >
            <source src="https://swarnandhra.ac.in/utkarsh2024/assets/video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Optimized overlay for better text visibility on all devices */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-purple-900/70"></div>
        </div>

        {/* Hero Content - Improved Mobile Layout */}
        <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-7xl mx-auto">
          <div className="space-y-6 sm:space-y-8">
            {/* Main Title - Now visible on mobile */}
            <div className="animate-fade-in-up">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-3 sm:mb-4">
                <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse title-saman leading-tight">
                  UTKARSH 2025
                </span>
              
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-gray-200 font-light italic">
                ....by the students of IT and DS
              </p>
            </div>

            {/* Subtitle */}
            <div className="space-y-3 sm:space-y-4 animate-fade-in-up animation-delay-200">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                A Three Day National Technical Fest
              </h2>
              <p className="text-base sm:text-xl md:text-2xl text-blue-200 font-medium px-2">
                A vibrant celebration of Skill, Creativity and Teamwork!
              </p>
            </div>

            {/* Event Details Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 my-8 sm:my-12 animate-fade-in-up animation-delay-400">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <Calendar className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Event Dates</h3>
                <p className="text-blue-200 text-sm sm:text-base">Sept 9-11, 2025</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <Trophy className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Total Prizes</h3>
                <p className="text-green-300 text-lg sm:text-xl font-bold">₹1.5 LAKHS</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <MapPin className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Venue</h3>
                <p className="text-blue-200 text-sm sm:text-base">Swarnandhra College</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-4 animate-fade-in-up animation-delay-600">
              <p className="text-sm sm:text-lg text-gray-200 px-4 max-w-3xl mx-auto">
                Join us for an exciting lineup of technical, non-technical events and 24-Hour Hackathon
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-orange-500/25"
                >
                  Register Now
                </Link>
                <Link
                  to="/events"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105"
                >
                  View Events
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-ping"></div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Featured Events
            </h2>
            <p className="text-lg sm:text-xl text-gray-300">
              Discover amazing competitions and challenges waiting for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div 
                key={event._id} 
                className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image ? `${API_BASE_URL.replace('/api', '')}/uploads/${event.image}` : 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-md ${
                      event.category === 'technical' ? 'bg-blue-500/80 text-white' :
                      event.category === 'hackathon' ? 'bg-purple-500/80 text-white' :
                      'bg-green-500/80 text-white'
                    }`}>
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                      <p>Registration: ₹{event.registrationFee}</p>
                      <p className="text-yellow-400 font-semibold">Prize: ₹{event.prizeAmount}</p>
                    </div>
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group">
                      <span>View</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/events"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 shadow-xl hover:shadow-2xl"
            >
              <span>View All Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Participate Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Why Participate in UTKARSH 2025?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300">
              More than just a fest - it's your gateway to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group animate-fade-in-up">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110 transform">
                <Star className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Skill Enhancement</h3>
              <p className="text-gray-300 px-4">
                Challenge yourself with cutting-edge technical competitions and expand your knowledge horizons
              </p>
            </div>
            <div className="text-center group animate-fade-in-up animation-delay-200">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110 transform">
                <Users className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Networking</h3>
              <p className="text-gray-300 px-4">
                Connect with like-minded individuals, industry experts, and potential collaborators
              </p>
            </div>
            <div className="text-center group animate-fade-in-up animation-delay-400">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110 transform">
                <Target className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Career Growth</h3>
              <p className="text-gray-300 px-4">
                Gain recognition, win prizes, and boost your resume with prestigious achievements
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;