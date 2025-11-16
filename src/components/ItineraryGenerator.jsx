import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { searchDestinations, generateItinerary, getPlaceDetails } from '../api/itineraryService';
import { MainContext } from '../context/MainContext';
import { itineraryApiService } from '../api/itineraryApiService';
import { useAuth } from '../context/AuthContext';

const ItineraryGenerator = () => {
  const { setCoordinates } = useContext(MainContext);
  const history = useHistory();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    budget: 'moderate',
    travelGroup: 'solo',
    interests: [],
    activityLevel: 'moderate',
    additionalNotes: ''
  });

  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [expandedDays, setExpandedDays] = useState({});
  const [activeTab, setActiveTab] = useState('Itinerary');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDestinationSearch = async (e) => {
    const query = e.target.value;
    setFormData(prev => ({ ...prev, destination: query }));

    if (query.length > 2) {
      try {
        const results = await searchDestinations(query);
        setSearchResults(Array.isArray(results) ? results : []);
        setShowResults(true);
      } catch (error) {
        setSearchResults([]);
        setShowResults(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const selectDestination = (destination) => {
    setFormData(prev => ({ ...prev, destination: destination.name }));
    setShowResults(false);
  };

  const handleInterestChange = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const resetForm = () => {
    setFormData({
      destination: '',
      days: 3,
      budget: 'moderate',
      travelGroup: 'solo',
      interests: [],
      activityLevel: 'moderate',
      additionalNotes: ''
    });
    setGeneratedItinerary(null);
    setRecommendations([]);
  };

  // Handle navigation to map view with location
  const handleLocationClick = async (activity) => {
    try {
      // If coordinates are available, use them directly
      if (activity.lat && activity.lng && !isNaN(activity.lat) && !isNaN(activity.lng)) {
        setCoordinates({ lat: activity.lat, lng: activity.lng });
        history.push('/map');
        return;
      }

      // If place_id is available, get coordinates from it
      if (activity.place_id && !activity.place_id.startsWith('fallback-') && !activity.place_id.startsWith('placeholder-')) {
        try {
          const placeDetails = await getPlaceDetails(activity.place_id);
          if (placeDetails.geometry && placeDetails.geometry.location) {
            const location = placeDetails.geometry.location;
            const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
            const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
            if (lat && lng) {
              setCoordinates({ lat, lng });
              history.push('/map');
              return;
            }
          }
        } catch (error) {
          console.warn('Error fetching place details:', error);
        }
      }

      // Fallback: search by location name or address
      const searchQuery = activity.location || activity.name || formData.destination;
      if (searchQuery) {
        try {
          const results = await searchDestinations(searchQuery);
          if (results && results.length > 0) {
            const firstResult = results[0];
            if (firstResult.geometry && firstResult.geometry.location) {
              const location = firstResult.geometry.location;
              const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
              const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
              if (lat && lng) {
                setCoordinates({ lat, lng });
                history.push('/map');
                return;
              }
            }
          }
        } catch (error) {
          console.warn('Error searching for location:', error);
        }
      }

      // Final fallback: use destination coordinates if available
      alert(`Unable to find coordinates for ${activity.name || activity.location}. Please search for it manually on the map.`);
    } catch (error) {
      console.error('Error navigating to location:', error);
      alert('Unable to navigate to location. Please try again.');
    }
  };

  // Handle opening Google search in new tab for places
  const handlePlaceClick = (place) => {
    const placeName = place.name || place.restaurant || place.location || formData.destination;
    const location = place.location || formData.destination || '';
    
    // Construct Google search query
    const searchQuery = location ? `${placeName}, ${location}` : placeName;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    // Open in new tab
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setIsLoading(true);

    try {
      const itinerary = await generateItinerary(formData);
      setGeneratedItinerary(itinerary);
    } catch (error) {
      // Show more helpful error message
      let errorMessage = 'Sorry, there was an error generating your itinerary.';
      
      if (error && error.message) {
        if (error.message.includes('API key')) {
          errorMessage = 'Google Maps API key is not configured. Please set VITE_GOOGLE_MAP_API_KEY in your .env file.';
        } else if (error.message.includes('REQUEST_DENIED')) {
          errorMessage = 'API request denied. Please check that your Google Maps API key has the Places API enabled and the correct permissions.';
        } else if (error.message.includes('ZERO_RESULTS') || error.message.includes('No attractions')) {
          errorMessage = error.message;
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!isAuthenticated) {
      alert('Please login to save your itinerary');
      history.push('/login');
      return;
    }

    setSaving(true);
    try {
      const itineraryData = {
        destination: formData.destination,
        title: `Trip to ${formData.destination}`,
        budget: formData.budget,
        activityLevel: formData.activityLevel,
        travelGroup: formData.travelGroup,
        interests: formData.interests || [],
        itinerary: generatedItinerary,
        selectedRecommendations: [],
      };

      const response = await itineraryApiService.saveItinerary(itineraryData);
      
      if (response.success) {
        alert(`Itinerary "${formData.destination}" saved successfully!`);
      } else {
        throw new Error(response.message || 'Failed to save itinerary');
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert(error.message || 'Failed to save itinerary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get day name and date
  const getDayLabel = (index) => {
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      dayName: days[date.getDay()],
      day: date.getDate(),
      month: months[date.getMonth()],
      shortDay: days[date.getDay()].substring(0, 3),
    };
  };

  // Helper function to toggle day expansion
  const toggleDay = (index) => {
    setExpandedDays(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Helper function to get activity icon
  const getActivityIcon = (activity) => {
    // Check if it's a meal by checking if it has restaurant or type property
    if (activity.restaurant || activity.type) {
      return (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  };

  // Helper function to get category
  const getCategory = (activity) => {
    if (activity.restaurant || activity.type) {
      return 'Restaurant';
    }
    // Try to extract from description or default
    if (activity.description?.toLowerCase().includes('museum')) return 'Museums';
    if (activity.description?.toLowerCase().includes('tower') || activity.description?.toLowerCase().includes('observation')) return 'Observation Decks & Towers';
    return 'Attractions';
  };

  // Extract rating from description if available
  const getRating = (activity) => {
    const match = activity.description?.match(/Rating:?\s*([\d.]+)/i);
    return match ? parseFloat(match[1]) : null;
  };

  // Count total activities (including meals)
  const getTotalActivities = () => {
    if (!generatedItinerary?.days) return 0;
    return generatedItinerary.days.reduce((total, day) => {
      const activitiesCount = day.activities?.length || 0;
      const mealsCount = day.meals?.length || 0;
      return total + activitiesCount + mealsCount;
    }, 0);
  };

  if (generatedItinerary) {
    const days = generatedItinerary.days || [];
    const totalActivities = getTotalActivities();

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Back Button */}
          <button 
            onClick={() => setGeneratedItinerary(null)} 
            className="mb-8 text-gray-600 hover:text-gray-900 font-medium inline-flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Form
          </button>

          {/* Navigation Tabs */}
          <div className="flex gap-8 mb-8 pb-2 border-b border-gray-200">
            {['Saves', 'Itinerary', 'For you'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 font-medium text-base transition-colors ${
                  activeTab === tab
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Date Selector Pills */}
          {days.length > 0 && (
            <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide">
              {days.map((_, index) => {
                const dateLabel = getDayLabel(index);
                const isSelected = selectedDay === index;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedDay(index);
                      if (!expandedDays[index]) {
                        setExpandedDays(prev => ({ ...prev, [index]: true }));
                      }
                    }}
                    className={`flex-shrink-0 px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {dateLabel.day} {dateLabel.month}
                  </button>
                );
              })}
            </div>
          )}

          {/* Status and Edit Button */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-gray-700 font-medium text-base">
              {totalActivities}/{totalActivities} saves added
            </span>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors text-sm">
                Edit
              </button>
              {isAuthenticated && (
                <button
                  onClick={handleSaveItinerary}
                  disabled={saving}
                  className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
                    saving
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Itinerary'}
                </button>
              )}
            </div>
          </div>

          {/* Itinerary Days List */}
          <div className="space-y-0">
            {days.map((day, index) => {
              const dateLabel = getDayLabel(index);
              const isExpanded = expandedDays[index] !== false; // Default to expanded
              
              return (
                <div key={index} className="border-b border-gray-200 last:border-b-0">
                  {/* Day Header - Collapsible */}
                  <button
                    onClick={() => toggleDay(index)}
                    className="w-full px-0 py-5 flex items-center justify-between hover:bg-transparent transition-colors bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-blue-600 text-xl">
                        {dateLabel.dayName} {dateLabel.day} {dateLabel.month}
                      </span>
                      <span 
                        className="text-blue-600 underline cursor-pointer hover:text-blue-700 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLocationClick({ location: formData.destination });
                        }}
                      >
                        {formData.destination}
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Content - Timeline View */}
                  {isExpanded && (
                    <div className="py-6 pb-8">
                      {/* Timeline Line */}
                      <div className="relative pl-16">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                        {/* Activities */}
                        {day.activities && day.activities.map((activity, actIndex) => {
                          const rating = getRating(activity);
                          const category = getCategory(activity);
                          const isLastActivity = actIndex === day.activities.length - 1 && (!day.meals || day.meals.length === 0);

                          return (
                            <div key={actIndex} className="relative mb-6">
                              {/* Timeline Dot */}
                              <div className="absolute left-2 top-4 w-8 h-8 bg-black rounded-full border-4 border-white z-10 flex items-center justify-center shadow-md">
                                {getActivityIcon(activity)}
                              </div>

                              {/* Activity Card */}
                              <div 
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all mb-0 cursor-pointer"
                                onClick={() => handlePlaceClick(activity)}
                              >
                                <div className="flex">
                                  {/* Image */}
                                  {activity.photo && (
                                    <div className="w-52 h-40 flex-shrink-0 relative overflow-hidden bg-gray-100">
                                      <img
                                        src={activity.photo}
                                        alt={activity.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Content */}
                                  <div className="flex-1 p-5 flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg mb-2 hover:text-blue-600 transition-colors">{activity.name}</h3>
                                        
                                        {/* Rating */}
                                        {rating ? (
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="font-medium text-gray-900">{rating}</span>
                                            <div className="flex gap-0.5">
                                              {[...Array(5)].map((_, i) => (
                                                <svg
                                                  key={i}
                                                  className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-green-500 fill-current' : i < rating ? 'text-green-500 fill-current opacity-50' : 'text-gray-300'}`}
                                                  fill="currentColor"
                                                  viewBox="0 0 20 20"
                                                >
                                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                              ))}
                                            </div>
                                            <span className="text-gray-500 text-sm">(1,234)</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="font-medium text-gray-900">4.5</span>
                                            <div className="flex gap-0.5">
                                              {[...Array(5)].map((_, i) => (
                                                <svg
                                                  key={i}
                                                  className={`w-4 h-4 ${i < 4 ? 'text-green-500 fill-current' : i < 4.5 ? 'text-green-500 fill-current opacity-50' : 'text-gray-300'}`}
                                                  fill="currentColor"
                                                  viewBox="0 0 20 20"
                                                >
                                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                              ))}
                                            </div>
                                            <span className="text-gray-500 text-sm">(1,234)</span>
                                          </div>
                                        )}

                                        {/* Category */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                          <span>{category}</span>
                                          {activity.cost && activity.cost !== 'Free' && (
                                            <>
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                              </svg>
                                              <span>Requires admission</span>
                                            </>
                                          )}
                                        </div>

                                        {/* Hours Link */}
                                        <button 
                                          className="text-blue-600 hover:text-blue-700 underline text-sm flex items-center gap-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlaceClick(activity);
                                          }}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          See Hours
                                        </button>
                                    </div>

                                    {/* Three Dots Menu */}
                                    <button 
                                      className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // You can add menu functionality here later
                                      }}
                                    >
                                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Connecting Line */}
                              {!isLastActivity && <div className="absolute left-6 top-20 w-0.5 h-6 bg-gray-300"></div>}
                            </div>
                          );
                        })}

                        {/* Meals */}
                        {day.meals && day.meals.map((meal, mealIndex) => {
                          const category = 'Restaurant';
                          const isLastMeal = mealIndex === day.meals.length - 1;
                          const isBeforeFirstMeal = mealIndex === 0 && (!day.activities || day.activities.length === 0);

                          return (
                            <div key={`meal-${mealIndex}`} className="relative mb-6">
                              {/* Timeline Dot */}
                              <div className="absolute left-2 top-4 w-8 h-8 bg-black rounded-full border-4 border-white z-10 flex items-center justify-center shadow-md">
                                {getActivityIcon(meal)}
                              </div>
                              
                              {/* Connecting Line Before Meal */}
                              {!isBeforeFirstMeal && <div className="absolute left-6 top-0 w-0.5 h-4 bg-gray-300"></div>}

                              {/* Meal Card */}
                              <div 
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all mb-0 cursor-pointer"
                                onClick={() => handlePlaceClick(meal)}
                              >
                                <div className="flex">
                                  {/* Image */}
                                  {meal.photo && (
                                    <div className="w-52 h-40 flex-shrink-0 relative overflow-hidden bg-gray-100">
                                      <img
                                        src={meal.photo}
                                        alt={meal.restaurant}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Content */}
                                  <div className="flex-1 p-5 flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg mb-2 hover:text-blue-600 transition-colors">{meal.restaurant}</h3>
                                        
                                        {/* Category */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                          </svg>
                                          <span>{category}</span>
                                          <span>•</span>
                                          <span>{meal.cuisine || 'American'}</span>
                                          <span>•</span>
                                          <span>$</span>
                                        </div>

                                        {/* Hours Link */}
                                        <button 
                                          className="text-blue-600 hover:text-blue-700 underline text-sm flex items-center gap-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlaceClick(meal);
                                          }}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          See Hours
                                        </button>
                                    </div>

                                    {/* Three Dots Menu */}
                                    <button 
                                      className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // You can add menu functionality here later
                                      }}
                                    >
                                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Connecting Line */}
                              {!isLastMeal && <div className="absolute left-6 top-20 w-0.5 h-6 bg-gray-300"></div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tips Section */}
          {generatedItinerary.tips && generatedItinerary.tips.length > 0 && (
            <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Travel Tips
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {generatedItinerary.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Total Cost */}
          {generatedItinerary.totalCost && (
            <div className="mt-6 text-right">
              <span className="text-lg font-semibold text-gray-700">Estimated Total Cost: </span>
              <span className="text-2xl font-bold text-green-600">{generatedItinerary.totalCost}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tell us your travel preferences 🏖️ 🌴</h1>
      <p className="text-gray-600 mb-8">
        Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Destination Search */}
        <div className="relative">
          <label className="block text-xl font-semibold mb-2">What is destination of choice?</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleDestinationSearch}
            placeholder="Type to search destinations..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={result.place_id}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => selectDestination(result)}
                >
                  <div className="font-medium text-gray-900">{result.name}</div>
                  <div className="text-sm text-gray-500">{result.formatted_address}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Number of Days */}
        <div>
          <label className="block text-xl font-semibold mb-2">How many days?</label>
          <select
            name="days"
            value={formData.days}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(day => (
              <option key={day} value={day}>{day} {day === 1 ? 'day' : 'days'}</option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-xl font-semibold mb-2">What's your budget?</label>
          <div className="grid grid-cols-3 gap-4">
            {['budget', 'moderate', 'luxury'].map(budget => (
              <label key={budget} className="flex items-center">
                <input
                  type="radio"
                  name="budget"
                  value={budget}
                  checked={formData.budget === budget}
                  onChange={handleInputChange}
                  className="mr-2"
                  required
                />
                <span className="capitalize">{budget}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Travel Group */}
        <div>
          <label className="block text-xl font-semibold mb-2">Who are you traveling with?</label>
          <div className="grid grid-cols-2 gap-4">
            {['solo', 'couple', 'family', 'friends'].map(group => (
              <label key={group} className="flex items-center">
                <input
                  type="radio"
                  name="travelGroup"
                  value={group}
                  checked={formData.travelGroup === group}
                  onChange={handleInputChange}
                  className="mr-2"
                  required
                />
                <span className="capitalize">{group}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-xl font-semibold mb-2">What are your interests?</label>
          <div className="grid grid-cols-2 gap-4">
            {['adventure', 'culture', 'food', 'nature', 'shopping', 'nightlife', 'relaxation', 'photography'].map(interest => (
              <label key={interest} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                  className="mr-2"
                />
                <span className="capitalize">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-xl font-semibold mb-2">Activity Level</label>
          <div className="grid grid-cols-3 gap-4">
            {['relaxed', 'moderate', 'active'].map(level => (
              <label key={level} className="flex items-center">
                <input
                  type="radio"
                  name="activityLevel"
                  value={level}
                  checked={formData.activityLevel === level}
                  onChange={handleInputChange}
                  className="mr-2"
                  required
                />
                <span className="capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xl font-semibold mb-2">Additional Notes (Optional)</label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
            placeholder="Any special requirements or preferences..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isGenerating || !formData.destination}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Your Perfect Itinerary...
              </div>
            ) : (
              'Generate Your Perfect Itinerary'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItineraryGenerator;