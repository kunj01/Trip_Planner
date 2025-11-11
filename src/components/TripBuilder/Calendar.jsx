import React, { useState } from 'react';

const Calendar = ({ startDate, endDate, onDateSelect, maxDays = 7 }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [secondMonth, setSecondMonth] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  });

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateSelected = (date) => {
    if (!startDate && !endDate) return false;
    const dateStr = date.toDateString();
    return (
      (startDate && dateStr === startDate.toDateString()) ||
      (endDate && dateStr === endDate.toDateString())
    );
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (day, month, year) => {
    const date = new Date(year, month, day);
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  const navigateMonth = (direction, isSecond = false) => {
    const setter = isSecond ? setSecondMonth : setCurrentMonth;
    const current = isSecond ? secondMonth : currentMonth;
    
    setter(new Date(current.getFullYear(), current.getMonth() + direction, 1));
    
    // Keep months consecutive
    if (!isSecond) {
      const newSecond = new Date(current.getFullYear(), current.getMonth() + direction + 1, 1);
      setSecondMonth(newSecond);
    } else {
      const newFirst = new Date(current.getFullYear(), current.getMonth() + direction - 1, 1);
      setCurrentMonth(newFirst);
    }
  };

  const renderCalendar = (date, isSecond = false) => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(date);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const disabled = isDateDisabled(currentDate);
      const selected = isDateSelected(currentDate);
      const inRange = isDateInRange(currentDate);
      const isStart = startDate && currentDate.toDateString() === startDate.toDateString();
      const isEnd = endDate && currentDate.toDateString() === endDate.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => !disabled && handleDateClick(day, month, year)}
          disabled={disabled}
          className={`
            h-10 w-10 rounded-full text-sm font-medium transition-colors
            ${disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
            ${selected ? 'bg-[#00A680] text-white' : ''}
            ${inRange && !selected ? 'bg-gray-100 text-gray-700' : ''}
            ${!disabled && !selected && !inRange ? 'hover:bg-gray-50 text-gray-700' : ''}
            ${isStart || isEnd ? 'ring-2 ring-[#00A680] ring-offset-2' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="flex-1">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1, isSecond)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5 text-[#00A680]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-[#00A680]">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={() => navigateMonth(1, isSecond)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5 text-[#00A680]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-8">
        {renderCalendar(currentMonth, false)}
        {renderCalendar(secondMonth, true)}
      </div>
    </div>
  );
};

export default Calendar;

