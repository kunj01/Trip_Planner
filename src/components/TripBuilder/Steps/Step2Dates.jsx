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
        <h1 className="text-4xl md:text-5xl font-bold text-[#00A680] text-center mb-4">
          When are you going?
        </h1>
        
        {/* Sub-text */}
        <p className="text-gray-600 text-center mb-8 text-lg">
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
              {days > 0 && <span className="text-[#00A680] font-semibold"> ({days} {days === 1 ? 'day' : 'days'})</span>}
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
            className="text-[#00A680] font-semibold hover:underline"
          >
            Back
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={handleSkipDates}
              className="text-[#00A680] font-semibold hover:underline"
            >
              I don't know my dates yet
            </button>
            <button
              onClick={handleNext}
              disabled={!isValidRange}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                isValidRange
                  ? 'bg-[#00A680] hover:bg-[#008F6B] cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Dates;

