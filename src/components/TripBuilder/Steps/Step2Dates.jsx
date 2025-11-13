import React, { useState } from 'react';
import Calendar from '../Calendar';

const Step2Dates = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [startDate, setStartDate] = useState(formData.startDate);
  const [endDate, setEndDate] = useState(formData.endDate);

  const handleDateSelect = (date) => {
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // Select end date
      if (date < startDate) {
        // If selected date is before start date, swap them
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const handleNext = () => {
    if (startDate && endDate) {
      const startDateStr = startDate instanceof Date 
        ? startDate.toISOString().split('T')[0]
        : startDate;
      const endDateStr = endDate instanceof Date
        ? endDate.toISOString().split('T')[0]
        : endDate;
      updateFormData({
        startDate: startDateStr,
        endDate: endDateStr,
      });
      nextStep();
    }
  };

  const handleSkipDates = () => {
    updateFormData({
      startDate: null,
      endDate: null,
    });
    nextStep();
  };

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = startDate instanceof Date ? startDate : new Date(startDate);
      const end = endDate instanceof Date ? endDate : new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const days = calculateDays();
  const isValidRange = startDate && endDate && days <= 7 && days > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 text-center mb-4">
          When are you going?
        </h1>
        
        {/* Sub-text */}
        <p className="text-gray-600 text-center mb-12 text-xl max-w-2xl mx-auto">
          Choose a date range, up to 7 days.
        </p>

        {/* Calendar */}
        <div className="mb-8">
          <Calendar
            startDate={startDate}
            endDate={endDate}
            onDateSelect={handleDateSelect}
            maxDays={7}
          />
        </div>

        {/* Date Range Display */}
        {startDate && endDate && (
          <div className="text-center mb-6">
            <p className="text-gray-700">
              Selected: {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} -{' '}
              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {days > 0 && <span className="text-gray-700 font-bold"> ({days} {days === 1 ? 'day' : 'days'})</span>}
            </p>
            {days > 7 && (
              <p className="text-red-500 text-sm mt-2">
                Please select a range of 7 days or less.
              </p>
            )}
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
          
          <div className="flex gap-4">
            <button
              onClick={handleSkipDates}
              className="px-6 py-3 text-gray-700 font-semibold hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              I don't know my dates yet
            </button>
            <button
              onClick={handleNext}
              disabled={!isValidRange}
              className={`px-10 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isValidRange
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
    </div>
  );
};

export default Step2Dates;

