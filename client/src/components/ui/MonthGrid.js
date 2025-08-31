import React from 'react';

const MonthGrid = ({ 
  selectedDate, 
  habits = [], 
  goals = [], 
  mindfulnessCheckins = [],
  onDateSelect,
  onMonthChange
}) => {
  // Get the first day of the month and number of days
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Get mindfulness score for a specific date
  const getMindfulnessScoreForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const checkin = mindfulnessCheckins.find(checkin => {
      if (!checkin.date) return false;
      const checkinDate = new Date(checkin.date).toISOString().split('T')[0];
      return checkinDate === dateStr;
    });

    if (!checkin) return 0;
    
    // Calculate total score from dimensions
    const dimensions = checkin.dimensions || {};
    const totalScore = Object.values(dimensions).reduce((sum, dim) => {
      return sum + (dim.rating || 0);
    }, 0);
    
    return totalScore;
  };

  // Get color based on mindfulness score - using GitHub-style green gradient
  const getMindfulnessColor = (score) => {
    if (score === 0) return '#ebedf0'; // Light gray for no activity
    if (score <= 5) return '#9be9a8'; // Light green
    if (score <= 10) return '#40c463'; // Medium green
    if (score <= 15) return '#30a14e'; // Dark green
    if (score <= 20) return '#216e39'; // Darker green
    return '#0d1117'; // Darkest green for highest scores
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const mindfulnessScore = getMindfulnessScoreForDate(date);
      days.push({ 
        day, 
        date, 
        isCurrentMonth: true, 
        isToday: date.toDateString() === new Date().toDateString(),
        mindfulnessScore 
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onMonthChange && onMonthChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Previous Month"
          >
            ←
          </button>
          <button
            onClick={() => onMonthChange && onMonthChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Next Month"
          >
            →
          </button>
        </div>
      </div>

      {/* GitHub-style Grid */}
      <div className="flex gap-8">
        {/* Weekday Labels */}
        <div className="flex flex-col gap-1 pt-6">
          {weekdays.map(day => (
            <div key={day} className="h-3 text-xs text-gray-500 font-medium w-8 text-center">
              {day === 'Sun' || day === 'Tue' || day === 'Thu' || day === 'Sat' ? '' : day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1">
          {/* Month Label */}
          <div className="text-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedDate.toLocaleDateString('en-US', { month: 'short' })}
            </span>
          </div>
          
          {/* Grid Container */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => {
              if (!dayData.isCurrentMonth) {
                return (
                  <div key={index} className="w-3 h-3">
                    {/* Empty space for days outside current month */}
                  </div>
                );
              }

              const { date, isToday, mindfulnessScore } = dayData;
              const backgroundColor = getMindfulnessColor(mindfulnessScore);

              return (
                <div
                  key={index}
                  onClick={() => onDateSelect && onDateSelect(date)}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:scale-125 hover:ring-2 hover:ring-blue-400 ${
                    isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor }}
                  title={`${date.toLocaleDateString()}: Mindfulness Score ${mindfulnessScore}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-end gap-4">
        <span className="text-xs text-gray-500">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-[#ebedf0] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#9be9a8] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#40c463] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#30a14e] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#216e39] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#0d1117] rounded-sm"></div>
        </div>
        <span className="text-xs text-gray-500">More</span>
      </div>
    </div>
  );
};

export default MonthGrid;
