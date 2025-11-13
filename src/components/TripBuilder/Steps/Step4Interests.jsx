import React, { useState } from 'react';

const defaultInterests = [
  { id: 'attractions', label: 'Must-see Attractions', icon: '🏛️' },
  { id: 'tours', label: 'Tours & Experiences', icon: '🚶' },
  { id: 'food', label: 'Great Food', icon: '🍽️' },
  { id: 'hidden-gems', label: 'Hidden Gems', icon: '💎' },
  { id: 'architecture', label: 'Architectural Wonders', icon: '🏗️' },
  { id: 'water', label: 'Water Adventure', icon: '🌊' },
  { id: 'shopping', label: 'Luxury Shopping', icon: '🛍️' },
  { id: 'culture', label: 'Cultural Landmarks', icon: '🎭' },
  { id: 'nature', label: 'Nature & Parks', icon: '🌳' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌃' },
  { id: 'photography', label: 'Photography', icon: '📸' },
  { id: 'relaxation', label: 'Relaxation', icon: '🧘' },
];

const Step4Interests = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [customInterests, setCustomInterests] = useState([]);
  const [showAddInterest, setShowAddInterest] = useState(false);
  const [newInterest, setNewInterest] = useState('');

  const allInterests = [...defaultInterests, ...customInterests];

  const handleInterestToggle = (interestId) => {
    const currentInterests = formData.interests || [];
    if (currentInterests.includes(interestId)) {
      updateFormData({
        interests: currentInterests.filter(id => id !== interestId),
      });
    } else {
      updateFormData({
        interests: [...currentInterests, interestId],
      });
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !allInterests.find(i => i.label.toLowerCase() === newInterest.toLowerCase())) {
      const newId = `custom-${Date.now()}`;
      const newInterestObj = {
        id: newId,
        label: newInterest.trim(),
        icon: '⭐',
      };
      setCustomInterests([...customInterests, newInterestObj]);
      updateFormData({
        interests: [...(formData.interests || []), newId],
      });
      setNewInterest('');
      setShowAddInterest(false);
    }
  };

  const handleSubmit = () => {
    nextStep();
  };

  const selectedCount = (formData.interests || []).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 text-center mb-4">
          Tell us what you're interested in
        </h1>
        
        {/* Sub-text */}
        <p className="text-gray-600 text-center mb-12 text-xl max-w-2xl mx-auto">
          Select all that apply.
        </p>

        {/* Interests Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {allInterests.map((interest) => {
            const isSelected = (formData.interests || []).includes(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => handleInterestToggle(interest.id)}
                className={`
                  p-5 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-105 shadow-sm hover:shadow-md
                  ${
                    isSelected
                      ? 'border-gray-600 bg-gray-700 text-white shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{interest.icon}</span>
                    <span className="font-semibold text-sm">{interest.label}</span>
                  </div>
                  {isSelected && (
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}

          {/* Add Interest Button */}
          {!showAddInterest && (
            <button
              onClick={() => setShowAddInterest(true)}
              className="p-5 rounded-xl border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="font-semibold">Add interest</span>
              </div>
            </button>
          )}

          {/* Add Interest Input */}
          {showAddInterest && (
            <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-white">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Enter interest..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 mb-3"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddInterest();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddInterest}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl text-sm font-semibold hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddInterest(false);
                    setNewInterest('');
                  }}
                  className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Count */}
        {selectedCount > 0 && (
          <div className="text-center mb-8">
            <p className="text-gray-600">
              {selectedCount} {selectedCount === 1 ? 'interest' : 'interests'} selected
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            className="group inline-flex items-center px-6 py-3 text-gray-700 font-semibold hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:-translate-x-1"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <button
            onClick={handleSubmit}
            className="px-10 py-4 rounded-xl font-semibold text-white text-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="flex items-center">
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

export default Step4Interests;

