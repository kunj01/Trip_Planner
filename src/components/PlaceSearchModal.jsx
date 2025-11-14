import React, { useState, useEffect } from 'react';
import { searchPlaces, getPlaceDetails, getPlacesByLatLng } from '../api';
import axios from 'axios';

const PlaceSearchModal = ({ searchTerm, isOpen, onClose, onSelectLocation }) => {
  const [placeData, setPlaceData] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const trimmedTerm = searchTerm?.trim();
    if (!isOpen || !trimmedTerm) {
      setPlaceData(null);
      setAttractions([]);
      setError(null);
      return;
    }

    const fetchPlaceData = async () => {
      setLoading(true);
      setError(null);
      setPlaceData(null);
      setAttractions([]);
      const source = axios.CancelToken.source();

      try {
        // Search for the place - get multiple results to find the best match
        console.log('Searching for:', trimmedTerm);
        const searchResults = await searchPlaces(trimmedTerm, { limit: 10 }, source);
        
        console.log('Search results for', trimmedTerm, ':', searchResults);
        
        if (searchResults && searchResults.length > 0) {
          // Find the best match - prefer results with coordinates
          let location = searchResults.find(loc => {
            const hasCoords = (loc.latitude || loc.lat || loc.result_object?.latitude || loc.result_object?.lat) &&
                             (loc.longitude || loc.lng || loc.result_object?.longitude || loc.result_object?.lng);
            return hasCoords;
          }) || searchResults[0];
          
          console.log('Selected location:', location);
          
          // Extract coordinates properly - check multiple possible locations
          const lat = location.latitude || location.lat || 
                     location.result_object?.latitude || location.result_object?.lat ||
                     location.geo_code?.latitude || location.geo_code?.lat;
          const lng = location.longitude || location.lng || 
                     location.result_object?.longitude || location.result_object?.lng ||
                     location.geo_code?.longitude || location.geo_code?.lng;
          const locationId = location.location_id || location.result_object?.location_id;
          const locationName = location.name || location.result_object?.name || location.long_name || trimmedTerm;
          
          // If we don't have coordinates, try to get them from result_object
          let finalLat = lat;
          let finalLng = lng;
          
          if (!finalLat || !finalLng) {
            // Try to get from result_object
            if (location.result_object) {
              finalLat = location.result_object.latitude || location.result_object.lat;
              finalLng = location.result_object.longitude || location.result_object.lng;
            }
          }
          
          // Get place details if location_id is available
          let details = null;
          if (locationId) {
            try {
              // Try to get details from attractions endpoint
              details = await getPlaceDetails('attractions', locationId, source);
            } catch (err) {
              // If attractions fails, try hotels
              try {
                details = await getPlaceDetails('hotels', locationId, source);
              } catch (err2) {
                console.log('Could not fetch detailed place info');
              }
            }
          }

          const placeInfo = {
            name: locationName,
            location_id: locationId,
            lat: finalLat,
            lng: finalLng,
            address: location.address_string || location.address || location.result_object?.address_string || location.result_object?.address || '',
            description: details?.description || location.description || location.result_object?.description || '',
            rating: details?.rating || location.rating || location.result_object?.rating || null,
            num_reviews: details?.num_reviews || location.num_reviews || location.result_object?.num_reviews || null,
            website: details?.website || location.website || location.result_object?.website || null,
            phone: details?.phone || location.phone || location.result_object?.phone || null,
            photo: details?.photo?.images?.large?.url || location.photo?.images?.large?.url || location.result_object?.photo?.images?.large?.url || null,
          };
          
          console.log('Place info:', placeInfo);

          setPlaceData(placeInfo);

          // Fetch top attractions for this location
          if (placeInfo.lat && placeInfo.lng) {
            try {
              // Fetch nearby attractions using the location coordinates
              const attractionsSource = axios.CancelToken.source();
              const attractionsData = await getPlacesByLatLng(
                'attractions',
                parseFloat(placeInfo.lat),
                parseFloat(placeInfo.lng),
                { limit: 5, min_rating: 4 },
                attractionsSource
              );
              
              if (attractionsData && attractionsData.length > 0) {
                const topAttractions = attractionsData.slice(0, 5).map(attraction => ({
                  name: attraction.name,
                  address: attraction.address_string || attraction.address || '',
                  rating: attraction.rating || null,
                  num_reviews: attraction.num_reviews || null,
                }));
                setAttractions(topAttractions);
              } else {
                // Fallback to search results if no attractions found
                const nearbyAttractions = searchResults.slice(1, 6)
                  .filter(place => place.name && place.name !== locationName)
                  .map(place => ({
                    name: place.name || place.result_object?.name || '',
                    address: place.address_string || place.address || place.result_object?.address_string || place.result_object?.address || '',
                    rating: place.rating || place.result_object?.rating || null,
                  }))
                  .filter(attr => attr.name);
                setAttractions(nearbyAttractions);
              }
            } catch (err) {
              console.log('Could not fetch attractions:', err);
              // Fallback to search results
              const nearbyAttractions = searchResults.slice(1, 6)
                .filter(place => place.name && place.name !== locationName)
                .map(place => ({
                  name: place.name || place.result_object?.name || '',
                  address: place.address_string || place.address || place.result_object?.address_string || place.result_object?.address || '',
                  rating: place.rating || place.result_object?.rating || null,
                }))
                .filter(attr => attr.name);
              setAttractions(nearbyAttractions);
            }
          } else {
            // If no coordinates, use search results as attractions
            const nearbyAttractions = searchResults.slice(1, 6)
              .filter(place => place.name && place.name !== locationName)
              .map(place => ({
                name: place.name || place.result_object?.name || '',
                address: place.address_string || place.address || place.result_object?.address_string || place.result_object?.address || '',
                rating: place.rating || place.result_object?.rating || null,
              }))
              .filter(attr => attr.name);
            setAttractions(nearbyAttractions);
          }
        } else {
          setError(`Location "${trimmedTerm}" not found. Please try a more specific search term or check the spelling.`);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Error fetching place data:', err);
          const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch place information.';
          setError(`Error: ${errorMessage}. Please try again with a different search term.`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceData();

    return () => {
      // Cleanup will be handled by axios cancel token
    };
  }, [isOpen, searchTerm]);

  const handleUseThisLocation = () => {
    if (placeData) {
      // If we have coordinates, use them
      if (placeData.lat && placeData.lng) {
        onSelectLocation({
          name: placeData.name,
          lat: parseFloat(placeData.lat),
          lng: parseFloat(placeData.lng),
          location_id: placeData.location_id,
        });
        onClose();
      } else {
        // If no coordinates, still store the location name and try to search for coordinates
        // This allows the search to work even if coordinates aren't immediately available
        console.warn('No coordinates found for location, storing name only');
        // We'll need to handle this case - maybe show an error or try to geocode
        alert('Could not find exact location coordinates. Please try a more specific search term.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-3 bg-white rounded-full shadow-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110 border border-gray-200"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[90vh]">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for {searchTerm}...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-lg">{error}</p>
              </div>
            ) : placeData ? (
              <div>
                {/* Header Image */}
                {placeData.photo && (
                  <div className="w-full h-64 overflow-hidden">
                    <img
                      src={placeData.photo}
                      alt={placeData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-8">
                  {/* Title */}
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{placeData.name}</h2>
                  
                  {/* Address */}
                  {placeData.address && (
                    <p className="text-gray-600 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {placeData.address}
                    </p>
                  )}

                  {/* Rating */}
                  {placeData.rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 font-semibold text-gray-900">{placeData.rating}</span>
                      </div>
                      {placeData.num_reviews && (
                        <span className="text-gray-500 text-sm">({placeData.num_reviews.toLocaleString()} reviews)</span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {placeData.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                      <p className="text-gray-700 leading-relaxed">{placeData.description}</p>
                    </div>
                  )}

                  {/* Main Attractions */}
                  {attractions.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Main Attractions</h3>
                      <div className="space-y-2">
                        {attractions.map((attraction, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <p className="font-medium text-gray-900">{attraction.name}</p>
                            {attraction.address && (
                              <p className="text-sm text-gray-600">{attraction.address}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {attraction.rating && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-sm text-gray-700 font-medium">{attraction.rating}</span>
                                </div>
                              )}
                              {attraction.num_reviews && (
                                <span className="text-xs text-gray-500">({attraction.num_reviews} reviews)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  {(placeData.website || placeData.phone) && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        {placeData.website && (
                          <a 
                            href={placeData.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Visit Website
                          </a>
                        )}
                        {placeData.phone && (
                          <p className="flex items-center text-gray-700">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {placeData.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleUseThisLocation}
                      className="w-full px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Use This Location
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceSearchModal;

