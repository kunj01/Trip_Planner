import React from 'react';

const tripTypes = [
  { id: 'solo', label: 'Solo trip', icon: '👤' },
  { id: 'partner', label: 'Partner trip', icon: '❤️' },
  { id: 'friends', label: 'Friends trip', icon: '👥' },
  { id: 'family', label: 'Family trip', icon: '👨‍👩‍👧‍👦' },
];

const Step3TripType = ({ formData, updateFormData, nextStep, prevStep }) => {
  const handleTripTypeSelect = (type) => {
    updateFormData({ tripType: type });
  };

  const handleChildrenChange = (withChildren) => {
    updateFormData({ withChildren });
  };

  const handlePetsChange = (withPets) => {
    updateFormData({ withPets });
  };

  const handleNext = () => {
    if (formData.tripType) {
      nextStep();
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-4xl">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 text-center mb-4">
          What kind of trip are you planning?
        </h1>
        
        {/* Sub-text */}
        <p className="text-gray-600 text-center mb-12 text-xl max-w-2xl mx-auto">
          Select one.
        </p>

        {/* Trip Type Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          {tripTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTripTypeSelect(type.id)}
              className={`
                p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg
                ${
                  formData.tripType === type.id
                    ? 'border-gray-600 bg-gray-700 text-white shadow-lg scale-105'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-3">{type.icon}</div>
                <div className="font-semibold text-lg">{type.label}</div>
                {formData.tripType === type.id && (
                  <svg
                    className="w-6 h-6 mt-2"
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
          ))}
        </div>

        {/* Children Question */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Are you travelling with children?
            </h3>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleChildrenChange(true)}
              className={`
                px-8 py-3 rounded-xl border-2 font-semibold transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md
                ${
                  formData.withChildren
                    ? 'border-gray-600 bg-gray-700 text-white shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
            >
              Yes
            </button>
            <button
              onClick={() => handleChildrenChange(false)}
              className={`
                px-8 py-3 rounded-xl border-2 font-semibold transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md
                ${
                  !formData.withChildren
                    ? 'border-gray-600 bg-gray-700 text-white shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
            >
              No
            </button>
          </div>
        </div>

        {/* Pets Question */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Are you travelling with pets?
            </h3>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handlePetsChange(true)}
              className={`
                px-8 py-3 rounded-xl border-2 font-semibold transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md
                ${
                  formData.withPets
                    ? 'border-gray-600 bg-gray-700 text-white shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
            >
              Yes
            </button>
            <button
              onClick={() => handlePetsChange(false)}
              className={`
                px-8 py-3 rounded-xl border-2 font-semibold transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md
                ${
                  !formData.withPets
                    ? 'border-gray-600 bg-gray-700 text-white shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
            >
              No
            </button>
          </div>
        </div>

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
            onClick={handleNext}
            disabled={!formData.tripType}
            className={`px-10 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              formData.tripType
                ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
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

export default Step3TripType;

