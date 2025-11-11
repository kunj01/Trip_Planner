import React, { useState, useEffect } from 'react';
import { searchDestinations, generateItinerary, getPlaceDetails } from '../api/itineraryService';

const ItineraryGenerator = () => {
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    budget: 'moderate',
    travelGroup: 'solo',
    interests: [],
    activityLevel: 'moderate',
    additionalNotes: ''
  });

  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDestinationSearch = async (e) => {
    const query = e.target.value;
    setFormData(prev => ({ ...prev, destination: query }));

    if (query.length > 2) {
      try {
        const results = await searchDestinations(query);
        setSearchResults(Array.isArray(results) ? results : []);
        setShowResults(true);
      } catch (error) {
        setSearchResults([]);
        setShowResults(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const selectDestination = (destination) => {
    setFormData(prev => ({ ...prev, destination: destination.name }));
    setShowResults(false);
  };

  const handleInterestChange = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const resetForm = () => {
    setFormData({
      destination: '',
      days: 3,
      budget: 'moderate',
      travelGroup: 'solo',
      interests: [],
      activityLevel: 'moderate',
      additionalNotes: ''
    });
    setGeneratedItinerary(null);
    setRecommendations([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setIsLoading(true);

    try {
      const itinerary = await generateItinerary(formData);
      setGeneratedItinerary(itinerary);
    } catch (error) {
      // Show more helpful error message
      let errorMessage = 'Sorry, there was an error generating your itinerary.';
      
      if (error && error.message) {
        if (error.message.includes('API key')) {
          errorMessage = 'Google Maps API key is not configured. Please set VITE_GOOGLE_MAP_API_KEY in your .env file.';
        } else if (error.message.includes('REQUEST_DENIED')) {
          errorMessage = 'API request denied. Please check that your Google Maps API key has the Places API enabled and the correct permissions.';
        } else if (error.message.includes('ZERO_RESULTS') || error.message.includes('No attractions')) {
          errorMessage = error.message;
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  if (generatedItinerary) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => setGeneratedItinerary(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Form
        </button>
        {/* Itinerary Display */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Your {formData.destination} Itinerary</h2>
          
          {generatedItinerary.days && generatedItinerary.days.map((day, index) => (
            <div key={index} className="mb-6 border-b border-gray-200 pb-4 last:border-b-0">
              <h3 className="text-xl font-semibold mb-3">Day {index + 1}: {day.title || `Day ${index + 1}`}</h3>
              {day.description && <p className="text-gray-600 mb-3">{day.description}</p>}
              
              {day.activities && day.activities.map((activity, actIndex) => (
                <div key={actIndex} className="mb-3 pl-4 border-l-2 border-blue-300">
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-blue-600">{activity.time}</span>
                    <span className="mx-2">-</span>
                    <span className="font-medium">{activity.name}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{activity.description}</p>
                  <div className="text-xs text-gray-500">
                    <span className="mr-3">📍 {activity.location}</span>
                    <span>💰 {activity.cost}</span>
                  </div>
                </div>
              ))}
              
              {day.meals && (
                <div className="mt-3 pl-4">
                  <h4 className="font-medium text-gray-700 mb-2">Meals:</h4>
                  {day.meals.map((meal, mealIndex) => (
                    <div key={mealIndex} className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">{meal.type}:</span> {meal.restaurant} - {meal.cuisine}
                    </div>
                  ))}
                </div>
              )}
              
              {day.transportation && (
                <div className="mt-3 pl-4">
                  <h4 className="font-medium text-gray-700 mb-1">Transportation:</h4>
                  <p className="text-sm text-gray-600">{day.transportation}</p>
                </div>
              )}
            </div>
          ))}
          
          {generatedItinerary.tips && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Travel Tips</h4>
              <ul className="text-sm text-yellow-700">
                {generatedItinerary.tips.map((tip, index) => (
                  <li key={index} className="mb-1">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
          
          {generatedItinerary.totalCost && (
            <div className="mt-4 text-right">
              <span className="text-lg font-semibold">Estimated Total Cost: </span>
              <span className="text-2xl font-bold text-green-600">{generatedItinerary.totalCost}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tell us your travel preferences 🏖️ 🌴</h1>
      <p className="text-gray-600 mb-8">
        Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Destination Search */}
        <div className="relative">
          <label className="block text-xl font-semibold mb-2">What is destination of choice?</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleDestinationSearch}
            placeholder="Type to search destinations..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={result.place_id}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => selectDestination(result)}
                >
                  <div className="font-medium text-gray-900">{result.name}</div>
                  <div className="text-sm text-gray-500">{result.formatted_address}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Number of Days */}
        <div>
          <label className="block text-xl font-semibold mb-2">How many days?</label>
          <select
            name="days"
            value={formData.days}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(day => (
              <option key={day} value={day}>{day} {day === 1 ? 'day' : 'days'}</option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-xl font-semibold mb-2">What's your budget?</label>
          <div className="grid grid-cols-3 gap-4">
            {['budget', 'moderate', 'luxury'].map(budget => (
              <label key={budget} className="flex items-center">
                <input
                  type="radio"
                  name="budget"
                  value={budget}
                  checked={formData.budget === budget}
                  onChange={handleInputChange}
                  className="mr-2"
                  required
                />
                <span className="capitalize">{budget}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Travel Group */}
        <div>
          <label className="block text-xl font-semibold mb-2">Who are you traveling with?</label>
          <div className="grid grid-cols-2 gap-4">
            {['solo', 'couple', 'family', 'friends'].map(group => (
              <label key={group} className="flex items-center">
                <input
                  type="radio"
                  name="travelGroup"
                  value={group}
                  checked={formData.travelGroup === group}
                  onChange={handleInputChange}
                  className="mr-2"
                  required
                />
                <span className="capitalize">{group}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-xl font-semibold mb-2">What are your interests?</label>
          <div className="grid grid-cols-2 gap-4">
            {['adventure', 'culture', 'food', 'nature', 'shopping', 'nightlife', 'relaxation', 'photography'].map(interest => (
              <label key={interest} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                  className="mr-2"
                />
                <span className="capitalize">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-xl font-semibold mb-2">Activity Level</label>
          <div className="grid grid-cols-3 gap-4">
            {['relaxed', 'moderate', 'active'].map(level => (
              <label key={level} className="flex items-center">
                <input
                  type="radio"
                  name="activityLevel"
                  value={level}
                  checked={formData.activityLevel === level}
                  onChange={handleInputChange}
                  className="mr-2"
                  required
                />
                <span className="capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xl font-semibold mb-2">Additional Notes (Optional)</label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
            placeholder="Any special requirements or preferences..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isGenerating || !formData.destination}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Your Perfect Itinerary...
              </div>
            ) : (
              'Generate Your Perfect Itinerary'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItineraryGenerator;