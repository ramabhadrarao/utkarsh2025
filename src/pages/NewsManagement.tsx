// src/pages/NewsManagement.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Clock } from 'lucide-react';
import axios from 'axios';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  image?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const NewsManagement: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: '0'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/all`);
      setNews(response.data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      priority: newsItem.priority.toString()
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (newsId: string) => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      try {
        await axios.delete(`${API_BASE_URL}/news/${newsId}`);
        fetchNews();
      } catch (error) {
        console.error('Failed to delete news:', error);
        alert('Failed to delete news item');
      }
    }
  };

  const handleToggleStatus = async (newsId: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/news/${newsId}/toggle-status`);
      fetchNews();
    } catch (error) {
      console.error('Failed to toggle news status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('priority', formData.priority);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editMode && selectedNews) {
        await axios.put(`${API_BASE_URL}/news/${selectedNews._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`${API_BASE_URL}/news`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowModal(false);
      resetForm();
      fetchNews();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save news');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: '0'
    });
    setImageFile(null);
    setEditMode(false);
    setSelectedNews(null);
    setError('');
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
            <h1 className="text-4xl font-bold text-white mb-2">News Management</h1>
            <p className="text-gray-300">Manage fest announcements and updates</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create News</span>
          </button>
        </div>

        {/* News Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          {news.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No News Yet</h3>
              <p className="text-gray-400">Create your first news item to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Title</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Content</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Priority</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Status</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Created</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((item) => (
                    <tr key={item._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4 px-2">
                        <p className="text-white font-medium">{item.title}</p>
                      </td>
                      <td className="py-4 px-2">
                        <p className="text-gray-300 text-sm line-clamp-2 max-w-md">{item.content}</p>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(item.priority || 1)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <button
                          onClick={() => handleToggleStatus(item._id)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.isActive 
                              ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                              : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          } transition-colors duration-200`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4 px-2 text-gray-300 text-sm">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
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
            <div className="bg-slate-800 rounded-xl max-w-2xl w-full">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {editMode ? 'Edit News' : 'Create News'}
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter news title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content *
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter news content"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0" className="bg-slate-800">Normal</option>
                        <option value="1" className="bg-slate-800">High (★)</option>
                        <option value="2" className="bg-slate-800">Very High (★★)</option>
                        <option value="3" className="bg-slate-800">Urgent (★★★)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
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
                      {submitting ? 'Saving...' : editMode ? 'Update News' : 'Create News'}
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

export default NewsManagement;