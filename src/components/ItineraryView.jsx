import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

const ItineraryView = ({ itineraryData, isViewMode = true }) => {
  const history = useHistory();
  const [selectedDay, setSelectedDay] = useState(0);
  const itinerary = itineraryData?.itinerary || itineraryData || {};
  const days = itinerary.days || [];
  const destination = itineraryData?.destination || itinerary.destination || 'Unknown';
  const startDate = itineraryData?.startDate || null;
  
  // Generate date labels
  const getDateLabels = () => {
    if (startDate) {
      const start = moment(startDate);
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

  const handleDownload = () => {
    try {
      // Create a formatted text version of the itinerary
      let content = `ITINERARY: ${itineraryData?.title || `Trip to ${destination}`}\n`;
      content += `Destination: ${destination}\n`;
      if (startDate && itineraryData?.endDate) {
        content += `Dates: ${moment(startDate).format('MMM DD, YYYY')} - ${moment(itineraryData.endDate).format('MMM DD, YYYY')}\n`;
      }
      content += `Duration: ${days.length} ${days.length === 1 ? 'day' : 'days'}\n\n`;
      content += '='.repeat(50) + '\n\n';

      days.forEach((day, index) => {
        content += `DAY ${index + 1}: ${day.title || `Day ${index + 1}`}\n`;
        if (day.description) {
          content += `${day.description}\n`;
        }
        content += '-'.repeat(50) + '\n\n';

        if (day.activities && day.activities.length > 0) {
          content += 'ACTIVITIES:\n';
          day.activities.forEach((activity) => {
            content += `  ${activity.time}: ${activity.name}\n`;
            if (activity.description) content += `    ${activity.description}\n`;
            if (activity.location) content += `    Location: ${activity.location}\n`;
            if (activity.cost) content += `    Cost: ${activity.cost}\n`;
            content += '\n';
          });
        }

        if (day.meals && day.meals.length > 0) {
          content += 'MEALS:\n';
          day.meals.forEach((meal) => {
            content += `  ${meal.type}: ${meal.restaurant}\n`;
            if (meal.cuisine) content += `    Cuisine: ${meal.cuisine}\n`;
            if (meal.location) content += `    Location: ${meal.location}\n`;
            content += '\n';
          });
        }

        if (day.transportation) {
          content += `Transportation: ${day.transportation}\n`;
        }

        content += '\n' + '='.repeat(50) + '\n\n';
      });

      if (itinerary.tips && itinerary.tips.length > 0) {
        content += 'TRAVEL TIPS:\n';
        itinerary.tips.forEach((tip, index) => {
          content += `${index + 1}. ${tip}\n`;
        });
        content += '\n';
      }

      if (itinerary.totalCost) {
        content += `Estimated Total Cost: ${itinerary.totalCost}\n`;
      }

      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${destination.replace(/\s+/g, '_')}_Itinerary.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Itinerary downloaded successfully!');
    } catch (error) {
      console.error('Error downloading itinerary:', error);
      alert('Failed to download itinerary. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back/Home buttons */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => history.goBack()}
              className="group inline-flex items-center px-4 py-2 text-gray-700 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={() => history.push('/')}
              className="inline-flex items-center px-4 py-2 text-gray-600 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Itinerary
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="border-b border-gray-200 z-10 p-6 bg-white">
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {itineraryData?.title || `Trip to ${destination}`}
              </h1>
              <p className="text-gray-600 text-lg">{destination}</p>
            </div>

            {/* Date Tabs */}
            {days.length > 0 && (
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
            )}
          </div>

          {/* Day Content */}
          {selectedDayData && (
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-400px)]">
              {/* Day Header */}
              <div className="mb-8 flex items-start justify-between p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {dateLabels[selectedDay].dayOfWeek} {dateLabels[selectedDay].day} {dateLabels[selectedDay].month}
                  </h2>
                  <p className="text-gray-700 font-semibold flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {destination}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-300 rounded-full" />

                {/* Activities */}
                {selectedDayData.activities?.map((activity, index) => (
                  <div key={index} className="relative mb-6 pl-12">
                    {/* Timeline Dot */}
                    <div className="absolute left-4 top-4 w-8 h-8 bg-gray-700 rounded-full border-4 border-white z-10 flex items-center justify-center shadow-md">
                      <span className="text-white text-sm leading-none">{getTimeIcon(activity.time)}</span>
                    </div>
                    
                    {/* Activity Card */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      {activity.photo && (
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
                      )}
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
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Meals */}
                {selectedDayData.meals?.map((meal, index) => (
                  <div key={`meal-${index}`} className="relative mb-6 pl-12">
                    {/* Timeline Dot */}
                    <div className="absolute left-4 top-4 w-8 h-8 bg-gray-700 rounded-full border-4 border-white z-10 flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm leading-none">{getMealIcon(meal.type)}</span>
                    </div>
                    
                    {/* Meal Card */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                      {meal.photo && (
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
                      )}
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

          {/* Footer Info */}
          {(itinerary.tips || itinerary.totalCost) && (
            <div className="p-6 border-t border-gray-200 bg-white">
              {itinerary.tips && itinerary.tips.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Travel Tips
                  </h4>
                  <ul className="text-sm text-yellow-700">
                    {itinerary.tips.map((tip, index) => (
                      <li key={index} className="mb-1">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              {itinerary.totalCost && (
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-700">Estimated Total Cost: </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {itinerary.totalCost}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;

