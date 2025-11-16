import React, { useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { generateItineraryPDF } from '../../../utils/pdfGenerator';
import { itineraryApiService } from '../../../api/itineraryApiService';
import { useAuth } from '../../../context/AuthContext';
import ItineraryMapView from '../../ItineraryMapView';

const Step7Itinerary = ({ formData, updateFormData, prevStep, goToStep }) => {
  const history = useHistory();
  const { isAuthenticated } = useAuth();
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'saves', 'itinerary', 'foryou'
  const [showMenuFor, setShowMenuFor] = useState(null); // Track which item's menu is open
  const [bookmarkedDays, setBookmarkedDays] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const itinerary = formData.itinerary || {};
  const days = itinerary.days || [];
  const selectedRecommendations = formData.selectedRecommendations || [];
  
  // Calculate total saves count (activities + meals from selected recommendations)
  const totalSaves = useMemo(() => {
    let count = 0;
    days.forEach(day => {
      count += day.activities?.filter(a => !a.place_id || selectedRecommendations.includes(a.place_id)).length || 0;
      count += day.meals?.filter(m => !m.place_id || selectedRecommendations.includes(m.place_id)).length || 0;
    });
    return count;
  }, [days, selectedRecommendations]);

  // Generate date labels
  const getDateLabels = () => {
    if (formData.startDate) {
      const start = moment(formData.startDate);
      return days.map((_, index) => {
        const date = moment(start).add(index, 'days');
        return {
          day: date.format('D'),
          month: date.format('MMM'),
          dayOfWeek: date.format('dddd'),
          dayOfWeekShort: date.format('ddd'),
          fullDate: date.toDate(),
          dateStr: date.format('YYYY-MM-DD'),
        };
      });
    }
    return days.map((_, index) => ({
      day: `${index + 1}`,
      month: '',
      dayOfWeek: `Day ${index + 1}`,
      dayOfWeekShort: `Day ${index + 1}`,
      fullDate: null,
      dateStr: null,
    }));
  };

  const dateLabels = getDateLabels();
  const selectedDayData = days[selectedDay];

  const getTimeIcon = (time) => {
    if (time === 'Morning') return '🌅';
    if (time === 'Afternoon') return '☀️';
    if (time === 'Evening') return '🌙';
    return '📍';
  };

  const getMealIcon = (type) => {
    if (type === 'Breakfast') return '🍳';
    if (type === 'Lunch') return '🍽️';
    if (type === 'Dinner') return '🍷';
    return '🍴';
  };

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      alert('Please login to save your trip itinerary');
      history.push('/login');
      return;
    }

    setSaving(true);
    try {
      // Prepare trip data to save to database
      const itineraryData = {
        destination: formData.destination,
        title: `Trip to ${formData.destination}`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        tripType: formData.tripType,
        budget: formData.budget || 'moderate',
        activityLevel: formData.activityLevel || 'moderate',
        travelGroup: formData.travelGroup || 'solo',
        interests: formData.interests || [],
        itinerary: itinerary,
        selectedRecommendations: selectedRecommendations,
      };

      const response = await itineraryApiService.saveItinerary(itineraryData);
      
      if (response.success) {
        alert(`Trip to ${formData.destination} has been saved successfully!`);
        console.log('Trip saved to database:', response.data.itinerary);
      } else {
        throw new Error(response.message || 'Failed to save trip');
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      alert(error.message || 'Failed to save trip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShareTrip = () => {
    try {
      // Create a shareable text representation of the trip
      const shareText = `Check out my trip to ${formData.destination}!\n\n` +
        `Duration: ${days.length} ${days.length === 1 ? 'day' : 'days'}\n` +
        `Activities: ${totalSaves} items\n\n` +
        `View the full itinerary: ${window.location.href}`;

      // Check if Web Share API is available
      if (navigator.share) {
        navigator.share({
          title: `My Trip to ${formData.destination}`,
          text: shareText,
          url: window.location.href,
        }).catch((error) => {
          console.log('Error sharing:', error);
          // Fallback to clipboard
          copyToClipboard(shareText);
        });
      } else {
        // Fallback to clipboard
        copyToClipboard(shareText);
      }
    } catch (error) {
      console.error('Error sharing trip:', error);
      alert('Failed to share trip. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Trip details copied to clipboard!');
      }).catch((error) => {
        console.error('Failed to copy to clipboard:', error);
        // Fallback method
        fallbackCopyToClipboard(text);
      });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Trip details copied to clipboard!');
    } catch (error) {
      console.error('Fallback copy failed:', error);
      alert('Unable to copy. Please manually share the trip.');
    }
    document.body.removeChild(textArea);
  };

  const handleEdit = () => {
    if (goToStep) {
      goToStep(6); // Go back to Review step
    } else {
      prevStep(); // Fallback to previous step
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // You can add different views for each tab here
    if (tab === 'saves') {
      // Show saved items view
      alert('Saves view - showing your saved items');
    } else if (tab === 'foryou') {
      // Show recommendations view
      alert('For you view - showing personalized recommendations');
    }
  };

  const handleMenuClick = (itemId, event) => {
    event.stopPropagation();
    setShowMenuFor(showMenuFor === itemId ? null : itemId);
  };

  const handleRemoveItem = (itemId, type, index) => {
    if (window.confirm(`Remove this ${type} from your itinerary?`)) {
      // Remove from selectedRecommendations if it has a place_id
      const updatedRecommendations = selectedRecommendations.filter(id => id !== itemId);
      updateFormData({ selectedRecommendations: updatedRecommendations });
      setShowMenuFor(null);
      alert(`${type} removed from itinerary`);
    }
  };

  const handleBookmarkDay = (dayIndex) => {
    const newBookmarkedDays = new Set(bookmarkedDays);
    if (newBookmarkedDays.has(dayIndex)) {
      newBookmarkedDays.delete(dayIndex);
      alert('Day unbookmarked');
    } else {
      newBookmarkedDays.add(dayIndex);
      alert('Day bookmarked!');
    }
    setBookmarkedDays(newBookmarkedDays);
  };

  const handleDownloadItinerary = () => {
    try {
      // Prepare itinerary data for PDF
      const pdfData = {
        destination: formData.destination,
        title: `Trip to ${formData.destination}`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        tripType: formData.tripType,
        itinerary: {
          days: days.map(day => ({
            ...day,
            activities: day.activities?.filter(a => !a.place_id || selectedRecommendations.includes(a.place_id)) || [],
            meals: day.meals?.filter(m => !m.place_id || selectedRecommendations.includes(m.place_id)) || [],
          })),
          tips: itinerary.tips || [],
          totalCost: itinerary.totalCost || '',
        },
      };

      generateItineraryPDF(pdfData);
      alert('Itinerary PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading itinerary:', error);
      alert('Failed to download itinerary. Please try again.');
    }
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowMenuFor(null);
    };
    if (showMenuFor) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenuFor]);

  // If map view is selected and we have itinerary data, show the map view
  if (viewMode === 'map' && activeTab === 'itinerary') {
    console.log('=== Step7: Rendering Map View ===');
    console.log('formData:', formData);
    console.log('itinerary:', itinerary);
    console.log('days:', days);
    
    const mapData = {
      destination: formData.destination,
      startDate: formData.startDate,
      endDate: formData.endDate,
      itinerary: itinerary,
      title: `Trip to ${formData.destination}`,
    };
    
    console.log('mapData prepared:', mapData);
    
    return (
      <div className="h-screen bg-blue-50 relative">
        {/* Debug Banner */}
        <div className="bg-yellow-200 p-2 text-center text-sm font-semibold">
          DEBUG: Map View Mode Active - Check Console for Logs
        </div>
        {/* View Toggle Button */}
        <div className="absolute top-16 right-4 z-50">
          <button
            onClick={() => {
              console.log('Switching back to list view');
              setViewMode('list');
            }}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </button>
        </div>
        <ItineraryMapView itineraryData={mapData} isViewMode={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="border-b border-gray-200 z-10 p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-3">
                <button
                  onClick={() => handleTabChange('saves')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'saves'
                      ? 'bg-gray-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Saves
                </button>
                <button
                  onClick={() => handleTabChange('itinerary')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'itinerary'
                      ? 'bg-gray-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Itinerary
                </button>
                <button
                  onClick={() => handleTabChange('foryou')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'foryou'
                      ? 'bg-gray-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  For you
                </button>
              </div>
              <div className="flex items-center gap-4">
                {activeTab === 'itinerary' && (
                  <button
                    onClick={() => setViewMode('map')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Map View
                  </button>
                )}
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                  {totalSaves} {totalSaves === 1 ? 'item' : 'items'} in itinerary
                </span>
                <button
                  onClick={handleEdit}
                  className="px-6 py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Date Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {dateLabels.map((dateLabel, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={`
                    flex-shrink-0 px-5 py-3 rounded-lg font-medium transition-all duration-200
                    ${selectedDay === index
                      ? 'bg-gray-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {dateLabel.dayOfWeekShort} {dateLabel.day} {dateLabel.month}
                </button>
              ))}
            </div>
          </div>

          {/* Day Content */}
          {selectedDayData && (
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-300px)]">
              {/* Day Header */}
              <div className="mb-8 flex items-start justify-between p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {dateLabels[selectedDay].dayOfWeek} {dateLabels[selectedDay].day} {dateLabels[selectedDay].month}
                  </h2>
                  <p className="text-gray-700 font-medium cursor-pointer hover:text-gray-900 transition-colors flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {formData.destination}
                  </p>
                </div>
                <button
                  onClick={() => handleBookmarkDay(selectedDay)}
                  className={`text-gray-400 hover:text-gray-600 transition-colors ${
                    bookmarkedDays.has(selectedDay) ? 'text-yellow-500' : ''
                  }`}
                  title={bookmarkedDays.has(selectedDay) ? 'Unbookmark this day' : 'Bookmark this day'}
                >
                  <svg className="w-6 h-6" fill={bookmarkedDays.has(selectedDay) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-300 rounded-full" />

                {/* Activities */}
                {selectedDayData.activities && selectedDayData.activities.length > 0 ? (
                  (() => {
                    const filteredActivities = selectedDayData.activities.filter(activity => 
                      !activity.place_id || selectedRecommendations.includes(activity.place_id)
                    );
                    // If filter returns empty but activities exist, show all activities (fallback)
                    const activitiesToShow = filteredActivities.length > 0 
                      ? filteredActivities 
                      : selectedDayData.activities;
                    return activitiesToShow.map((activity, index) => (
                  <div key={index} className="relative mb-6 pl-12">
                    {/* Timeline Dot */}
                    <div className="absolute left-4 top-4 w-8 h-8 bg-gray-700 rounded-full border-4 border-white z-10 flex items-center justify-center shadow-md">
                      <span className="text-white text-sm leading-none">{getTimeIcon(activity.time)}</span>
                    </div>
                    
                    {/* Activity Card */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      {/* Activity Photo */}
                      {activity.photo ? (
                        <div className="w-full h-48 overflow-hidden">
                          <img
                            src={activity.photo}
                            alt={activity.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : null}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 text-base">{activity.name}</h3>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {activity.time}
                              </span>
                              {activity.cost && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {activity.cost}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                            {activity.location && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {activity.location}
                              </p>
                            )}
                          </div>
                          <div className="relative ml-2">
                            <button
                              onClick={(e) => handleMenuClick(`activity-${index}`, e)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                            {showMenuFor === `activity-${index}` && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <button
                                  onClick={() => handleRemoveItem(activity.place_id, 'activity', index)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                                >
                                  Remove from itinerary
                                </button>
                                <button
                                  onClick={() => {
                                    if (activity.location) {
                                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`, '_blank');
                                    }
                                    setShowMenuFor(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  View on map
                                </button>
                                <button
                                  onClick={() => {
                                    copyToClipboard(`${activity.name}\n${activity.description}\n${activity.location || ''}`);
                                    setShowMenuFor(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                                >
                                  Copy details
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    ));
                  })()
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No activities planned for this day.</p>
                  </div>
                )}

                {/* Meals */}
                {selectedDayData.meals?.filter(meal => 
                  !meal.place_id || selectedRecommendations.includes(meal.place_id)
                ).map((meal, index) => (
                  <div key={`meal-${index}`} className="relative mb-6 pl-12">
                    {/* Timeline Dot */}
                    <div className="absolute left-4 top-4 w-8 h-8 bg-gray-700 rounded-full border-4 border-white z-10 flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm leading-none">{getMealIcon(meal.type)}</span>
                    </div>
                    
                    {/* Meal Card */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                      {/* Meal Photo */}
                      {meal.photo ? (
                        <div className="w-full h-48 overflow-hidden">
                          <img
                            src={meal.photo}
                            alt={meal.restaurant}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : null}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 text-base">{meal.restaurant}</h3>
                              <span className="text-sm text-gray-500">{meal.type}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{meal.cuisine}</p>
                            {meal.location && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {meal.location}
                              </p>
                            )}
                          </div>
                          <div className="relative ml-2">
                            <button
                              onClick={(e) => handleMenuClick(`meal-${index}`, e)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                            {showMenuFor === `meal-${index}` && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <button
                                  onClick={() => handleRemoveItem(meal.place_id, 'meal', index)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                                >
                                  Remove from itinerary
                                </button>
                                <button
                                  onClick={() => {
                                    if (meal.location) {
                                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meal.location)}`, '_blank');
                                    }
                                    setShowMenuFor(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  View on map
                                </button>
                                <button
                                  onClick={() => {
                                    copyToClipboard(`${meal.restaurant} - ${meal.type}\n${meal.cuisine}\n${meal.location || ''}`);
                                    setShowMenuFor(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                                >
                                  Copy details
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transportation */}
              {selectedDayData.transportation && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Transportation</h3>
                  <p className="text-sm text-gray-600">{selectedDayData.transportation}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Navigation Footer */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 p-6 bg-white">
            <div className="flex items-center gap-4">
              <button
                onClick={prevStep}
                className="group inline-flex items-center px-6 py-3 text-gray-700 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                onClick={() => history.push('/')}
                className="inline-flex items-center px-4 py-3 text-gray-600 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleDownloadItinerary}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
              <button 
                onClick={handleSaveTrip}
                disabled={saving}
                className={`px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 ${
                  saving 
                    ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Trip'
                )}
              </button>
              <button 
                onClick={handleShareTrip}
                className="px-8 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7Itinerary;

