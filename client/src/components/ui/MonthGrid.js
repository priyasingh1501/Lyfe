import React from 'react';

const MonthGrid = ({ 
  selectedDate, 
  habits = [], 
  goals = [], 
  mindfulnessCheckins = [],
  onDateSelect,
  onMonthChange
}) => {
  try {
    // Input validation to prevent React error #137
    if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
      console.error('MonthGrid: Invalid selectedDate prop', selectedDate);
      return (
        <div className="w-full p-4 text-center text-red-500">
          Error: Invalid date provided to MonthGrid component
        </div>
      );
    }

    if (!Array.isArray(mindfulnessCheckins)) {
      console.error('MonthGrid: mindfulnessCheckins must be an array', mindfulnessCheckins);
      return (
        <div className="w-full p-4 text-center text-red-500">
          Error: mindfulnessCheckins must be an array
        </div>
      );
    }

    if (!Array.isArray(habits)) {
      console.error('MonthGrid: habits must be an array', habits);
      return (
        <div className="w-full p-4 text-center text-red-500">
          Error: habits must be an array
        </div>
      );
    }

    if (!Array.isArray(goals)) {
      console.error('MonthGrid: goals must be an array', goals);
      return (
        <div className="w-full p-4 text-center text-red-500">
          Error: goals must be an array
        </div>
      );
    }

    console.log('🔍 MonthGrid rendered with props:');
    console.log('🔍 mindfulnessCheckins:', mindfulnessCheckins);
    console.log('🔍 mindfulnessCheckins.length:', mindfulnessCheckins.length);
    console.log('🔍 mindfulnessCheckins type:', typeof mindfulnessCheckins);
    console.log('🔍 Is array:', Array.isArray(mindfulnessCheckins));
    
    if (mindfulnessCheckins.length > 0) {
      console.log('🔍 First checkin:', mindfulnessCheckins[0]);
      console.log('🔍 First checkin date:', mindfulnessCheckins[0].date);
      console.log('🔍 First checkin totalScore:', mindfulnessCheckins[0].totalScore);
    }

    // Get the current date and calculate the start date (12 months ago)
    const currentDate = new Date();
    
    // Validate current date
    if (isNaN(currentDate.getTime())) {
      console.error('❌ Invalid currentDate detected');
      return (
        <div className="w-full p-4 text-center text-red-500">
          Error: Invalid current date
        </div>
      );
    }
    
    // Debug: Let's see exactly what we're working with
    console.log('🔍 Raw date info:');
    console.log('🔍 currentDate.getFullYear():', currentDate.getFullYear());
    console.log('🔍 currentDate.getMonth():', currentDate.getMonth());
    console.log('🔍 currentDate.getDate():', currentDate.getDate());
    console.log('🔍 Month name:', currentDate.toLocaleDateString('en-US', { month: 'long' }));
    
    // Fix: Calculate start date to include exactly 12 months of data
    // We want to show the last 12 months, so go back 12 months from current month
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1);
    
    // Validate startDate
    if (isNaN(startDate.getTime())) {
      console.error('❌ Invalid startDate calculated:', startDate);
      return (
        <div className="w-full p-4 text-center text-red-500">
          Error: Invalid start date calculation
        </div>
      );
    }
    
    // Ensure we include the current date by setting end date to end of current day
    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999);
    
    // Validate endDate
    if (isNaN(endDate.getTime())) {
      console.error('❌ Invalid endDate calculated:', endDate);
      return (
        <div className="w-full p-4 text-center text-red-500">
          Error: Invalid end date calculation
        </div>
      );
    }
    
    console.log('🔍 Date calculations:');
    console.log('🔍 currentDate:', currentDate);
    console.log('🔍 currentDate.toISOString():', currentDate.toISOString());
    console.log('🔍 startDate:', startDate);
    console.log('🔍 startDate.toISOString():', startDate.toISOString());
    console.log('🔍 endDate:', endDate);
    console.log('🔍 endDate.toISOString():', endDate.toISOString());
    console.log('🔍 startDate <= endDate:', startDate <= endDate);
    
    // Debug: Let's verify the month calculation
    console.log('🔍 Month calculation debug:');
    console.log('🔍 currentDate.getMonth() - 12 =', currentDate.getMonth() - 12);
    console.log('🔍 Expected start month:', new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    
    // Get mindfulness score for a specific date
    const getMindfulnessScoreForDate = (date) => {
      // Validate date input
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.error('getMindfulnessScoreForDate: Invalid date input', date);
        return 0;
      }

      // Use local date string to avoid timezone issues
      const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      console.log(`🔍 Looking for mindfulness data for date: ${dateStr}`);
      console.log(`🔍 Available checkins:`, mindfulnessCheckins);
      
      const checkin = mindfulnessCheckins.find(checkin => {
        if (!checkin || !checkin.date) {
          console.log(`❌ Checkin missing date:`, checkin);
          return false;
        }
        
        // Convert checkin date to local date string to avoid timezone issues
        const checkinDate = new Date(checkin.date).toLocaleDateString('en-CA');
        console.log(`🔍 Comparing ${dateStr} with ${checkinDate}`);
        console.log(`🔍 Original checkin date:`, checkin.date);
        console.log(`🔍 Checkin date object:`, new Date(checkin.date));
        
        return dateStr === checkinDate;
      });

      if (!checkin) {
        console.log(`❌ No checkin found for ${dateStr}`);
        return 0;
      }
      
      console.log(`✅ Found checkin for ${dateStr}:`, checkin);
      
      // Calculate total score from dimensions
      const dimensions = checkin.dimensions || {};
      console.log(`🔍 Dimensions:`, dimensions);
      
      const totalScore = Object.values(dimensions).reduce((sum, dim) => {
        const rating = dim.rating || 0;
        console.log(`🔍 Dimension rating: ${rating}`);
        return sum + rating;
      }, 0);
      
      console.log(`🎯 Total score for ${dateStr}: ${totalScore}`);
      return totalScore;
    };

    // Get habit completion status for a specific date
    const getHabitCompletionForDate = (date) => {
      // Validate date input
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.error('getHabitCompletionForDate: Invalid date input', date);
        return { completedCount: 0, totalCount: 0 };
      }

      const dateStr = date.toLocaleDateString('en-CA');
      let completedCount = 0;
      let totalCount = 0;
      
      habits.forEach(habit => {
        // Validate habit object
        if (!habit || !habit.startDate || !habit.endDate) {
          console.log('❌ Invalid habit object:', habit);
          return;
        }

        // Check if habit is active on this date (within start/end date range)
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        const startDate = new Date(habit.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(habit.endDate);
        endDate.setHours(23, 59, 59, 999);
        
        if (habit.isActive && checkDate >= startDate && checkDate <= endDate) {
          totalCount++;
          // Check if habit has a completed check-in for this date
          const checkin = habit.checkins?.find(c => {
            const checkinDate = new Date(c.date).toLocaleDateString('en-CA');
            return checkinDate === dateStr && c.completed;
          });
          if (checkin) {
            completedCount++;
          }
        }
      });
      
      return { completedCount, totalCount };
    };

    // Get color based on mindfulness score and habit completion
    const getDayColor = (date) => {
      // Validate date input
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.error('getDayColor: Invalid date input', date);
        return '#0f1419'; // Default dark color for invalid dates
      }

      const mindfulnessScore = getMindfulnessScoreForDate(date);
      const habitCompletion = getHabitCompletionForDate(date);
      
      // If we have habits and some are completed, show habit completion color
      if (habitCompletion.totalCount > 0) {
        const completionRate = habitCompletion.completedCount / habitCompletion.totalCount;
        
        if (completionRate === 0) return '#0f1419'; // No habits completed - very dark
        if (completionRate <= 0.25) return '#1E49C9'; // Primary blue - low completion
        if (completionRate <= 0.5) return '#1E49C9'; // Primary blue - medium-low completion
        if (completionRate <= 0.75) return '#1E49C9'; // Primary blue - medium-high completion
        if (completionRate <= 0.9) return '#1E49C9'; // Primary blue - high completion
        return '#1E49C9'; // Primary blue - excellent completion
      }
      
      // Fall back to mindfulness score color if no habits
      if (mindfulnessScore === 0) return '#0f1419'; // Much darker color for no activity - very visible
      if (mindfulnessScore <= 2) return '#1E49C9'; // Primary blue
      if (mindfulnessScore <= 4) return '#1E49C9'; // Primary blue
      if (mindfulnessScore <= 6) return '#1E49C9'; // Primary blue
      if (mindfulnessScore <= 8) return '#1E49C9'; // Primary blue
      if (mindfulnessScore <= 10) return '#1E49C9'; // Primary blue
      if (mindfulnessScore <= 12) return '#1E49C9'; // Primary blue
      if (mindfulnessScore <= 14) return '#1E49C9'; // Primary blue
      if (mindfulnessScore <= 16) return '#1E49C9'; // Primary blue
      if (mindfulnessScore <= 18) return '#1E49C9'; // Primary blue
      if (mindfulnessScore <= 20) return '#1E49C9'; // Primary blue
      if (mindfulnessScore <= 22) return '#1E49C9'; // Primary blue
      if (mindfulnessScore <= 24) return '#1E49C9'; // Primary blue
      return '#1E49C9'; // Primary blue for highest scores
    };

    // Generate all days for the past 12 months
    const generateAllDays = () => {
      console.log('🔍 generateAllDays function called!');
      const allDays = [];
      
      // Ensure startDate and endDate are valid Date objects
      if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
        console.error('❌ Invalid startDate in generateAllDays:', startDate);
        return [];
      }
      
      if (!endDate || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
        console.error('❌ Invalid endDate in generateAllDays:', endDate);
        return [];
      }
      
      const currentDateCopy = new Date(startDate.getTime()); // Create a proper copy
      
      console.log(`🔍 Generating days from ${startDate.toISOString()} to ${endDate.toISOString()}`);
      console.log(`🔍 mindfulnessCheckins count: ${mindfulnessCheckins.length}`);
      
      let dayCount = 0;
      while (currentDateCopy <= endDate) {
        dayCount++;
        
        // Validate the current date
        if (isNaN(currentDateCopy.getTime())) {
          console.error('❌ Invalid currentDateCopy detected:', currentDateCopy);
          break;
        }
        
        const dayDateStr = currentDateCopy.toLocaleDateString('en-CA');
        console.log(`🔍 Day ${dayCount}: Processing ${dayDateStr}`);
        
        const mindfulnessScore = getMindfulnessScoreForDate(currentDateCopy);
        
        // Create a new Date object for the day data
        const dayDate = new Date(currentDateCopy.getTime());
        
        allDays.push({
          date: dayDate,
          mindfulnessScore,
          isToday: dayDate.toDateString() === new Date().toDateString()
        });
        
        // Check if we've reached today's date
        if (dayDate.toDateString() === new Date().toDateString()) {
          console.log(`🎯 Found today's date: ${dayDateStr}`);
          console.log(`🎯 Today's date object:`, dayDate);
          console.log(`🎯 Today's date string:`, dayDate.toDateString());
          console.log(`🎯 Current date string:`, new Date().toDateString());
        }
        
        // Move to next day
        currentDateCopy.setDate(currentDateCopy.getDate() + 1);
        
        // Safety check to prevent infinite loops
        if (dayCount > 400) {
          console.error('❌ Loop limit exceeded, breaking');
          break;
        }
      }
      
      console.log(`🔍 Generated ${allDays.length} days`);
      console.log(`🔍 Sample days with scores:`, allDays.slice(0, 5).map(day => ({
        date: day.date.toISOString().split('T')[0],
        score: day.mindfulnessScore
      })));
      
      return allDays;
    };

    // Group days by month
    const groupDaysByMonth = (allDays) => {
      const months = [];
      let currentMonth = null;
      let currentMonthDays = [];
      
      allDays.forEach(day => {
        const monthKey = `${day.date.getFullYear()}-${day.date.getMonth()}`;
        
        if (monthKey !== currentMonth) {
          if (currentMonthDays.length > 0) {
            months.push({
              month: new Date(currentMonthDays[0].date.getFullYear(), currentMonthDays[0].date.getMonth(), 1),
              days: currentMonthDays
            });
          }
          currentMonth = monthKey;
          currentMonthDays = [day];
        } else {
          currentMonthDays.push(day);
        }
      });
      
      if (currentMonthDays.length > 0) {
        months.push({
          month: new Date(currentMonthDays[0].date.getFullYear(), currentMonthDays[0].date.getMonth(), 1),
          days: currentMonthDays
        });
      }
      
      return months;
    };

    const allDays = generateAllDays();
    const months = groupDaysByMonth(allDays);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Debug logging
    console.log('MonthGrid Debug:', {
      startDate: startDate.toDateString(),
      currentDate: currentDate.toDateString(),
      allDaysCount: allDays.length,
      monthsCount: months.length,
      selectedDate: selectedDate.toDateString()
    });

    return (
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#E8EEF2]">
            Mindfulness Activity
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => onMonthChange && onMonthChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
              className="p-2 hover:bg-[#2A313A] rounded-md transition-colors text-[#94A3B8] hover:text-[#E8EEF2]"
              title="Previous Month"
            >
              ←
            </button>
            <button
              onClick={() => onMonthChange && onMonthChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
              className="p-2 hover:bg-[#2A313A] rounded-md transition-colors text-[#94A3B8] hover:text-[#E8EEF2]"
              title="Next Month"
            >
              →
            </button>
          </div>
        </div>

        {/* GitHub-style Contribution Grid */}
        <div className="flex gap-1">
          {/* Weekday Labels */}
          <div className="flex flex-col gap-0.5 pt-4">
            {weekdays.map(day => (
              <div key={day} className="h-2.5 text-xs text-[#94A3B8] font-medium w-6 text-center">
                {day === 'Sun' || day === 'Tue' || day === 'Thu' || day === 'Sat' ? '' : day}
              </div>
            ))}
          </div>

          {/* Months Grid */}
          <div className="flex gap-1">
            {months.map((monthData, monthIndex) => (
              <div key={monthIndex} className="flex flex-col">
                {/* Month Label */}
                <div className="text-center mb-1">
                  <span className="text-xs text-[#94A3B8] font-medium">
                    {monthData.month.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                
                {/* Days Grid for this month */}
                <div className="grid grid-cols-7 gap-0.5">
                  {monthData.days.map((dayData, dayIndex) => {
                    const { date, mindfulnessScore, isToday } = dayData;
                    const backgroundColor = getDayColor(date);

                    return (
                      <div
                        key={dayIndex}
                        onClick={() => onDateSelect && onDateSelect(date)}
                        className={`w-2.5 h-2.5 rounded-sm cursor-pointer transition-all duration-200 hover:scale-125 hover:ring-2 hover:ring-blue-400 ${
                          isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        } ${mindfulnessScore === 0 ? 'border border-[#2A313A]' : ''}`}
                        style={{ backgroundColor }}
                        title={`${date.toLocaleDateString()}: Mindfulness Score ${mindfulnessScore}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <span className="text-xs text-[#94A3B8]">Low</span>
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 bg-[#0f1419] rounded-sm border border-[#2A313A]" title="No Entry"></div>
            <div className="w-2.5 h-2.5 bg-[#1e3a8a] rounded-sm border border-[#2A313A]"></div>
            <div className="w-2.5 h-2.5 bg-[#2563eb] rounded-sm border border-[#2A313A]"></div>
            <div className="w-2.5 h-2.5 bg-[#60a5fa] rounded-sm border border-[#2A313A]"></div>
            <div className="w-2.5 h-2.5 bg-[#c7d2fe] rounded-sm border border-[#2A313A]"></div>
            <div className="w-2.5 h-2.5 bg-[#fef3c7] rounded-sm border border-[#2A313A]"></div>
            <div className="w-2.5 h-2.5 bg-[#fde68a] rounded-sm border border-[#2A313A]"></div>
            <div className="w-2.5 h-2.5 bg-[#fbbf24] rounded-sm border border-[#2A313A]"></div>
            <div className="w-2.5 h-2.5 bg-[#eab308] rounded-sm border border-[#2A313A]"></div>
          </div>
          <span className="text-xs text-[#94A3B8]">High</span>
        </div>
      </div>
    );
  } catch (error) {
    console.error('MonthGrid component error:', error);
    return (
      <div className="w-full p-4 text-center text-red-500">
        Error: MonthGrid component failed to render. Please check the console for details.
      </div>
    );
  }
};

export default MonthGrid;
