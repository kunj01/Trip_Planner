import { Loader } from '@googlemaps/js-api-loader';

// Check if API key is configured
const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
if (!apiKey) {
  console.error('VITE_GOOGLE_MAP_API_KEY is not configured. Please set it in your .env file.');
}

let loader = null;
let placesService;
let apiLoadPromise = null;

// Only create loader if API is not already loaded
const getOrCreateLoader = () => {
  // Check if Google Maps API is already loaded globally (from Map component)
  if (window.google && window.google.maps && window.google.maps.places) {
    console.log('Google Maps API already loaded globally, skipping loader creation');
    return null;
  }
  
  // Only create loader if it doesn't exist
  if (!loader && apiKey) {
    loader = new Loader({
      apiKey: apiKey,
      libraries: ['places'],
      // Don't specify version to match google-map-react's default behavior
    });
  }
  
  return loader;
};

// Helper function to ensure API is loaded before use
const ensureApiLoaded = async () => {
  if (!apiKey) {
    console.error('Google Maps API key is not configured');
    throw new Error('Google Maps API key is not configured. Please set VITE_GOOGLE_MAP_API_KEY in your .env file.');
  }
  
  // First, check if Google Maps API is already loaded globally (from Map component)
  if (window.google && window.google.maps && window.google.maps.places) {
    if (!placesService) {
      console.log('Google Maps API already loaded globally, creating PlacesService');
      placesService = new google.maps.places.PlacesService(document.createElement('div'));
    }
    return placesService;
  }
  
  // If API is not loaded, wait for it to load via event or create loader
  if (!placesService) {
    try {
      // Wait for the map to load the API (listen for the event)
      const waitForApiEvent = new Promise((resolve) => {
        let interval = null;
        
        const checkApi = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            if (interval) {
              clearInterval(interval);
            }
            resolve();
            return true;
          }
          return false;
        };
        
        // Check immediately
        if (checkApi()) {
          return; // Already loaded
        }
        
        // Listen for API loaded event from Map component
        window.addEventListener('google-maps-api-loaded', checkApi, { once: true });
        
        // Also poll for API (max 10 seconds)
        let attempts = 0;
        const maxAttempts = 100;
        interval = setInterval(() => {
          attempts++;
          if (checkApi() || attempts >= maxAttempts) {
            if (interval) {
              clearInterval(interval);
            }
            resolve();
          }
        }, 100);
      });
      
      await waitForApiEvent;
      
      // Now create PlacesService if API is available
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Creating PlacesService from global Google Maps API');
        placesService = new google.maps.places.PlacesService(document.createElement('div'));
      } else {
        // If still not loaded, try using loader as fallback
        const mapLoader = getOrCreateLoader();
        if (mapLoader && !apiLoadPromise) {
          console.log('Loading Google Maps API via loader...');
          apiLoadPromise = mapLoader.load()
            .then(() => {
              placesService = new google.maps.places.PlacesService(document.createElement('div'));
              return placesService;
            })
            .catch((error) => {
              console.error('Error loading Google Maps API:', error);
              throw new Error('Failed to load Google Maps API. Please check your API key and network connection.');
            });
          
          await apiLoadPromise;
        } else {
          throw new Error('Google Maps API failed to initialize properly');
        }
      }
      
      console.log('Google Maps API loaded successfully');
    } catch (error) {
      console.error('Error loading Google Maps API:', error);
      // Final fallback check
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Using global Google Maps API as final fallback');
        placesService = new google.maps.places.PlacesService(document.createElement('div'));
        return placesService;
      }
      throw new Error('Google Maps API failed to load. Please check your API key and network connection.');
    }
  }
  
  if (!placesService) {
    throw new Error('Google Maps API failed to load. Please check your API key and try again.');
  }
  
  return placesService;
};

export const searchDestinations = async (query) => {
  const service = await ensureApiLoaded();

  const request = {
    query,
    fields: ['name', 'formatted_address', 'place_id'],
  };

  return new Promise((resolve, reject) => {
    service.findPlaceFromQuery(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results || []);
      } else {
        const errorMessage = `Place search failed: ${status}. ${status === 'ZERO_RESULTS' ? 'No destinations found for your query.' : status === 'REQUEST_DENIED' ? 'API request denied. Please check your API key permissions.' : 'Please try again.'}`;
        reject(new Error(errorMessage));
      }
    });
  });
};

