import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import { itineraryApiService } from '../api/itineraryApiService';
import { bucketListService } from '../api/bucketListService';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('itineraries'); // 'itineraries', 'bucketlist', 'preferences'
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [bucketList, setBucketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBucketItem, setNewBucketItem] = useState({ destination: '', notes: '', priority: 'medium' });
  const [showAddBucketItem, setShowAddBucketItem] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSavedItineraries(),
        loadBucketList(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedItineraries = async () => {
    try {
      const response = await itineraryApiService.getUserItineraries();
      if (response.success) {
        setSavedItineraries(response.data.itineraries || []);
      }
    } catch (error) {
      console.error('Error loading saved itineraries:', error);
    }
  };

  const loadBucketList = async () => {
    try {
      const response = await bucketListService.getBucketList();
      if (response.success) {
        setBucketList(response.data.items || []);
      }
    } catch (error) {
      console.error('Error loading bucket list:', error);
    }
  };

  const handleAddBucketItem = async (e) => {
    e.preventDefault();
    if (!newBucketItem.destination.trim()) {
      alert('Please enter a destination');
      return;
    }

    try {
      const response = await bucketListService.addItem(newBucketItem);
      if (response.success) {
        setNewBucketItem({ destination: '', notes: '', priority: 'medium' });
        setShowAddBucketItem(false);
        loadBucketList();
        alert('Item added to bucket list!');
      }
    } catch (error) {
      console.error('Error adding bucket list item:', error);
      alert(error.message || 'Failed to add item. Please try again.');
    }
  };

  const handleToggleComplete = async (itemId, isCompleted) => {
    try {
      const response = await bucketListService.updateItem(itemId, { isCompleted: !isCompleted });
      if (response.success) {
        loadBucketList();
      }
    } catch (error) {
      console.error('Error updating bucket list item:', error);
      alert(error.message || 'Failed to update item. Please try again.');
    }
  };

  const handleDeleteBucketItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item from your bucket list?')) {
      return;
    }

    try {
      const response = await bucketListService.deleteItem(itemId);
      if (response.success) {
        loadBucketList();
        alert('Item deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting bucket list item:', error);
      alert(error.message || 'Failed to delete item. Please try again.');
    }
  };

  const handleDeleteItinerary = async (itineraryId) => {
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    try {
      const response = await itineraryApiService.deleteItinerary(itineraryId);
      if (response.success) {
        loadSavedItineraries();
        alert('Itinerary deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      alert(error.message || 'Failed to delete itinerary. Please try again.');
    }
  };

  if (!isAuthenticated) {
    history.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Back/Home buttons */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => history.goBack()}
              className="group inline-flex items-center px-4 py-2 text-indigo-600 font-bold hover:text-indigo-700 rounded-xl hover:bg-indigo-50 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={() => history.push('/')}
              className="inline-flex items-center px-4 py-2 text-gray-600 font-bold hover:text-indigo-600 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">My Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-gray-900">{user?.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('itineraries')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'itineraries'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Saved Itineraries ({savedItineraries.length})
              </button>
              <button
                onClick={() => setActiveTab('bucketlist')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'bucketlist'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bucket List ({bucketList.length})
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'preferences'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Preferences
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Saved Itineraries Tab */}
            {activeTab === 'itineraries' && (
              <div>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading itineraries...</p>
                  </div>
                ) : savedItineraries.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 mb-2">No saved itineraries yet</p>
                    <button
                      onClick={() => history.push('/itinerary')}
                      className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Create Itinerary
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedItineraries.map((itinerary) => (
                      <div key={itinerary._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-lg text-gray-900 mb-2">{itinerary.title || itinerary.destination}</h4>
                        <p className="text-gray-600 mb-3">{itinerary.destination}</p>
                        {itinerary.itinerary?.days && (
                          <p className="text-sm text-gray-500 mb-4">
                            {itinerary.itinerary.days.length} {itinerary.itinerary.days.length === 1 ? 'day' : 'days'}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => history.push(`/itinerary/view/${itinerary._id}`)}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteItinerary(itinerary._id)}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bucket List Tab */}
            {activeTab === 'bucketlist' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">My Bucket List</h3>
                  <button
                    onClick={() => setShowAddBucketItem(!showAddBucketItem)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    {showAddBucketItem ? 'Cancel' : '+ Add Item'}
                  </button>
                </div>

                {showAddBucketItem && (
                  <form onSubmit={handleAddBucketItem} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
                      <input
                        type="text"
                        value={newBucketItem.destination}
                        onChange={(e) => setNewBucketItem({ ...newBucketItem, destination: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Paris, Tokyo, Bali"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={newBucketItem.notes}
                        onChange={(e) => setNewBucketItem({ ...newBucketItem, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows="3"
                        placeholder="Add any notes about this destination..."
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={newBucketItem.priority}
                        onChange={(e) => setNewBucketItem({ ...newBucketItem, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Add to Bucket List
                    </button>
                  </form>
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading bucket list...</p>
                  </div>
                ) : bucketList.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-600 mb-2">Your bucket list is empty</p>
                    <p className="text-sm text-gray-500">Add destinations you want to visit!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bucketList.map((item) => (
                      <div
                        key={item._id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          item.isCompleted
                            ? 'bg-green-50 border-green-200 opacity-75'
                            : item.priority === 'high'
                            ? 'bg-red-50 border-red-200'
                            : item.priority === 'medium'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <input
                                type="checkbox"
                                checked={item.isCompleted}
                                onChange={() => handleToggleComplete(item._id, item.isCompleted)}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <h4 className={`font-bold text-lg ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {item.destination}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {item.priority}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-gray-600 text-sm ml-8 mb-2">{item.notes}</p>
                            )}
                            {item.isCompleted && item.completedAt && (
                              <p className="text-xs text-gray-500 ml-8">
                                Completed on {new Date(item.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteBucketItem(item._id)}
                            className="ml-4 px-3 py-1 text-red-600 hover:bg-red-100 rounded transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Trip Preferences</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Default Preferences</h4>
                    <p className="text-sm text-gray-600">
                      Your trip preferences are saved with each itinerary you create. 
                      You can customize them when building a new trip.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Common Preferences</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Budget: Moderate</li>
                      <li>• Activity Level: Moderate</li>
                      <li>• Travel Group: Solo</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

