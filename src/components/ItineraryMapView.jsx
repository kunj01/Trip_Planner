import React, { useState, useEffect, useMemo } from 'react';
import GoogleMapReact from 'google-map-react';
import moment from 'moment';

// Map Marker Component
const MapMarker = ({ text, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`transform -translate-x-1/2 -translate-y-full ${isSelected ? 'z-50' : 'z-10'}`}
  >
    <div className={`relative ${isSelected ? 'animate-bounce' : ''}`}>
      <svg
        className={`w-10 h-10 ${isSelected ? 'text-red-600' : 'text-gray-700'} drop-shadow-lg transition-all duration-200`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
      {isSelected && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg">
          {text}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  </div>
);

const ItineraryMapView = ({ itineraryData, isViewMode = true }) => {
  // Debug logging - CHECK THIS IN CONSOLE FIRST!
  console.log('=== ItineraryMapView Component Called ===');
  console.log('itineraryData:', itineraryData);
  
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(12);
  
  const itinerary = itineraryData?.itinerary || itineraryData || {};
  const days = itinerary.days || [];
  const destination = itineraryData?.destination || itinerary.destination || 'Unknown';
  const startDate = itineraryData?.startDate || null;

  console.log('days:', days);
  console.log('days.length:', days.length);

  // Early return for testing - remove this after debugging
  if (!itineraryData) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">DEBUG: No itineraryData</h2>
          <p className="text-gray-700">The component received no data</p>
        </div>
      </div>
    );
  }

  // Extract all places from itinerary
  const extractPlaces = useMemo(() => {
    const places = [];
    days.forEach((day, dayIndex) => {
      // Add activities
      day.activities?.forEach((activity, actIndex) => {
        if (activity.lat && activity.lng) {
          places.push({
            id: `activity-${dayIndex}-${actIndex}`,
            name: activity.name,
            lat: parseFloat(activity.lat),
            lng: parseFloat(activity.lng),
            type: 'activity',
            time: activity.time,
            description: activity.description,
            photo: activity.photo,
            dayIndex,
            location: activity.location,
          });
        }
      });
      
      // Add meals
      day.meals?.forEach((meal, mealIndex) => {
        if (meal.lat && meal.lng) {
          places.push({
            id: `meal-${dayIndex}-${mealIndex}`,
            name: meal.restaurant,
            lat: parseFloat(meal.lat),
            lng: parseFloat(meal.lng),
            type: 'meal',
            mealType: meal.type,
            description: meal.cuisine || meal.description,
            photo: meal.photo,
            dayIndex,
            location: meal.location,
          });
        }
      });
    });
    return places;
  }, [days]);

  // Get places for selected day
  const selectedDayPlaces = useMemo(() => {
    return extractPlaces.filter(place => place.dayIndex === selectedDay);
  }, [extractPlaces, selectedDay]);

  // Set initial map center
  useEffect(() => {
    if (selectedDayPlaces.length > 0) {
      const firstPlace = selectedDayPlaces[0];
      setMapCenter({ lat: firstPlace.lat, lng: firstPlace.lng });
    } else if (extractPlaces.length > 0) {
      const firstPlace = extractPlaces[0];
      setMapCenter({ lat: firstPlace.lat, lng: firstPlace.lng });
    } else {
      // Default to a generic location if no places have coordinates
      setMapCenter({ lat: 40.7128, lng: -74.0060 }); // New York as default
    }
  }, [selectedDayPlaces, extractPlaces]);

  // Generate date labels
  const getDateLabels = () => {
    if (startDate) {
      const start = moment(startDate);
      return days.map((_, index) => {
        const date = moment(start).add(index, 'days');
        return {
          day: date.format('D'),
          month: date.format('MMM'),
          dayOfWeekShort: date.format('ddd'),
        };
      });
    }
    return days.map((_, index) => ({
      day: `${index + 1}`,
      month: '',
      dayOfWeekShort: `Day ${index + 1}`,
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

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setMapCenter({ lat: place.lat, lng: place.lng });
    setMapZoom(15);
  };

  const handleMapMarkerClick = (place) => {
    setSelectedPlace(place);
    // Scroll to the place in the list
    const element = document.getElementById(place.id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Check if we have any data to display
  if (!days || days.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Itinerary Data</h3>
          <p className="text-gray-600">No itinerary days found to display.</p>
        </div>
      </div>
    );
  }

  if (!mapCenter) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-700 mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {itineraryData?.title || `Trip to ${destination}`}
            </h1>
            <p className="text-sm text-gray-600">{destination}</p>
          </div>
        </div>
        
        {/* Compact Date Tabs */}
        {days.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {dateLabels.map((dateLabel, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedDay(index);
                  setSelectedPlace(null);
                }}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200
                  ${selectedDay === index
                    ? 'bg-gray-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {dateLabel.dayOfWeekShort} {dateLabel.day}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Itinerary Details */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200">
          <div className="p-2">
            {selectedDayData && (
              <>
                {/* Compact Day Header */}
                <div className="mb-2 p-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <h2 className="text-sm font-bold text-gray-900">
                    {dateLabels[selectedDay].dayOfWeekShort} {dateLabels[selectedDay].day} {dateLabels[selectedDay].month}
                  </h2>
                  <p className="text-gray-600 text-xs flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {destination}
                  </p>
                </div>

                {/* Timeline */}
                <div className="relative space-y-1.5">
                  {/* Timeline Line */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-300" />

                  {/* Activities */}
                  {selectedDayData.activities?.map((activity, index) => {
                    const placeId = `activity-${selectedDay}-${index}`;
                    const place = extractPlaces.find(p => p.id === placeId);
                    const isSelected = selectedPlace?.id === placeId;
                    
                    return (
                      <div
                        key={index}
                        id={placeId}
                        onClick={() => place && handlePlaceClick(place)}
                        className={`relative pl-8 ${place ? 'hover:cursor-pointer' : ''}`}
                      >
                        {/* Timeline Dot */}
                        <div className={`absolute left-1.5 top-2 w-5 h-5 rounded-full border-2 border-white z-10 flex items-center justify-center shadow-sm transition-all ${isSelected ? 'bg-red-600 scale-110' : 'bg-gray-700'}`}>
                          <span className="text-xs">{getTimeIcon(activity.time)}</span>
                        </div>
                        
                        {/* Compact Activity Card */}
                        <div className={`bg-white border rounded-lg overflow-hidden transition-all duration-200 ${isSelected ? 'border-red-600 shadow-lg' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                          <div className="flex">
                            {activity.photo && (
                              <div className="w-16 h-16 flex-shrink-0 overflow-hidden">
                                <img
                                  src={activity.photo}
                                  alt={activity.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              </div>
                            )}
                            <div className="p-1.5 flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-xs mb-0.5 truncate">{activity.name}</h3>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
                                <span className="flex items-center gap-0.5">
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {activity.time}
                                </span>
                                {activity.cost && <span>{activity.cost}</span>}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-1">{activity.description}</p>
                              {activity.location && (
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-0.5 truncate">
                                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  {activity.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Meals */}
                  {selectedDayData.meals?.map((meal, index) => {
                    const placeId = `meal-${selectedDay}-${index}`;
                    const place = extractPlaces.find(p => p.id === placeId);
                    const isSelected = selectedPlace?.id === placeId;
                    
                    return (
                      <div
                        key={`meal-${index}`}
                        id={placeId}
                        onClick={() => place && handlePlaceClick(place)}
                        className={`relative pl-8 ${place ? 'hover:cursor-pointer' : ''}`}
                      >
                        {/* Timeline Dot */}
                        <div className={`absolute left-1.5 top-2 w-5 h-5 rounded-full border-2 border-white z-10 flex items-center justify-center shadow-sm transition-all ${isSelected ? 'bg-red-600 scale-110' : 'bg-gray-700'}`}>
                          <span className="text-xs">{getMealIcon(meal.type)}</span>
                        </div>
                        
                        {/* Compact Meal Card */}
                        <div className={`bg-white border rounded-lg overflow-hidden transition-all duration-200 ${isSelected ? 'border-red-600 shadow-lg' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                          <div className="flex">
                            {meal.photo && (
                              <div className="w-16 h-16 flex-shrink-0 overflow-hidden">
                                <img
                                  src={meal.photo}
                                  alt={meal.restaurant}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              </div>
                            )}
                            <div className="p-1.5 flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-xs mb-0.5 truncate">{meal.restaurant}</h3>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                <span className="flex items-center gap-0.5">
                                  {getMealIcon(meal.type)} {meal.type}
                                </span>
                                {meal.cost && <span>{meal.cost}</span>}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-1">{meal.cuisine || meal.description}</p>
                              {meal.location && (
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-0.5 truncate">
                                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  {meal.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="w-1/2 relative bg-gray-100">
          {selectedDayPlaces.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Locations Available</h3>
                <p className="text-gray-600 text-sm">
                  The places in this day's itinerary don't have location coordinates yet.
                </p>
              </div>
            </div>
          ) : mapCenter ? (
            <GoogleMapReact
              bootstrapURLKeys={{ 
                key: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
                libraries: ['places']
              }}
              center={mapCenter}
              zoom={mapZoom}
              options={{
                zoomControl: true,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: true,
              }}
              onChange={({ center, zoom }) => {
                setMapCenter(center);
                setMapZoom(zoom);
              }}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map, maps }) => {
                console.log('Google Maps API loaded successfully');
              }}
            >
              {selectedDayPlaces.map((place) => (
                <MapMarker
                  key={place.id}
                  lat={place.lat}
                  lng={place.lng}
                  text={place.name}
                  isSelected={selectedPlace?.id === place.id}
                  onClick={() => handleMapMarkerClick(place)}
                />
              ))}
            </GoogleMapReact>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-700 mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          {/* Compact Map Legend */}
          <div className="absolute bottom-2 left-2 bg-white rounded-md shadow-md p-2 border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-1">Legend</div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
                <span className="text-gray-600">Places</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                <span className="text-gray-600">Selected</span>
              </div>
            </div>
            <div className="mt-1 pt-1 border-t border-gray-200 text-xs text-gray-500">
              {selectedDayPlaces.length} places
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryMapView;
