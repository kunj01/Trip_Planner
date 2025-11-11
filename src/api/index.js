import axios from "axios";

// Get places by bounds receives the 'type', 'sw' object, 'ne'object and 'source' for effect cancellation as parameter for endpoint call
export const getPlacesByBounds = async (type, sw, ne, source) => {
    const apiKey = import.meta.env.VITE_TRAVEL_API_KEY;
    
    if (!apiKey) {
        console.warn('VITE_TRAVEL_API_KEY is not configured');
        return [];
    }

    if (!sw || !ne || !sw.lat || !sw.lng || !ne.lat || !ne.lng) {
        console.warn('Invalid bounds provided');
        return [];
    }

    try {
        const { data: { data } } = await axios.get(`https://travel-advisor.p.rapidapi.com/${type}/list-in-boundary`, {
          params: {
            bl_latitude: sw.lat,
            tr_latitude: ne.lat,
            bl_longitude: sw.lng,
            tr_longitude: ne.lng
          },
          headers: {
            'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
            'X-RapidAPI-Key': apiKey
          },
          cancelToken: source.token
        });

        // Data is returned once resolved
        return data || [];

    } catch (error) {
        // Error Handling
        if (axios.isCancel(error)) {
          return [];
        } else {
          console.error('Error fetching places by bounds:', error.response?.status || error.message);
          return [];
        }
    }
}

// Get Places by Latitude and longitude, receives 'type', 'lat', 'lng', some 'params' and source for effect cleanup and error handling as parameter to endpoint call
export const getPlacesByLatLng = async (type, lat, lng, params, source) => {
  const apiKey = import.meta.env.VITE_TRAVEL_API_KEY;
  
  if (!apiKey) {
    console.warn('VITE_TRAVEL_API_KEY is not configured');
    return [];
  }

  if (!lat || !lng) {
    console.warn('Invalid coordinates provided');
    return [];
  }

  try {
    const { data: { data } } = await axios.get(`https://travel-advisor.p.rapidapi.com/${type}/list-by-latlng`, {
      params: {
        latitude: lat,
        longitude: lng,
        ...params
      },
      headers: {
        'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
        'X-RapidAPI-Key': apiKey
      },
      cancelToken: source.token
    });

    // Data is returned once resolved
    return data || [];
  } catch (error) {
    if (axios.isCancel(error)){
      return [];
    } else {
      console.error(`Error fetching ${type} by lat/lng:`, error.response?.status || error.message);
      return [];
    }
  }
}

// Get Place details, receives 'type', 'location_id' and 'source' as parameter to endpoint call
export const getPlaceDetails = async (type, location_id, source) => {
  const apiKey = import.meta.env.VITE_TRAVEL_API_KEY;
  
  if (!apiKey) {
    console.warn('VITE_TRAVEL_API_KEY is not configured');
    return null;
  }

  if (!location_id) {
    console.warn('Invalid location_id provided');
    return null;
  }

  try {
    const { data } = await axios.get(`https://travel-advisor.p.rapidapi.com/${type}/get-details`, {
      params: {
        location_id: location_id
      }, 
      headers: {
        'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
        'X-RapidAPI-Key': apiKey
      },
      cancelToken: source.token
    });

    // Data is returned once resolved
    return data || null;
  } catch (error) {
    if (axios.isCancel(error)){
      return null;
    } else {
      console.error('Error fetching place details:', error.response?.status || error.message);
      return null;
    }
  }
}

// Get Place Review received the 'location_id' and 'source' as parameters for endpoint call
export const getPlaceReviews = async (location_id, source) => {
  const apiKey = import.meta.env.VITE_TRAVEL_API_KEY;
  
  if (!apiKey) {
    console.warn('VITE_TRAVEL_API_KEY is not configured');
    return [];
  }

  if (!location_id) {
    console.warn('Invalid location_id provided');
    return [];
  }

  try {
    const { data: { data } } = await axios.get(`https://travel-advisor.p.rapidapi.com/reviews/list`, {
      params: {
        location_id: location_id,
        limit: 20
      },
      headers: {
        'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
        'X-RapidAPI-Key': apiKey
      },
      cancelToken: source.token
    });

    // Data is returned once resolved
    return data || [];
  } catch (error) {
    if(axios.isCancel(error)) {
      return [];
    } else {
      console.error('Error fetching place reviews:', error.response?.status || error.message);
      return [];
    }
  }
}

// Search Place receives 'location', some 'params' and 'source' as parameters for endpoint call
export const searchPlaces = async (location, params, source) => {
  const apiKey = import.meta.env.VITE_TRAVEL_API_KEY;
  
  if (!apiKey) {
    console.warn('VITE_TRAVEL_API_KEY is not configured');
    return [];
  }

  if (!location) {
    console.warn('Invalid location provided');
    return [];
  }

  try {
    const { data: { data } } = await axios.get('https://travel-advisor.p.rapidapi.com/locations/search', {
      params: {
        query: location,
        ...params
      },
      headers: {
        'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
        'X-RapidAPI-Key': apiKey
      },
      cancelToken: source.token
    })

    // Data is returned once resolved
    return data || [];
  } catch (error) {
    if (axios.isCancel(error)) {
      return [];
    } else {
      console.error('Error searching places:', error.response?.status || error.message);
      return [];
    }
  }
}