export const getPlaceDetails = async (placeId) => {
  const service = await ensureApiLoaded();

  const request = {
    placeId,
    fields: ['name', 'photos', 'rating', 'reviews', 'types', 'geometry', 'formatted_address', 'place_id'],
  };

  return new Promise((resolve, reject) => {
    service.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(place);
      } else {
        const errorMessage = `Place details request failed: ${status}. ${status === 'REQUEST_DENIED' ? 'API request denied. Please check your API key permissions.' : 'Please try again.'}`;
        reject(new Error(errorMessage));
      }
    });
  });
};

// Helper function to extract coordinates (handle both function and value cases)
const getCoordinates = (place) => {
  if (!place.geometry || !place.geometry.location) return { lat: null, lng: null };
  
  const location = place.geometry.location;
  // Handle both function call (Google Maps API object) and direct value
  const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
  const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
  
  return { lat, lng };
};

// Helper function to get photo URL with better error handling and multiple fallbacks
const getPhotoUrl = (place) => {
  if (!place.photos || place.photos.length === 0) return null;
  try {
    // Try to get the best quality photo available
    // Try multiple photos if the first one fails
    for (let i = 0; i < Math.min(3, place.photos.length); i++) {
      const photo = place.photos[i];
      
      // Handle Google Maps Photo object with getUrl method
      if (photo && typeof photo.getUrl === 'function') {
        try {
          // Try higher resolution first
          const url = photo.getUrl({ maxWidth: 1200, maxHeight: 900 });
          if (url) return url;
        } catch (getUrlError) {
          // Try with lower resolution if high res fails
          try {
            const url = photo.getUrl({ maxWidth: 800, maxHeight: 600 });
            if (url) return url;
          } catch (fallbackError) {
            console.warn(`Error calling getUrl on photo ${i}:`, fallbackError);
            continue; // Try next photo
          }
        }
      }
      
      // If photo is already a URL string
      if (typeof photo === 'string' && photo.startsWith('http')) {
        return photo;
      }
      
      // If photo has a url property
      if (photo && photo.url && typeof photo.url === 'string') {
        return photo.url;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Error getting photo URL:', error);
    return null;
  }
};

// Fallback function to generate basic itinerary without API
const generateFallbackItinerary = (destination, numDays, budget = 'moderate', activityLevel = 'moderate') => {
  console.log('Generating fallback itinerary for', destination);
  
  const daysArray = Array.from({ length: parseInt(numDays) }, (_, dayIndex) => {
    const dayNum = dayIndex + 1;
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];
    
    const activities = timeSlots.map((timeSlot, idx) => ({
      time: timeSlot,
      name: `${timeSlot} Activity in ${destination}`,
      description: `Explore ${destination} during ${timeSlot.toLowerCase()}`,
      location: destination,
      cost: budget === 'budget' ? 'Free - $20' : budget === 'luxury' ? '$50 - $150' : '$20 - $50',
      place_id: `fallback-${dayIndex}-${idx}`,
    }));

    const meals = [
      { type: 'Breakfast', restaurant: 'Local Cafe', cuisine: 'Local breakfast', place_id: `meal-breakfast-${dayIndex}` },
      { type: 'Lunch', restaurant: 'Local Restaurant', cuisine: 'Local cuisine', place_id: `meal-lunch-${dayIndex}` },
    ];
    
    if (budget === 'moderate' || budget === 'luxury') {
      meals.push({ type: 'Dinner', restaurant: 'Fine Dining', cuisine: budget === 'luxury' ? 'Fine dining' : 'Local cuisine', place_id: `meal-dinner-${dayIndex}` });
    }

    return {
      day: dayNum,
      title: `Day ${dayNum} in ${destination}`,
      description: `Explore ${destination} with planned activities.`,
      activities,
      meals,
      transportation: activityLevel === 'active' ? 'Walking and public transport' : activityLevel === 'relaxed' ? 'Private transport recommended' : 'Mix of walking and transport',
    };
  });

  const budgetMultipliers = {
    budget: 0.6,
    moderate: 1.0,
    luxury: 1.8,
  };
  const baseCost = 1500;
  const budgetMultiplier = budgetMultipliers[budget] || 1.0;
  const totalCost = Math.round(baseCost * budgetMultiplier * numDays);

  return {
    destination,
    days: daysArray,
    recommendations: [],
    budget: {
      total: totalCost,
      breakdown: [
        { item: 'Flights', cost: Math.round(totalCost * 0.4) },
        { item: 'Accommodation', cost: Math.round(totalCost * 0.35) },
        { item: 'Activities', cost: Math.round(totalCost * 0.15) },
        { item: 'Food', cost: Math.round(totalCost * 0.1) },
      ],
    },
    totalCost: `$${totalCost.toLocaleString()}`,
    tips: [
      `Pack for ${activityLevel === 'active' ? 'active' : 'comfortable'} activities.`,
      'Stay hydrated and carry water with you.',
      'Enjoy your trip to ' + destination + '!',
    ],
  };
};

// Enhanced itinerary generation with place details and coordinates for map
export const generateItineraryWithDetails = async (formData) => {
  console.log('generateItineraryWithDetails called with:', formData);
  
  const { destination, days, interests, budget = 'moderate', travelGroup, activityLevel } = formData;

  if (!destination) {
    console.error('Destination is missing');
    throw new Error('Destination is required.');
  }

  const numDays = days || 3;
  console.log(`Generating itinerary for ${destination} for ${numDays} days`);
  
  let service;
  try {
    service = await ensureApiLoaded();
    console.log('Google Maps API loaded successfully');
  } catch (apiError) {
    console.error('Failed to load Google Maps API:', apiError);
    // Instead of throwing, generate fallback itinerary
    console.warn('Using fallback itinerary generation');
    return generateFallbackItinerary(destination, numDays, budget, activityLevel);
  }

  // Build interest-based query
  let attractionsQuery = `tourist attractions in ${destination}`;
  if (interests && interests.length > 0) {
    const interestMap = {
      'attractions': 'must-see attractions',
      'tours': 'tours experiences',
      'food': 'food destinations',
      'hidden-gems': 'hidden gems',
      'architecture': 'architectural landmarks',
      'water': 'water activities',
      'shopping': 'shopping',
      'culture': 'cultural sites',
      'nature': 'nature parks',
      'nightlife': 'nightlife',
      'photography': 'photography spots',
      'relaxation': 'relaxation spots',
    };
    const interestTerms = interests.map(i => interestMap[i] || i).join(' ');
    attractionsQuery = `${interestTerms} in ${destination}`;
  }

  const attractionsRequest = {
    query: attractionsQuery,
    fields: ['name', 'place_id', 'formatted_address', 'rating', 'photos', 'geometry'],
  };

  const restaurantsRequest = {
    query: `restaurants in ${destination}`,
    fields: ['name', 'place_id', 'formatted_address', 'rating', 'photos', 'geometry'],
  };

  try {
    console.log('Starting API calls for attractions and restaurants...');
    console.log('Attractions query:', attractionsQuery);
    console.log('Restaurants query: restaurants in', destination);
    
    const [attractions, restaurants] = await Promise.all([
      new Promise((resolve, reject) => {
        console.log('Calling textSearch for attractions...');
        service.textSearch(attractionsRequest, (results, status) => {
          console.log('Attractions search status:', status, 'Results:', results?.length || 0);
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(results || []);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            console.warn('No attractions found for:', destination);
            resolve([]);
          } else {
            const errorMsg = status === 'REQUEST_DENIED' 
              ? 'API request denied. Please check your API key has Places API enabled.'
              : `Attractions search failed: ${status}`;
            console.error('Attractions search error:', errorMsg);
            reject(new Error(errorMsg));
          }
        });
      }),
      new Promise((resolve, reject) => {
        console.log('Calling textSearch for restaurants...');
        service.textSearch(restaurantsRequest, (results, status) => {
          console.log('Restaurants search status:', status, 'Results:', results?.length || 0);
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(results || []);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            console.warn('No restaurants found for:', destination);
            resolve([]);
          } else {
            const errorMsg = status === 'REQUEST_DENIED'
              ? 'API request denied. Please check your API key has Places API enabled.'
              : `Restaurants search failed: ${status}`;
            console.error('Restaurants search error:', errorMsg);
            reject(new Error(errorMsg));
          }
        });
      }),
    ]);
    
    console.log(`Received ${attractions.length} attractions and ${restaurants.length} restaurants`);

    // Combine attractions and restaurants for recommendations
    const allPlaces = [...attractions, ...restaurants];
    
    // Fetch detailed place information including photos for ALL places
    // This ensures we have photos for both recommendations and itinerary items
    // Batch requests to avoid hitting rate limits - process in chunks of 5
    console.log('Fetching detailed place information with photos for all places...');
    const batchSize = 5;
    const placesWithDetails = [];
    
    for (let i = 0; i < allPlaces.length; i += batchSize) {
      const batch = allPlaces.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (place) => {
          // Always fetch place details to ensure we have the best quality photos
          // Even if place has photos, getDetails might have more or better ones
          try {
            const detailsRequest = {
              placeId: place.place_id,
              fields: ['name', 'photos', 'rating', 'formatted_address', 'geometry', 'place_id', 'types'],
            };
            
            return new Promise((resolve) => {
              service.getDetails(detailsRequest, (details, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && details) {
                  // Merge details with original place data, prefer details photos
                  const mergedPlace = {
                    ...place,
                    photos: details.photos && details.photos.length > 0 ? details.photos : (place.photos || []),
                    rating: details.rating || place.rating,
                    formatted_address: details.formatted_address || place.formatted_address,
                    geometry: details.geometry || place.geometry,
                    types: details.types || place.types,
                  };
                  resolve(mergedPlace);
                } else {
                  // If details fetch fails, use original place
                  console.warn(`Failed to fetch details for ${place.name}: ${status}`);
                  resolve(place);
                }
              });
            });
          } catch (error) {
            console.warn(`Error fetching details for ${place.name}:`, error);
            return place;
          }
        })
      );
      placesWithDetails.push(...batchResults);
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < allPlaces.length) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }
    
    const placesWithPhotosCount = placesWithDetails.filter(p => p.photos && p.photos.length > 0).length;
    console.log(`Fetched details for ${placesWithDetails.length} places, ${placesWithPhotosCount} have photos`);
    
    // Extract coordinates and create recommendation objects with improved photo handling
    const recommendations = placesWithDetails.map((place) => {
      const { lat, lng } = getCoordinates(place);
      let photo = getPhotoUrl(place);
      
      // Don't set placeholder here - let the UI handle it for better performance
      // Only set photo if we have a real one from Google Maps

      return {
        place_id: place.place_id,
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating || 0,
        photo: photo || null, // Set to null if no photo, UI will show placeholder
        lat: lat,
        lng: lng,
        latitude: lat,
        longitude: lng,
        type: attractions.some(a => a.place_id === place.place_id) ? 'attraction' : 'restaurant',
      };
    }).filter(place => place.lat != null && place.lng != null && !isNaN(place.lat) && !isNaN(place.lng)); // Filter out places without valid coordinates
    
    const photosCount = recommendations.filter(r => r.photo && typeof r.photo === 'string' && r.photo.startsWith('http')).length;
    console.log(`Created ${recommendations.length} recommendations with ${photosCount} photos (${((photosCount/recommendations.length)*100).toFixed(1)}% coverage)`);

    // Create lookup maps for places with photos by place_id
    const placesMap = new Map();
    placesWithDetails.forEach(place => {
      if (place.place_id) {
        placesMap.set(place.place_id, place);
      }
    });
    
    // Separate attractions and restaurants from placesWithDetails for itinerary generation
    const attractionsWithPhotos = placesWithDetails.filter(place => 
      attractions.some(a => a.place_id === place.place_id)
    );
    const restaurantsWithPhotos = placesWithDetails.filter(place => 
      restaurants.some(r => r.place_id === place.place_id)
    );
    
    console.log(`Using ${attractionsWithPhotos.length} attractions and ${restaurantsWithPhotos.length} restaurants for itinerary`);
    console.log(`Attractions with photos: ${attractionsWithPhotos.filter(a => a.photos && a.photos.length > 0).length}/${attractionsWithPhotos.length}`);
    console.log(`Restaurants with photos: ${restaurantsWithPhotos.filter(r => r.photos && r.photos.length > 0).length}/${restaurantsWithPhotos.length}`);

    // Generate itinerary with time distribution
    const budgetMultipliers = {
      budget: 0.6,
      moderate: 1.0,
      luxury: 1.8,
    };
    const baseCost = 1500;
    const budgetMultiplier = budgetMultipliers[budget] || 1.0;
    const totalCost = Math.round(baseCost * budgetMultiplier * numDays);

    const daysArray = Array.from({ length: parseInt(numDays) }, (_, dayIndex) => {
      const dayNum = dayIndex + 1;
      const totalAttractions = attractionsWithPhotos.length;
      const attractionsPerDay = Math.ceil(totalAttractions / numDays);
      const startIdx = dayIndex * attractionsPerDay;
      const endIdx = Math.min(startIdx + attractionsPerDay, totalAttractions);
      const dayAttractions = attractionsWithPhotos.slice(startIdx, endIdx);
      
      const lunchIndex = dayIndex % Math.max(1, restaurantsWithPhotos.length);
      const dinnerIndex = (dayIndex + 1) % Math.max(1, restaurantsWithPhotos.length);
      const breakfastIndex = (dayIndex + 2) % Math.max(1, restaurantsWithPhotos.length);

      const timeSlots = ['Morning', 'Afternoon', 'Evening'];
      const activities = [];
      
      if (dayAttractions.length > 0) {
        const activitiesPerSlot = Math.floor(dayAttractions.length / timeSlots.length);
        const remainder = dayAttractions.length % timeSlots.length;
        let attractionIndex = 0;
        
        timeSlots.forEach((timeSlot, slotIdx) => {
          const countForThisSlot = activitiesPerSlot + (slotIdx < remainder ? 1 : 0);
          for (let i = 0; i < countForThisSlot && attractionIndex < dayAttractions.length; i++) {
            const attraction = dayAttractions[attractionIndex];
            const { lat, lng } = getCoordinates(attraction);
            const photo = getPhotoUrl(attraction);
            activities.push({
              time: timeSlot,
              name: attraction.name || 'Attraction',
              description: `Visit ${attraction.name || 'this attraction'}${attraction.rating ? ` (Rating: ${attraction.rating}/5)` : ''}`,
              location: attraction.formatted_address || destination,
              cost: budget === 'budget' ? 'Free - $20' : budget === 'luxury' ? '$50 - $150' : '$20 - $50',
              place_id: attraction.place_id || `placeholder-${dayIndex}-${attractionIndex}`,
              lat: lat,
              lng: lng,
              photo: photo || null, // Add photo to activity
            });
            attractionIndex++;
          }
        });
        
        const timeOrder = { 'Morning': 1, 'Afternoon': 2, 'Evening': 3 };
        activities.sort((a, b) => (timeOrder[a.time] || 0) - (timeOrder[b.time] || 0));
      } else {
        // If no attractions, create placeholder activities for each time slot
        activities.push(
          { 
            time: 'Morning', 
            name: 'Explore the area', 
            description: `Discover ${destination}`, 
            location: destination, 
            cost: 'Varies',
            place_id: `placeholder-morning-${dayIndex}`,
          },
          { 
            time: 'Afternoon', 
            name: 'Local sightseeing', 
            description: `Take in the sights of ${destination}`, 
            location: destination, 
            cost: 'Varies',
            place_id: `placeholder-afternoon-${dayIndex}`,
          },
          { 
            time: 'Evening', 
            name: 'Evening stroll', 
            description: `Enjoy the evening in ${destination}`, 
            location: destination, 
            cost: 'Free',
            place_id: `placeholder-evening-${dayIndex}`,
          }
        );
      }

      const meals = [];
      if (restaurantsWithPhotos.length > 0 && restaurantsWithPhotos[breakfastIndex]) {
        const restaurant = restaurantsWithPhotos[breakfastIndex];
        const { lat, lng } = getCoordinates(restaurant);
        const photo = getPhotoUrl(restaurant);
        meals.push({
          type: 'Breakfast',
          restaurant: restaurant.name,
          cuisine: 'Local breakfast',
          place_id: restaurant.place_id,
          lat: lat,
          lng: lng,
          location: restaurant.formatted_address || destination,
          photo: photo || null, // Add photo to meal
        });
      }
      if (restaurantsWithPhotos.length > 0 && restaurantsWithPhotos[lunchIndex]) {
        const restaurant = restaurantsWithPhotos[lunchIndex];
        const { lat, lng } = getCoordinates(restaurant);
        const photo = getPhotoUrl(restaurant);
        meals.push({
          type: 'Lunch',
          restaurant: restaurant.name,
          cuisine: 'Local cuisine',
          place_id: restaurant.place_id,
          lat: lat,
          lng: lng,
          location: restaurant.formatted_address || destination,
          photo: photo || null, // Add photo to meal
        });
      }
      if ((budget === 'moderate' || budget === 'luxury') && restaurantsWithPhotos.length > 0 && restaurantsWithPhotos[dinnerIndex]) {
        const restaurant = restaurantsWithPhotos[dinnerIndex];
        const { lat, lng } = getCoordinates(restaurant);
        const photo = getPhotoUrl(restaurant);
        meals.push({
          type: 'Dinner',
          restaurant: restaurant.name,
          cuisine: budget === 'luxury' ? 'Fine dining' : 'Local cuisine',
          place_id: restaurant.place_id,
          lat: lat,
          lng: lng,
          location: restaurant.formatted_address || destination,
          photo: photo || null, // Add photo to meal
        });
      }

      return {
        day: dayNum,
        title: `Day ${dayNum} in ${destination}`,
        description: `Explore ${destination} with ${activities.length} planned activities${meals.length > 0 ? ` and ${meals.length} meal${meals.length > 1 ? 's' : ''}` : ''}.`,
        activities,
        meals,
        transportation: activityLevel === 'active' ? 'Walking and public transport' : activityLevel === 'relaxed' ? 'Private transport recommended' : 'Mix of walking and transport',
      };
    });

    const travelTips = [
      `Pack for ${activityLevel === 'active' ? 'active' : 'comfortable'} activities.`,
      'Stay hydrated and carry water with you.',
      travelGroup === 'solo' ? 'Stay aware of your surroundings.' : travelGroup === 'family' ? 'Keep family members together in crowded areas.' : 'Enjoy your time with your travel companions.',
    ];

    if (interests && interests.length > 0) {
      travelTips.push(`Don't forget to explore ${interests.join(' and ')} during your visit.`);
    }

    const result = {
      destination,
      days: daysArray,
      recommendations: recommendations,
      budget: {
        total: totalCost,
        breakdown: [
          { item: 'Flights', cost: Math.round(totalCost * 0.4) },
          { item: 'Accommodation', cost: Math.round(totalCost * 0.35) },
          { item: 'Activities', cost: Math.round(totalCost * 0.15) },
          { item: 'Food', cost: Math.round(totalCost * 0.1) },
        ],
      },
      totalCost: `$${totalCost.toLocaleString()}`,
      tips: travelTips,
    };

    console.log('Itinerary result:', {
      destination: result.destination,
      daysCount: result.days.length,
      recommendationsCount: result.recommendations.length,
      hasDays: result.days.length > 0,
      hasRecommendations: result.recommendations.length > 0,
    });

    return result;
  } catch (error) {
    console.error('Error in generateItineraryWithDetails:', error);
    
    // If it's an API key or critical error, try fallback
    if (error.message && (error.message.includes('API key') || error.message.includes('API request denied'))) {
      console.warn('API error encountered, using fallback itinerary');
      try {
        return generateFallbackItinerary(destination, numDays, budget, activityLevel);
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError);
        throw error; // Throw original error if fallback fails
      }
    }
    
    // For other errors, try fallback before throwing
    console.warn('Error encountered, attempting fallback itinerary');
    try {
      return generateFallbackItinerary(destination, numDays, budget, activityLevel);
    } catch (fallbackError) {
      console.error('Fallback generation failed:', fallbackError);
      throw new Error(`Failed to generate itinerary: ${error.message || 'Unknown error'}`);
    }
  }
};

