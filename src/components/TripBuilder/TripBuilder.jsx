import React, { useState } from 'react';
import Step1Destination from './Steps/Step1Destination';
import Step2Dates from './Steps/Step2Dates';
import Step3TripType from './Steps/Step3TripType';
import Step4Interests from './Steps/Step4Interests';
import Step5Loading from './Steps/Step5Loading';
import Step6Review from './Steps/Step6Review';
import Step7Itinerary from './Steps/Step7Itinerary';

const TripBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: '',
    destinationDetails: null,
    startDate: null,
    endDate: null,
    tripType: '',
    withChildren: false,
    withPets: false,
    interests: [],
    selectedRecommendations: [],
    itinerary: null,
  });

  const totalSteps = 7;

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Destination
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <Step2Dates
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <Step3TripType
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <Step4Interests
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        return (
          <Step5Loading
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 6:
        return (
          <Step6Review
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 7:
        return (
          <Step7Itinerary
            formData={formData}
            updateFormData={updateFormData}
            prevStep={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      {currentStep < 7 && (
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-[#00A680] h-1 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-7xl mx-auto">
        {renderStep()}
      </div>
    </div>
  );
};

export default TripBuilder;

