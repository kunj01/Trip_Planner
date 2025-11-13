import React, { useState, useMemo } from 'react';

const Step6Review = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [selectedRecommendations, setSelectedRecommendations] = useState(
    formData.selectedRecommendations || formData.recommendations?.map(r => r.place_id || r.id) || []
  );

  const recommendations = formData.recommendations || [];
  const itinerary = formData.itinerary || {};

  const handleToggleRecommendation = (placeId) => {
    setSelectedRecommendations(prev => {
      if (prev.includes(placeId)) {
        return prev.filter(id => id !== placeId);
      } else {
        return [...prev, placeId];
      }
    });
  };

  const handleSelectAll = () => {
    const allSelected = selectedRecommendations.length === recommendations.length && recommendations.length > 0;
    if (allSelected) {
      setSelectedRecommendations([]);
    } else {
      setSelectedRecommendations(recommendations.map(r => r.place_id || r.id));
    }
  };

  const handleNext = () => {
    updateFormData({ selectedRecommendations });
    nextStep();
  };

  const getTripTypeLabel = () => {
    const types = {
      solo: 'Solo',
      partner: 'Partner',
      friends: 'Friends',
      family: 'Family',
    };
    return types[formData.tripType] || 'Solo';
  };

  const getDateRange = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      return `${monthNames[start.getMonth()]}`;
    }
    return '';
  };

  const getDaysCount = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return itinerary.days?.length || 0;
  };

  // Group recommendations by category/theme with better descriptions
  const recommendationGroups = useMemo(() => {
    if (recommendations.length === 0) return [];
    
    const attractions = recommendations.filter(r => r.type === 'attraction');
    const restaurants = recommendations.filter(r => r.type === 'restaurant');
    
    const groups = [];
    
    // Group 1: Iconic Attractions (top rated attractions)
    if (attractions.length > 0) {
      const topAttractions = [...attractions]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, Math.min(6, attractions.length));
      
      if (topAttractions.length > 0) {
        groups.push({
          theme: `Exploring ${formData.destination}'s Iconic Architectural Wonders`,
          description: `Discover the breathtaking blend of modernity and tradition across ${formData.destination}'s iconic landmarks. Experience the soaring heights of famous attractions and appreciate the incredible views that showcase beauty like never before.`,
          items: topAttractions,
        });
      }
    }
    
    // Group 2: Dining Experiences
    if (restaurants.length > 0) {
      const topRestaurants = [...restaurants]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, Math.min(6, restaurants.length));
      
      if (topRestaurants.length > 0) {
        groups.push({
          theme: 'Dining Experiences',
          description: `Savor the flavors of ${formData.destination} with our curated selection of restaurants. From local cuisine to fine dining, discover culinary delights that will make your trip memorable.`,
          items: topRestaurants,
        });
      }
    }
    
    // If we have more attractions, add another group
    if (attractions.length > 6) {
      const moreAttractions = attractions.slice(6, 12);
      if (moreAttractions.length > 0) {
        groups.push({
          theme: 'More Must-See Attractions',
          description: `Continue exploring ${formData.destination} with these additional attractions and hidden gems.`,
          items: moreAttractions,
        });
      }
    }
    
    return groups;
  }, [recommendations, formData.destination]);

  // If no recommendations but we have itinerary days, allow proceeding to itinerary
  // Only show empty state if we have neither recommendations nor itinerary
  const hasItinerary = itinerary && itinerary.days && itinerary.days.length > 0;
  
  if (recommendations.length === 0 && recommendationGroups.length === 0 && !hasItinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl text-center">
          <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-200">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              No Recommendations Found
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find recommendations for {formData.destination}. Please try a different destination or check your internet connection.
            </p>
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If no recommendations but we have itinerary, show a message but allow proceeding
  if (recommendations.length === 0 && recommendationGroups.length === 0 && hasItinerary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Review our recommendations for your trip</p>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{formData.destination || 'Your Destination'}</h1>
              <p className="text-gray-600">
                {getTripTypeLabel()} • {getDateRange()} • {getDaysCount()} {getDaysCount() === 1 ? 'day' : 'days'}
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Limited Recommendations Available
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    We couldn't find specific recommendations for {formData.destination}, but we've created a basic itinerary for you. You can proceed to view your itinerary or go back to try a different destination.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                Your itinerary has been prepared with {getDaysCount()} {getDaysCount() === 1 ? 'day' : 'days'} of activities.
              </p>
            </div>
            
            {/* Navigation Footer */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                className="text-gray-700 font-semibold hover:text-gray-900 px-4 rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-xl font-semibold text-white bg-gray-700 hover:bg-gray-600 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue to Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Review our recommendations for your trip</p>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{formData.destination || 'Your Destination'}</h1>
              <p className="text-gray-600">
                {getTripTypeLabel()} • {getDateRange()} • {getDaysCount()} {getDaysCount() === 1 ? 'day' : 'days'}
              </p>
            </div>

            {/* Recommendation Groups */}
            {recommendationGroups.length > 0 ? (
              recommendationGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{group.theme}</h2>
                <p className="text-gray-600 mb-6 text-base leading-relaxed">
                  {group.description}
                </p>
                
                {/* Recommendation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {group.items.map((rec) => {
                    const isSelected = selectedRecommendations.includes(rec.place_id || rec.id);
                    return (
                      <div
                        key={rec.place_id || rec.id}
                        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                          isSelected ? 'border-gray-600 ring-2 ring-gray-400 ring-offset-2 shadow-md' : 'border-gray-200 hover:border-gray-400'
                        }`}
                        onClick={() => handleToggleRecommendation(rec.place_id || rec.id)}
                      >
                        <div className="aspect-square relative bg-gray-100 overflow-hidden group">
                          {rec.photo ? (
                            <img
                              src={rec.photo}
                              alt={rec.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              loading="lazy"
                              onError={(e) => {
                                // Hide image and show placeholder on error
                                e.target.style.display = 'none';
                                const placeholder = e.target.parentElement.querySelector('.photo-placeholder');
                                if (placeholder) {
                                  placeholder.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className="photo-placeholder w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200"
                            style={{ display: rec.photo ? 'none' : 'flex' }}
                          >
                            <svg
                              className="w-12 h-12 text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-gray-500 text-xs text-center px-3 line-clamp-2 font-medium">{rec.name}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-gray-700 rounded-full p-2 shadow-lg z-10">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-white">
                          <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{rec.name}</h3>
                          {rec.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-600">⭐</span>
                              <span className="text-xs font-medium text-gray-700">{rec.rating.toFixed(1)}</span>
                              {rec.address && (
                                <span className="text-xs text-gray-500 truncate">• {rec.address.split(',')[0]}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No recommendations available yet.</p>
                <button
                  onClick={prevStep}
                  className="px-8 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Go Back
                </button>
              </div>
            )}

            {/* Select All Toggle */}
            {recommendations.length > 0 && (
              <div className="flex items-center gap-3 mb-6 pt-4 border-t border-gray-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRecommendations.length === recommendations.length && recommendations.length > 0}
                    onChange={handleSelectAll}
                    className="sr-only"
                  />
                  <div className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${selectedRecommendations.length === recommendations.length && recommendations.length > 0
                      ? 'bg-gray-700' : 'bg-gray-300'}
                  `}>
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                        ${selectedRecommendations.length === recommendations.length && recommendations.length > 0
                          ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  Select all ({selectedRecommendations.length}/{recommendations.length} selected)
                </span>
              </div>
            )}
            
            {/* Navigation Footer */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              className="group inline-flex items-center px-6 py-3 text-gray-700 font-semibold hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:-translate-x-1"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-10 py-4 rounded-xl font-semibold text-white text-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center">
                Continue
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6Review;