export const generateItinerary = async (formData) => {
  const { destination, days, interests, budget, travelGroup, activityLevel } = formData;

  if (!destination || !days) {
    throw new Error('Destination and number of days are required.');
  }

  const service = await ensureApiLoaded();

  const attractionsRequest = {
    query: `tourist attractions in ${destination}`,
    fields: ['name', 'place_id', 'formatted_address', 'rating'],
  };

  const restaurantsRequest = {
    query: `restaurants in ${destination}`,
    fields: ['name', 'place_id', 'formatted_address', 'rating'],
  };

  try {
    const [attractions, restaurants] = await Promise.all([
      new Promise((resolve, reject) => {
        service.textSearch(attractionsRequest, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(results || []);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            // Return empty array instead of rejecting for zero results
            resolve([]);
          } else {
            const errorMsg = status === 'REQUEST_DENIED' 
              ? 'API request denied. Please check your API key has Places API enabled.'
              : `Attractions search failed: ${status}`;
            reject(new Error(errorMsg));
          }
        });
      }),
      new Promise((resolve, reject) => {
        service.textSearch(restaurantsRequest, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(results || []);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            // Return empty array instead of rejecting for zero results
            resolve([]);
          } else {
            const errorMsg = status === 'REQUEST_DENIED'
              ? 'API request denied. Please check your API key has Places API enabled.'
              : `Restaurants search failed: ${status}`;
            reject(new Error(errorMsg));
          }
        });
      }),
    ]);

    // Validate we have enough data - create placeholder if needed
    if (attractions.length === 0 && restaurants.length === 0) {
      console.warn(`No attractions or restaurants found for ${destination}. Creating placeholder itinerary.`);
      // We'll create a basic itinerary with placeholder activities
    } else {
      console.log(`Found ${attractions.length} attractions and ${restaurants.length} restaurants`);
    }

    // Calculate budget based on selection
    const budgetMultipliers = {
      budget: 0.6,
      moderate: 1.0,
      luxury: 1.8,
    };
    const baseCost = 1500;
    const budgetMultiplier = budgetMultipliers[budget] || 1.0;
    const totalCost = Math.round(baseCost * budgetMultiplier * days);

    // Create daily plan matching the component's expected structure
    const daysArray = Array.from({ length: parseInt(days) }, (_, dayIndex) => {
      const dayNum = dayIndex + 1;
      
      // Calculate how many attractions to assign per day (distribute evenly)
      const totalAttractions = attractions.length;
      const attractionsPerDay = Math.ceil(totalAttractions / days);
      const startIdx = dayIndex * attractionsPerDay;
      const endIdx = Math.min(startIdx + attractionsPerDay, totalAttractions);
      const dayAttractions = attractions.slice(startIdx, endIdx);
      
      // Get restaurants for this day (cycle through available restaurants)
      const lunchIndex = dayIndex % Math.max(1, restaurants.length);
      const dinnerIndex = (dayIndex + 1) % Math.max(1, restaurants.length);
      const breakfastIndex = (dayIndex + 2) % Math.max(1, restaurants.length);

      // Distribute activities across time slots (Morning, Afternoon, Evening)
      const timeSlots = ['Morning', 'Afternoon', 'Evening'];
      const activities = [];
      
      // If we have attractions, distribute them evenly across time slots
      if (dayAttractions.length > 0) {
        // Calculate how many activities per time slot
        const activitiesPerSlot = Math.floor(dayAttractions.length / timeSlots.length);
        const remainder = dayAttractions.length % timeSlots.length;
        
        let attractionIndex = 0;
        
        // Distribute attractions to each time slot
        timeSlots.forEach((timeSlot, slotIdx) => {
          // Calculate how many activities for this time slot
          // Distribute remainder evenly (first slots get one extra if needed)
          const countForThisSlot = activitiesPerSlot + (slotIdx < remainder ? 1 : 0);
          
          // Add activities for this time slot
          for (let i = 0; i < countForThisSlot && attractionIndex < dayAttractions.length; i++) {
            const attraction = dayAttractions[attractionIndex];
            activities.push({
              time: timeSlot,
              name: attraction.name || 'Attraction',
              description: `Visit ${attraction.name}${attraction.rating ? ` (Rating: ${attraction.rating}/5)` : ''}`,
              location: attraction.formatted_address || destination,
              cost: budget === 'budget' ? 'Free - $20' : budget === 'luxury' ? '$50 - $150' : '$20 - $50',
            });
            attractionIndex++;
          }
        });
        
        // Sort activities by time slot order (Morning, Afternoon, Evening)
        const timeOrder = { 'Morning': 1, 'Afternoon': 2, 'Evening': 3 };
        activities.sort((a, b) => (timeOrder[a.time] || 0) - (timeOrder[b.time] || 0));
      } else {
        // If no attractions, add placeholder activities for each time slot
        activities.push(
          {
            time: 'Morning',
            name: 'Explore the area',
            description: `Discover ${destination} at your own pace`,
            location: destination,
            cost: 'Varies',
          },
          {
            time: 'Afternoon',
            name: 'Local sightseeing',
            description: `Take in the sights and sounds of ${destination}`,
            location: destination,
            cost: 'Varies',
          },
          {
            time: 'Evening',
            name: 'Evening stroll',
            description: `Enjoy the evening atmosphere in ${destination}`,
            location: destination,
            cost: 'Free',
          }
        );
      }

      // Create meals array with proper timing
      const meals = [];
      
      // Breakfast (if restaurants available)
      if (restaurants.length > 0 && restaurants[breakfastIndex]) {
        meals.push({
          type: 'Breakfast',
          restaurant: restaurants[breakfastIndex].name,
          cuisine: 'Local breakfast',
        });
      }
      
      // Lunch (always add if restaurants available)
      if (restaurants.length > 0 && restaurants[lunchIndex]) {
        meals.push({
          type: 'Lunch',
          restaurant: restaurants[lunchIndex].name,
          cuisine: 'Local cuisine',
        });
      }
      
      // Dinner (add for moderate and luxury budgets)
      if ((budget === 'moderate' || budget === 'luxury') && restaurants.length > 0 && restaurants[dinnerIndex]) {
        meals.push({
          type: 'Dinner',
          restaurant: restaurants[dinnerIndex].name,
          cuisine: budget === 'luxury' ? 'Fine dining' : 'Local cuisine',
        });
      }

      return {
        day: dayNum,
        title: `Day ${dayNum} in ${destination}`,
        description: `Explore ${destination} with ${activities.length} planned activities${meals.length > 0 ? ` and ${meals.length} meal${meals.length > 1 ? 's' : ''}` : ''}.`,
        activities,
        meals,
        transportation: activityLevel === 'active' ? 'Walking and public transport' : activityLevel === 'relaxed' ? 'Private transport recommended' : 'Mix of walking and transport',
      };
    });

    // Generate travel tips based on inputs
    const travelTips = [
      `Pack for ${activityLevel === 'active' ? 'active' : 'comfortable'} activities.`,
      'Stay hydrated and carry water with you.',
      travelGroup === 'solo' ? 'Stay aware of your surroundings.' : travelGroup === 'family' ? 'Keep family members together in crowded areas.' : 'Enjoy your time with your travel companions.',
    ];

    if (interests && interests.length > 0) {
      travelTips.push(`Don't forget to explore ${interests.join(' and ')} during your visit.`);
    }

    return {
      destination,
      days: daysArray, // Changed from dailyPlan to days to match component expectation
      budget: {
        total: totalCost,
        breakdown: [
          { item: 'Flights', cost: Math.round(totalCost * 0.4) },
          { item: 'Accommodation', cost: Math.round(totalCost * 0.35) },
          { item: 'Activities', cost: Math.round(totalCost * 0.15) },
          { item: 'Food', cost: Math.round(totalCost * 0.1) },
        ],
      },
      totalCost: `$${totalCost.toLocaleString()}`,
      tips: travelTips, // Changed from travelTips to tips to match component expectation
    };
  } catch (error) {
    // Re-throw with more context
    if (error.message.includes('API')) {
      throw error;
    }
    throw new Error(`Failed to generate itinerary: ${error.message}`);
  }
};