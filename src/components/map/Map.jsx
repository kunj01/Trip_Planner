import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import ReactStarsRating from 'react-awesome-stars-rating';

// Map Component with its props destructured
const Map = ({ places, coordinates, setCoordinates, setBounds }) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
    const mapRef = useRef(null);
    const boundsTimeoutRef = useRef(null);
    const [mapCenter, setMapCenter] = useState(() => {
        // Initialize with coordinates if available, otherwise default to New York
        return coordinates && coordinates.lat && coordinates.lng 
            ? coordinates 
            : { lat: 40.7128, lng: -74.0060 };
    });
    
    // Stable default coordinates that never change (to avoid defaultCenter warning)
    const defaultCoords = useMemo(() => ({ lat: 40.7128, lng: -74.0060 }), []);
    
    // Update map center when coordinates change (but don't change defaultCenter)
    useEffect(() => {
        if (coordinates && coordinates.lat && coordinates.lng) {
            setMapCenter(coordinates);
        }
    }, [coordinates]);
    
    // Memoize places to prevent unnecessary re-renders
    const validPlaces = useMemo(() => {
        if (!Array.isArray(places)) return [];
        return places.filter(place => {
            if (!place) return false;
            // Check for latitude/longitude (from Travel Advisor API)
            const lat = place.latitude || place.lat;
            const lng = place.longitude || place.lng;
            return lat != null && lng != null && 
                   !isNaN(Number(lat)) && 
                   !isNaN(Number(lng)) &&
                   Number(lat) >= -90 && Number(lat) <= 90 &&
                   Number(lng) >= -180 && Number(lng) <= 180;
        });
    }, [places]);
    
    // Memoize onChange handler with debouncing to prevent too many API calls
    const handleMapChange = useCallback((e) => {
        // onChange Event sets new Coordinates for Google Map Component
        if (e.center && setCoordinates) {
            setCoordinates({ lat: e.center.lat, lng: e.center.lng });
            setMapCenter({ lat: e.center.lat, lng: e.center.lng });
        }
        
        // Debounce bounds updates to prevent rate limiting (429 errors)
        // Clear any existing timeout
        if (boundsTimeoutRef.current) {
            clearTimeout(boundsTimeoutRef.current);
        }
        
        // Set new timeout to update bounds after 500ms of no changes
        boundsTimeoutRef.current = setTimeout(() => {
            // onChange Event sets new Bounds for Google Map Component
            // google-map-react provides both 'bounds' and 'marginBounds'
            // marginBounds accounts for the margin prop, bounds is the actual viewport bounds
            // Both have ne (northeast) and sw (southwest) properties with lat and lng
            const mapBounds = e.marginBounds || e.bounds;
            if (mapBounds && setBounds && mapBounds.ne && mapBounds.sw) {
                setBounds({ 
                    ne: { 
                        lat: mapBounds.ne.lat, 
                        lng: mapBounds.ne.lng 
                    }, 
                    sw: { 
                        lat: mapBounds.sw.lat, 
                        lng: mapBounds.sw.lng 
                    } 
                });
            }
        }, 500); // 500ms debounce delay
    }, [setCoordinates, setBounds]);
    
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (boundsTimeoutRef.current) {
                clearTimeout(boundsTimeoutRef.current);
            }
        };
    }, []);
    
    if (!apiKey) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 min-h-[400px]">
                <div className="text-center p-4">
                    <p className="text-red-600 font-semibold mb-2">Google Maps API Key Missing</p>
                    <p className="text-gray-600 text-sm">Please set VITE_GOOGLE_MAP_API_KEY in your .env file</p>
                </div>
            </div>
        );
    }

    return ( 
        <div className="w-full h-full" style={{ minHeight: '400px', height: '100%' }}>
            <GoogleMapReact
                bootstrapURLKeys={{ 
                    key: apiKey,
                    libraries: ['places']
                }}
                defaultCenter={defaultCoords}
                center={mapCenter}
                defaultZoom={14}
                margin={[50,50,50,50]}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => {
                    // Store map reference
                    mapRef.current = map;
                    // Make sure Google Maps API is available globally for Header component
                    if (!window.google) {
                        window.google = { maps };
                    }
                    // Dispatch event to notify that API is loaded
                    window.dispatchEvent(new Event('google-maps-api-loaded'));
                    
                    // Trigger initial bounds update after map loads
                    if (map && setBounds) {
                        setTimeout(() => {
                            const bounds = map.getBounds();
                            if (bounds) {
                                const ne = bounds.getNorthEast();
                                const sw = bounds.getSouthWest();
                                setBounds({
                                    ne: { lat: ne.lat(), lng: ne.lng() },
                                    sw: { lat: sw.lat(), lng: sw.lng() }
                                });
                            }
                        }, 100);
                    }
                }}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                }}
                onChange={handleMapChange}
                onChildClick={() => {}}
            >
            {validPlaces.map((place, i) => {
                const lat = Number(place.latitude || place.lat);
                const lng = Number(place.longitude || place.lng);
                
                if (isNaN(lat) || isNaN(lng)) return null;
                
                return (
                    <div 
                        key={place.location_id || place.place_id || i}
                        className="hover:z-30 relative cursor-pointer"
                        lat={lat}
                        lng={lng}
                    >
                        <div className="hidden md:block font-semibold p-1 shadow-md hover:shadow-2xl hover:border-2 hover:border-gray-300 text-center w-fit transition ease-in duration-1000 rounded-sm overflow-hidden bg-white">
                            {/* Place Name */}
                            <p>{ place.name }</p>
                            {/* --- */}

                            {/* Place Photo - Display only if Photo is found in object */}
                            { place.photo?.images?.small?.url && (
                                <img 
                                    src={place.photo.images.small.url} 
                                    alt={place.name}
                                    className="w-20 h-full object-cover" 
                                />
                            )}
                            {/* --- */}

                            {/* Place Rating with 'place.rating' value passed to generate a React Stars Rating element */}
                            {place.rating && (
                                <ReactStarsRating 
                                    value={Number(place.rating)} 
                                    className="flex w-fit m-auto" 
                                    size={10} 
                                    isEdit={false} 
                                    primaryColor="#00afef" 
                                    secondaryColor="#e5e7eb" 
                                />
                            )}
                            {/* --- */}
                        </div>

                        {/* Place Item Displayed on map */}
                        <div className="group md:hidden">
                            <svg className="text-cyan-500 h-7 w-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <div className="hidden group-hover:block font-semibold p-1 shadow-md text-center w-fit rounded-sm overflow-hidden bg-white">
                                {/* Place Name */}
                                <p>{ place.name }</p>
                                {/* --- */}

                                {/* Place Photo - Display only if Photo is found in object */}
                                { place.photo?.images?.small?.url && (
                                    <img 
                                        src={place.photo.images.small.url} 
                                        alt={place.name}
                                        className="w-full h-full object-cover" 
                                    />
                                )}
                                {/* --- */}
                            </div>
                        </div>
                        {/* --- */}
                    </div>
                );
            })}
            </GoogleMapReact>
        </div>
     );
}
 
export default Map;