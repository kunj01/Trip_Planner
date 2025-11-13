import React, { useState, useEffect } from 'react';
import { searchDestinations } from '../../../api/itineraryService';

const popularDestinations = [
  { name: 'Kochi (Cochin)', country: 'India', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop' },
  { name: 'Dubai', country: 'United Arab Emirates', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop' },
  { name: 'Punta Cana', country: 'Caribbean', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop' },
  { name: 'Sharm El Sheikh', country: 'Egypt', image: 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=400&h=300&fit=crop' },
  { name: 'Puerto Morelos', country: 'Mexico', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' },
  { name: 'New York City', country: 'United States', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop' },
];

const Step1Destination = ({ formData, updateFormData, nextStep }) => {
  const [searchQuery, setSearchQuery] = useState(formData.destination || '');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (formData.destination) {
      setSearchQuery(formData.destination);
    }
  }, [formData.destination]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      setIsSearching(true);
      try {
        const results = await searchDestinations(query);
        setSearchResults(Array.isArray(results) ? results : []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const selectDestination = (destination) => {
    updateFormData({
      destination: destination.name || destination,
      destinationDetails: destination,
    });
    setSearchQuery(destination.name || destination);
    setShowResults(false);
  };

  const handlePopularDestinationClick = (dest) => {
    updateFormData({
      destination: dest.name,
      destinationDetails: { name: dest.name, formatted_address: `${dest.name}, ${dest.country}` },
    });
    setSearchQuery(dest.name);
  };

  const handleNext = () => {
    if (formData.destination) {
      nextStep();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 text-center mb-4">
          Where do you want to go?
        </h1>
        
        {/* Sub-text */}
        <p className="text-gray-600 text-center mb-12 text-xl max-w-2xl mx-auto">
          Discover personalized recommendations and create your perfect travel itinerary
        </p>

        {/* Search Input */}
        <div className="relative mb-12">
          <div className="relative">
            <svg
              className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchQuery.length > 2 && setShowResults(true)}
              placeholder="Search for a destination..."
              className="w-full pl-16 pr-6 py-5 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 bg-white"
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-sm">
              {searchResults.map((result) => (
                <div
                  key={result.place_id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  onClick={() => selectDestination(result)}
                >
                  <div className="font-semibold text-gray-900">{result.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{result.formatted_address}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Destinations */}
        <div className="mb-12">
          <h2 className="text-center text-gray-700 text-xl font-semibold mb-8">
            Or explore popular destinations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {popularDestinations.map((dest, index) => (
              <div
                key={index}
                onClick={() => handlePopularDestinationClick(dest)}
                className={`group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
                  formData.destination === dest.name ? 'ring-2 ring-gray-900 ring-offset-2' : ''
                }`}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(dest.name);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-4 bg-white">
                  <p className="font-bold text-gray-900 text-sm">{dest.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{dest.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!formData.destination}
            className={`px-10 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              formData.destination
                ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <span className="relative z-10 flex items-center">
              Continue
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1Destination;

