import React, { useEffect, useState } from 'react';
import { generateItineraryWithDetails } from '../../../api/itineraryService';

const Step5Loading = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generateRecommendations = async () => {
      setIsGenerating(true);
      setError(null);
      
      try {
        // Calculate days from dates with error handling
        let calculatedDays = 3; // default
        if (formData.startDate && formData.endDate) {
          try {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              console.warn('Invalid dates, using default 3 days');
              calculatedDays = 3;
            } else {
              const diffTime = Math.abs(end - start);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              calculatedDays = Math.max(1, Math.min(diffDays, 14)); // Ensure between 1 and 14 days
              console.log(`Calculated ${calculatedDays} days from dates: ${formData.startDate} to ${formData.endDate}`);
            }
          } catch (dateError) {
            console.warn('Error calculating days from dates:', dateError);
            calculatedDays = 3;
          }
        }
        
        // Convert form data to itinerary service format
        const itineraryData = {
          destination: formData.destination,
          days: calculatedDays,
          interests: formData.interests || [],
          budget: 'moderate', // Default budget
          travelGroup: formData.tripType || 'solo',
          activityLevel: 'moderate',
        };

        console.log('Generating itinerary with data:', itineraryData);
        console.log('Full form data:', formData);

        if (!itineraryData.destination || itineraryData.destination.trim() === '') {
          throw new Error('Destination is required. Please go back and select a destination.');
        }

        const result = await generateItineraryWithDetails(itineraryData);
        
        console.log('Itinerary generated:', result);
        
        // Validate result
        if (!result) {
          throw new Error('No data received from itinerary service');
        }

        // Set all recommendations as selected by default
        const allRecommendations = result.recommendations || [];
        const itineraryDays = result.days || [];
        
        // Validate we have at least itinerary days (recommendations can be empty, we'll show placeholder)
        if (!itineraryDays || itineraryDays.length === 0) {
          throw new Error('No itinerary days generated. Please try a different destination or check your internet connection.');
        }

        // Even if recommendations are empty, we can proceed with the itinerary
        console.log(`Generated ${itineraryDays.length} days and ${allRecommendations.length} recommendations`);

        updateFormData({
          recommendations: allRecommendations,
          selectedRecommendations: allRecommendations.map(r => r.place_id || r.id),
          itinerary: result,
        });

        setIsGenerating(false);

        // Automatically move to next step after generation (give UI time to update)
        setTimeout(() => {
          nextStep();
        }, 1000);
      } catch (error) {
        console.error('Error generating itinerary:', error);
        setIsGenerating(false);
        setError(error.message || 'Error generating recommendations. Please try again.');
      }
    };

    if (formData.destination) {
      generateRecommendations();
    } else {
      setError('Destination is required');
      setIsGenerating(false);
    }
  }, []); // Run once on mount

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="flex flex-col items-center">
              <svg
                className="w-16 h-16 text-red-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h1 className="text-2xl font-bold text-red-700 mb-4">
                Error Generating Itinerary
              </h1>
              <p className="text-gray-700 mb-6">{error}</p>
              <div className="flex gap-4">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-[#00A680] text-white rounded-lg font-semibold hover:bg-[#008F6B] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl text-center">
        {/* Loading Overlay */}
        <div className="bg-[#00A680] rounded-lg p-12 text-white">
          <div className="flex flex-col items-center">
            {/* AI Icon/Sparkle */}
            <div className="mb-6">
              <svg
                className="w-16 h-16 animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Building a trip just for you
            </h1>
            
            {/* Sub-text */}
            <p className="text-lg text-white/90 mb-6">
              Remember, you can remove anything you don't like.
            </p>

            {/* Loading Spinner */}
            {isGenerating && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Placeholders */}
        {isGenerating && (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Step5Loading;

