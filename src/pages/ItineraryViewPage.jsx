import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { itineraryApiService } from '../api/itineraryApiService';
import ItineraryMapView from '../components/ItineraryMapView';

const ItineraryViewPage = () => {
  const { id } = useParams();
  const history = useHistory();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadItinerary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await itineraryApiService.getItineraryById(id);
        if (response.success) {
          setItinerary(response.data.itinerary);
        } else {
          setError(response.message || 'Failed to load itinerary');
        }
      } catch (err) {
        console.error('Error loading itinerary:', err);
        setError(err.message || 'Failed to load itinerary. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadItinerary();
    } else {
      setError('Invalid itinerary ID');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Itinerary</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => history.goBack()}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => history.push('/')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Itinerary not found</h3>
          <p className="text-gray-600 mb-6">The itinerary you're looking for doesn't exist.</p>
          <button
            onClick={() => history.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <ItineraryMapView itineraryData={itinerary} isViewMode={true} />;
};

export default ItineraryViewPage;

