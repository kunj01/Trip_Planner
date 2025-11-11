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
        <h1 className="text-4xl md:text-5xl font-bold text-[#00A680] text-center mb-4">
          Tell us what you're interested in
        </h1>
        
        {/* Sub-text */}
        <p className="text-gray-600 text-center mb-8 text-lg">
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
                  p-4 rounded-lg border-2 transition-all text-left
                  ${
                    isSelected
                      ? 'border-[#00A680] bg-[#00A680] text-white'
                      : 'border-[#00A680] bg-white text-[#00A680] hover:bg-gray-50'
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
              className="p-4 rounded-lg border-2 border-[#00A680] bg-white text-[#00A680] hover:bg-gray-50 transition-all"
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
            <div className="p-4 rounded-lg border-2 border-[#00A680] bg-white">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Enter interest..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A680] mb-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddInterest();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddInterest}
                  className="flex-1 px-3 py-1 bg-[#00A680] text-white rounded-lg text-sm font-semibold hover:bg-[#008F6B]"
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
            className="text-[#00A680] font-semibold hover:underline"
          >
            Back
          </button>
          
          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-lg font-semibold text-white bg-[#00A680] hover:bg-[#008F6B] cursor-pointer transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4Interests;

