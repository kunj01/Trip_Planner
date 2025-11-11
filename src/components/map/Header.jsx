import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from '../../img/logo.svg';

const Header = ({setCoordinates}) => {
    const [search, setSearch] = useState(false);
    const [autocomplete, setAutocomplete] = useState(null);
    const inputRef = useRef(null);
    const autocompleteServiceRef = useRef(null);
    const setCoordinatesRef = useRef(setCoordinates);

    // Keep setCoordinates ref updated
    useEffect(() => {
        setCoordinatesRef.current = setCoordinates;
    }, [setCoordinates]);

    // Initialize Google Places Autocomplete
    useEffect(() => {
        if (!inputRef.current) return;

        const initAutocomplete = () => {
            // Check if Google Maps API is loaded
            if (!window.google || !window.google.maps || !window.google.maps.places) {
                return false;
            }

            if (inputRef.current && !autocompleteServiceRef.current) {
                try {
                    // Create Autocomplete instance
                    const autocompleteInstance = new window.google.maps.places.Autocomplete(
                        inputRef.current,
                        { types: ['(cities)'] }
                    );

                    // Add place changed listener
                    autocompleteInstance.addListener('place_changed', () => {
                        const place = autocompleteInstance.getPlace();
                        if (place && place.geometry && place.geometry.location && setCoordinatesRef.current) {
                            const lat = place.geometry.location.lat();
                            const lng = place.geometry.location.lng();
                            setCoordinatesRef.current({ lat, lng });
                        }
                    });

                    setAutocomplete(autocompleteInstance);
                    autocompleteServiceRef.current = autocompleteInstance;
                    return true;
                } catch (error) {
                    return false;
                }
            }
            return true;
        };

        // Function to check if API is loaded
        const checkApiLoaded = () => {
            return window.google && 
                   window.google.maps && 
                   window.google.maps.places && 
                   typeof window.google.maps.places.Autocomplete !== 'undefined';
        };

        // Try to initialize immediately if API is already loaded
        if (checkApiLoaded() && initAutocomplete()) {
            return;
        }

        // Wait for Google Maps API to load (max 10 seconds)
        let attempts = 0;
        const maxAttempts = 100;
        const checkInterval = setInterval(() => {
            attempts++;
            if (checkApiLoaded() && initAutocomplete()) {
                clearInterval(checkInterval);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
            }
        }, 100);

        // Also listen for the API to be loaded via event
        const handleApiLoad = () => {
            if (checkApiLoaded()) {
                initAutocomplete();
            }
        };

        // Listen for when the map loads the API
        window.addEventListener('google-maps-api-loaded', handleApiLoad);

        // Cleanup
        return () => {
            clearInterval(checkInterval);
            window.removeEventListener('google-maps-api-loaded', handleApiLoad);
            if (autocompleteServiceRef.current && window.google && window.google.maps) {
                try {
                    window.google.maps.event.clearInstanceListeners(autocompleteServiceRef.current);
                } catch (error) {
                    // Ignore cleanup errors
                }
                autocompleteServiceRef.current = null;
            }
        };
    }, []); // Empty dependencies - only run once on mount

    return ( 
        <div className="flex items-center w-full p-2 absolute top-0 z-10">
            <div className="flex bg-white justify-between items-center w-full p-3 md:p-4 rounded-sm shadow-md">
                {/* Logo displays only when  */}
                { !search && ( 
                    <Link to="/">
                        <img src={logo} alt="TravelAdvisor" className="h-6 sm:h-7 md:h-8 cursor-pointer" />
                    </Link>
                ) }
                {/* --- */}

                {/* Search Form - Toggle between Hidden and Visible on Mobile, determined by the 'search' state */}
                <div className={`relative w-full md:w-auto md:block ${!search && 'hidden'}`}>
                    {/* Autocomplete enabled Search Input Field */}
                    <div className="group relative">
                        <svg className="absolute left-3 top-1/2 -mt-2.5 text-slate-400 pointer-events-none group-focus-within:text-blue-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            ref={inputRef}
                            className="focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none w-full text-sm leading-6 text-slate-900 placeholder-slate-400 rounded-sm py-1 md:py-2 pl-10 ring-1 ring-slate-200" 
                            type="text" 
                            placeholder="Search Location..." 
                        />
                    </div>
                    {/* --- */}
                </div>
                {/* --- */}
                
                {/* Search Form Toggle for Mobile Only */}
                <div 
                    className="cursor-pointer md:hidden p-2 -mr-2"

                    // Click Event to toggle Search form state
                    onClick={() => search ? setSearch(false) : setSearch(true)}
                >
                    { !search ? (
                        // Search Button - Displays when search = false
                        <svg className="w-5 h-5 transition ease-out duration-1000" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    ) : (
                        // Close Search Button - Displays when search = true
                        <svg className="w-5 h-5 transition ease-out duration-1000" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </div>
                {/* --- */}
            </div>
        </div>
     );
}
 
export default Header;