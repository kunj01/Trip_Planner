import React, { useState, useMemo } from 'react';
import moment from 'moment';

const Step7Itinerary = ({ formData, updateFormData, prevStep }) => {
  const [selectedDay, setSelectedDay] = useState(0);
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

  const handleSaveTrip = () => {
    try {
      // Prepare trip data to save
      const tripData = {
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        tripType: formData.tripType,
        itinerary: itinerary,
        selectedRecommendations: selectedRecommendations,
        savedAt: new Date().toISOString(),
      };

      // Get existing saved trips from localStorage
      const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      
      // Add new trip
      savedTrips.push(tripData);
      
      // Save back to localStorage
      localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
      
      // Show success message
      alert(`Trip to ${formData.destination} has been saved successfully!`);
      
      console.log('Trip saved:', tripData);
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Failed to save trip. Please try again.');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 z-10 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 cursor-pointer hover:bg-gray-200">
                  Saves
                </span>
                <span className="px-3 py-1 bg-[#00A680] text-white rounded-full text-sm font-semibold">
                  Itinerary
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 cursor-pointer hover:bg-gray-200">
                  For you
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {totalSaves} {totalSaves === 1 ? 'item' : 'items'} in itinerary
                </span>
                <button className="px-4 py-2 bg-[#00A680] text-white rounded-lg font-semibold hover:bg-[#008F6B] transition-colors">
                  Edit
                </button>
              </div>
            </div>

            {/* Date Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dateLabels.map((dateLabel, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-full font-semibold transition-colors
                    ${selectedDay === index
                      ? 'bg-[#00A680] text-white'
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
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#00A680] mb-2">
                    {dateLabels[selectedDay].dayOfWeek} {dateLabels[selectedDay].day} {dateLabels[selectedDay].month}
                  </h2>
                  <p className="text-gray-600 underline cursor-pointer hover:text-[#00A680]">{formData.destination}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                {/* Activities */}
                {selectedDayData.activities?.filter(activity => 
                  !activity.place_id || selectedRecommendations.includes(activity.place_id)
                ).map((activity, index) => (
                  <div key={index} className="relative mb-6 pl-12">
                    {/* Timeline Dot */}
                    <div className="absolute left-4 top-4 w-6 h-6 bg-black rounded-full border-2 border-white z-10 flex items-center justify-center shadow-md">
                      <span className="text-white text-xs leading-none">{getTimeIcon(activity.time)}</span>
                    </div>
                    
                    {/* Activity Card */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
                          <button className="text-gray-400 hover:text-gray-600 ml-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Meals */}
                {selectedDayData.meals?.filter(meal => 
                  !meal.place_id || selectedRecommendations.includes(meal.place_id)
                ).map((meal, index) => (
                  <div key={`meal-${index}`} className="relative mb-6 pl-12">
                    {/* Timeline Dot */}
                    <div className="absolute left-4 top-4 w-6 h-6 bg-[#00A680] rounded-full border-2 border-white z-10 flex items-center justify-center shadow-md">
                      <span className="text-white text-xs leading-none">{getMealIcon(meal.type)}</span>
                    </div>
                    
                    {/* Meal Card */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
                          <button className="text-gray-400 hover:text-gray-600 ml-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
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
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 p-4">
            <button
              onClick={prevStep}
              className="text-[#00A680] font-semibold hover:underline px-4"
            >
              Back
            </button>
            <div className="flex gap-4">
              <button 
                onClick={handleSaveTrip}
                className="px-6 py-2 border border-[#00A680] text-[#00A680] rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Save Trip
              </button>
              <button 
                onClick={handleShareTrip}
                className="px-6 py-2 bg-[#00A680] text-white rounded-lg font-semibold hover:bg-[#008F6B] transition-colors"
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

