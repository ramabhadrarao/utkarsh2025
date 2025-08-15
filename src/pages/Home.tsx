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
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images Slider */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-30' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Hero ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-purple-900/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="space-y-8">
            {/* Main Title */}
            <div>
              <h1 
                className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse"
                style={{ fontFamily: 'Saman, serif' }}
              >
                UTKARSH 2025
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 font-light">
                ....by the students of IT and DS
              </p>
            </div>

            {/* Subtitle */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                A Three Day National Technical Fest
              </h2>
              <p className="text-xl md:text-2xl text-blue-200 font-medium">
                A vibrant celebration of Skill, Creativity and Teamwork!
              </p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Calendar className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">Event Dates</h3>
                <p className="text-blue-200">9th, 10th & 11th September 2025</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Trophy className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">Total Prizes</h3>
                <p className="text-green-300 text-xl font-bold">₹1.5 LAKHS</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <MapPin className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">Venue</h3>
                <p className="text-blue-200">Swarnandhra College of Engineering</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <p className="text-lg text-gray-300">
                Join us for an exciting lineup of events including technical, non-technical and 24-Hour Hackathon
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  Register Now
                </Link>
                <Link
                  to="/events"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  View Events
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-ping"></div>
          </div>
        </div>
      </section>

      {/* Latest News Ticker */}
      {news.length > 0 && (
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold mr-6 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                LATEST NEWS
              </div>
              <div className="overflow-hidden flex-1">
                <div className="animate-marquee whitespace-nowrap">
                  {news.map((item, index) => (
                    <span key={item._id} className="text-white mx-8">
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

      {/* Featured Events */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-gray-300">
              Discover amazing competitions and challenges waiting for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event._id} className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image ? `${API_BASE_URL.replace('/api', '')}/uploads/${event.image}` : 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      event.category === 'technical' ? 'bg-blue-500 text-white' :
                      event.category === 'hackathon' ? 'bg-purple-500 text-white' :
                      'bg-green-500 text-white'
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
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/events"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
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
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Participate in UTKARSH 2025?
            </h2>
            <p className="text-xl text-gray-300">
              More than just a fest - it's your gateway to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300">
                <Star className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Skill Enhancement</h3>
              <p className="text-gray-300">
                Challenge yourself with cutting-edge technical competitions and expand your knowledge horizons
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300">
                <Users className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Networking</h3>
              <p className="text-gray-300">
                Connect with like-minded individuals, industry experts, and potential collaborators
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300">
                <Target className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Career Growth</h3>
              <p className="text-gray-300">
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