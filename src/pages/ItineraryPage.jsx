import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import { itineraryApiService } from '../api/itineraryApiService';
import TripBuilder from '../components/TripBuilder/TripBuilder';
import ItineraryModal from '../components/ItineraryModal';

const ItineraryPage = () => {
  const { isAuthenticated } = useAuth();
  const history = useHistory();
  const [showTripBuilder, setShowTripBuilder] = useState(false);
  const [sampleItineraries, setSampleItineraries] = useState([]);
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingItinerary, setLoadingItinerary] = useState(false);

  useEffect(() => {
    loadSampleItineraries();
    if (isAuthenticated) {
      loadSavedItineraries();
    }
  }, [isAuthenticated]);

  const loadSampleItineraries = async () => {
    try {
      setLoading(true);
      const response = await itineraryApiService.getSampleItineraries();
      if (response.success) {
        setSampleItineraries(response.data.itineraries || []);
      }
    } catch (error) {
      console.error('Error loading sample itineraries:', error);
      // If API fails, show hardcoded samples as fallback
      setSampleItineraries([]);
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

  const handleSaveItinerary = async (itinerary) => {
    if (!isAuthenticated) {
      alert('Please login to save itineraries');
      return;
    }

    const itineraryId = itinerary._id || itinerary.id;
    setSaving({ ...saving, [itineraryId]: true });

    try {
      const itineraryData = {
        destination: itinerary.destination,
        title: itinerary.title || `Trip to ${itinerary.destination}`,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        tripType: itinerary.tripType,
        budget: itinerary.budget,
        activityLevel: itinerary.activityLevel,
        travelGroup: itinerary.travelGroup,
        interests: itinerary.interests || [],
        itinerary: itinerary.itinerary,
        selectedRecommendations: itinerary.selectedRecommendations || [],
      };

      const response = await itineraryApiService.saveItinerary(itineraryData);
      if (response.success) {
        alert(`Itinerary "${itinerary.destination}" saved successfully!`);
        loadSavedItineraries();
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert(error.message || 'Failed to save itinerary. Please try again.');
    } finally {
      setSaving({ ...saving, [itineraryId]: false });
    }
  };

  const isItinerarySaved = (itinerary) => {
    const destination = itinerary.destination;
    return savedItineraries.some(saved => saved.destination === destination);
  };

  const handleDeleteSaved = async (itineraryId, e) => {
    if (e) {
      e.stopPropagation();
    }
    if (!window.confirm('Are you sure you want to delete this saved itinerary?')) {
      return;
    }

    try {
      const response = await itineraryApiService.deleteItinerary(itineraryId);
      if (response.success) {
        alert('Itinerary deleted successfully!');
        loadSavedItineraries();
      }
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      alert(error.message || 'Failed to delete itinerary. Please try again.');
    }
  };

  const handleViewItinerary = async (itineraryId) => {
    try {
      setLoadingItinerary(true);
      const response = await itineraryApiService.getItineraryById(itineraryId);
      if (response.success) {
        setSelectedItinerary(response.data.itinerary);
        setIsModalOpen(true);
      } else {
        alert('Failed to load itinerary. Please try again.');
      }
    } catch (error) {
      console.error('Error loading itinerary:', error);
      alert(error.message || 'Failed to load itinerary. Please try again.');
    } finally {
      setLoadingItinerary(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItinerary(null);
  };

  if (showTripBuilder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6">
          <button
            onClick={() => setShowTripBuilder(false)}
            className="group inline-flex items-center px-4 py-2 text-gray-700 hover:text-indigo-600 font-semibold rounded-xl hover:bg-white transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Itineraries
          </button>
        </div>
        <TripBuilder />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header with Back/Home buttons */}
        <div className="mb-8 flex items-center justify-start">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
              className="group inline-flex items-center px-4 py-2 text-gray-700 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 text-gray-600 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          </div>
        </div>
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Explore curated itineraries for world-famous destinations, or craft your own personalized journey
          </p>
          <button
            onClick={() => setShowTripBuilder(true)}
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gray-700 rounded-xl hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your Own Itinerary
          </button>
        </div>

        {/* Saved Itineraries Section (if logged in) */}
        {isAuthenticated && savedItineraries.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Your Saved Itineraries</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedItineraries.map((itinerary) => (
                <div key={itinerary._id} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 transform hover:-translate-y-1">
                  <div 
                    onClick={() => !loadingItinerary && handleViewItinerary(itinerary._id)}
                    className={`${loadingItinerary ? 'cursor-wait' : 'cursor-pointer'}`}
                  >
                    <div className="h-32 bg-gray-700 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white drop-shadow-lg">{itinerary.title || itinerary.destination}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-3 font-medium">{itinerary.destination}</p>
                      {itinerary.itinerary?.days && (
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {itinerary.itinerary.days.length} {itinerary.itinerary.days.length === 1 ? 'day' : 'days'}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-700 font-semibold group-hover:text-gray-900 transition-colors">
                        <span>View Itinerary</span>
                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <button
                      onClick={(e) => handleDeleteSaved(itinerary._id, e)}
                      className="w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors border border-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Itineraries Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Itineraries</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-600"></div>
              <p className="mt-6 text-gray-600 text-lg">Loading amazing destinations...</p>
            </div>
          ) : sampleItineraries.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 mb-2 text-lg">No sample itineraries available</p>
              <p className="text-sm text-gray-500">Run the seed script to populate sample data</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sampleItineraries.map((itinerary, idx) => {
                const itineraryId = itinerary._id || itinerary.id;
                const isSaved = isItinerarySaved(itinerary);
                const days = itinerary.itinerary?.days || [];
                return (
                  <div key={itineraryId} className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200">
                    {/* Hero Image - Clickable */}
                    <div 
                      onClick={() => history.push(`/itinerary/view/${itineraryId}`)}
                      className="h-56 bg-gray-700 relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-24 h-24 text-white opacity-20" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                          {itinerary.title || `Trip to ${itinerary.destination}`}
                        </h3>
                        <p className="text-white/90 mt-1 font-medium">{itinerary.destination}</p>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => history.push(`/itinerary/view/${itineraryId}`)}
                      className="p-6 cursor-pointer"
                    >
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {itinerary.budget && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
                            {itinerary.budget}
                          </span>
                        )}
                        {itinerary.travelGroup && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
                            {itinerary.travelGroup}
                          </span>
                        )}
                        {days.length > 0 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
                            {days.length} {days.length === 1 ? 'day' : 'days'}
                          </span>
                        )}
                      </div>

                      {/* Cost */}
                      {itinerary.itinerary?.totalCost && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">Estimated Cost</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {itinerary.itinerary.totalCost}
                          </p>
                        </div>
                      )}

                      {/* Highlights */}
                      {days.length > 0 && (
                        <div className="mb-6">
                          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Highlights
                          </p>
                          <ul className="space-y-2">
                            {days.slice(0, 3).map((day, idx) => (
                              <li key={idx} className="flex items-start text-sm text-gray-600">
                                <span className="mr-2 text-gray-500 font-medium">•</span>
                                <span>{day.title || `Day ${day.day}`}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            history.push(`/itinerary/view/${itineraryId}`);
                          }}
                          className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveItinerary(itinerary);
                          }}
                          disabled={saving[itineraryId] || isSaved}
                          className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          isSaved
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                            : saving[itineraryId]
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-gray-700 text-white hover:bg-gray-600 shadow-md hover:shadow-lg transform hover:scale-105'
                        }`}
                      >
                        {saving[itineraryId] ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : isSaved ? (
                          <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Saved
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            Save
                          </span>
                        )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Itinerary Modal */}
      {loadingItinerary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-700 mb-4"></div>
              <p className="text-gray-700 font-medium">Loading itinerary...</p>
            </div>
          </div>
        </div>
      )}
      <ItineraryModal 
        itinerary={selectedItinerary}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ItineraryPage;
