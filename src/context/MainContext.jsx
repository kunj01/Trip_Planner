import React, { useState, useEffect } from 'react';
import { getPlacesByBounds, getPlacesByLatLng } from "../api";
import axios from "axios";

export const MainContext = React.createContext();

export const MainContextProvider = ({ children }) => {
    const [places, setPlaces] = useState();
    const [filteredPlaces, setFilteredPlaces] = useState();
    const [coordinates, setCoordinates] = useState({});
    const [bounds, setBounds] = useState({});
    const [rating, setRating] = useState(0);
    const [type, setType] = useState('restaurants');
    const [isLoading, setIsLoading] = useState(false);
    const [restaurants, setRestaurants] = useState();
    const [hotels, setHotels] = useState();
    const [attractions, setAttractions] = useState();

    // Get Current User Location
    useEffect(() => {
        // Default coordinates (New York) if geolocation fails
        const defaultCoordinates = { lat: 40.7128, lng: -74.0060 };
        
        // Check if geolocation is available
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by this browser. Using default coordinates.');
            setCoordinates(defaultCoordinates);
            return;
        }

        // Getting the current position coordinates from browser's navigator sensor
        navigator.geolocation.getCurrentPosition(
            ({ coords: {latitude, longitude} }) => {
                // Setting coordinates latitude and longitude to the state
                setCoordinates({ lat: latitude, lng: longitude });
            },
            (error) => {
                // Error handling for geolocation
                console.warn('Geolocation error:', error.message);
                console.log('Using default coordinates:', defaultCoordinates);
                setCoordinates(defaultCoordinates);
            },
            {
                timeout: 10000,
                enableHighAccuracy: false,
                maximumAge: 0
            }
        );
    }, [])

    // Get Places for Map View
    useEffect(() => {
        let source = axios.CancelToken.source();
        let isMounted = true;
        
        // If bounds state value of southwest - 'sw' and northeast 'ne' is available then the try-catch block is fired
        if (bounds.sw && bounds.ne) {
            // Setting loading state to true while data is being fetched 
            setIsLoading(true);

            // Calling on the getPlacesByBounds endpoint passing in the type (hotels || attractions || restaurant), bounds and 'source' for error handling and effect cleanup
            getPlacesByBounds(type, bounds.sw, bounds.ne, source)
                .then(data => {
                    if (isMounted) {
                        // Response 'data' is ready and set to the places state
                        setPlaces(Array.isArray(data) ? data.filter(place => place && place.name) : []);
                        // Loading state set back to false - to stop loading, after data is fetched
                        setIsLoading(false);
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setPlaces([]);
                        setIsLoading(false);
                    }
                });
        } else {
            // If no bounds, ensure loading is false
            setIsLoading(false);
        }

        // Effect Cleanup
        return () => {
            isMounted = false;
            source.cancel();
        }
    }, [type, bounds])

    // Get Places for Homepage
    useEffect(() => {
        let source = axios.CancelToken.source();
        let isMounted = true;

        // if coordinates state value latitude 'lat' and longitude 'lng' is found, the try-catch block is fired
        if (coordinates.lat && coordinates.lng) {
            // Calling on getPlacesByLatLng for 'restaurants' type, passing in parameter for 'limits' & 'min_rating'; and 'source' for error handling and effect cleanup
            getPlacesByLatLng('restaurants', coordinates.lat, coordinates.lng, { limit: 20, min_rating: 4 }, source)
                .then(data => {
                    if (isMounted) {
                        // Response 'data' received and set to restaurants state filtering out data without 'name' property, 'location_id' === 0
                        const filtered = Array.isArray(data) 
                            ? data.filter(restaurant => restaurant && restaurant.name && restaurant.location_id != 0) 
                            : [];
                        setRestaurants(filtered);
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setRestaurants([]);
                    }
                });

            // Calling on getPlacesByLatLng for 'attractions' type, passing in parameter for 'limits' & 'min_rating'; and 'source' for error handling and effect cleanup
            getPlacesByLatLng('attractions', coordinates.lat, coordinates.lng, { limit: 20, min_rating: 4 }, source)
                .then(data => {
                    if (isMounted) {
                        // Response 'data' received and set to attractions state filtering out data without 'name' property, 'location_id' === 0
                        const filtered = Array.isArray(data) 
                            ? data.filter(attraction => attraction && attraction.name && attraction.location_id != 0 && attraction.rating > 0) 
                            : [];
                        setAttractions(filtered);
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setAttractions([]);
                    }
                });
            
            // Calling on getPlacesByLatLng for 'hotels' type, passing in parameter for 'limits' & 'min_rating'; and 'source' for error handling and effect cleanup
            getPlacesByLatLng('hotels', coordinates.lat, coordinates.lng, { limit: 20, min_rating: 4 }, source)
                .then(data => {
                    if (isMounted) {
                        // Response 'data' received and set to hotels state filtering out data without 'name' property, 'location_id' === 0    
                        const filtered = Array.isArray(data) 
                            ? data.filter(hotel => hotel && hotel.name && hotel.location_id != 0 && hotel.rating > 0) 
                            : [];
                        setHotels(filtered);
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setHotels([]);
                    }
                });
        } else {
            // If no coordinates, set empty arrays
            setRestaurants([]);
            setAttractions([]);
            setHotels([]);
        }

        // Effect Cleanup
        return () => {
            isMounted = false;
            source.cancel();
        }
    }, [coordinates]);
    
    // Get Filtered Places by Rating
    useEffect(() => {
        // Places filter by rating for Map view
        // Set new filteredPlaces on change of 'rating' state 
        // filter in only data with 'rating' proper greater than or equal to the selcted rating value
        if (places && Array.isArray(places)) {
            setFilteredPlaces(places.filter(place => Number(place.rating) >= rating));
        } else {
            setFilteredPlaces([]);
        }
    }, [rating, places])

    return (
        // Passing State value through main context to children for access
        <MainContext.Provider value={{ places, setPlaces, coordinates, setCoordinates, bounds, setBounds, rating, setRating, type, setType, isLoading, setIsLoading, filteredPlaces, attractions, restaurants, hotels }}>
            { children }
        </MainContext.Provider>
    )
}

