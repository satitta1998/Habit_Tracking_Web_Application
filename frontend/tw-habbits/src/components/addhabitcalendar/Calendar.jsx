/* 
  Calendar Component
  This component is responsible for displaying a monthly calendar grid.
  It marks days that have events and allows users to toggle event status on days.
*/

import React, { useState, useEffect } from 'react';

// For local development
const API_BASE_URL = "http://localhost:3000";

// For production, switch to deployed URL
//const API_BASE_URL = "https://braude-habbits-v2-hksm.vercel.app";

const Calendar = ({ currentMonth, currentYear, id, isEditable, onDayClick, events, color, title }) => {
  const [markedDays, setMarkedDays] = useState({});

  console.log("ID in Calendar = ", id)
  console.log("Events in Calendar = ", events)
  
  useEffect(() => {
    // Function to update marked days based on events
    const updateMarkedDays = () => {
      const newMarkedDays = {};
      (events || []).forEach(event => {
        const eventDate = new Date(event);
        if (eventDate.getFullYear() === currentMonth.getFullYear() && eventDate.getMonth() === currentMonth.getMonth()) {
          newMarkedDays[eventDate.getDate()] = true;
        }
      });
      setMarkedDays(newMarkedDays);
    };
    
    updateMarkedDays();
  }, [events, currentMonth]); // Include all relevant dependencies

  // Function to handle toggling of event marking on a specific day
  const switchActive = (index, isMarked) => {
    const date = new Date(currentYear, currentMonth.getMonth(), index+1).toISOString().split('T')[0];
    
    // If the day is not marked, add the event to the database
    if (!isMarked) {
      fetch(`${API_BASE_URL}/add_event_to_habit?id=${id}&habitName=${title}&habitEvent=${date}`)
        .then(response => {
          if (!response.ok) throw new Error('Failed to update event');
          console.log("Added event to DB");
        })
        .catch(error => console.error('Error updating event:', error));
      // Add the event date to the events array
      events.push(date);
    } else {
      // If the day is already marked, remove the event from the database
      fetch(`${API_BASE_URL}/delete_event_from_habit?id=${id}&habitName=${title}&eventDate=${date}`)
        .then(response => {
          if (!response.ok) throw new Error('Failed to delete event');
          console.log("Deleted event from DB");
        })
        .catch(error => console.error('Error deleting event:', error));
      // Delete the event date from the events array
      events.pop(date);
    }
    // Update local state to reflect the change in marking
    setMarkedDays(prevMarkedDays => ({
      ...prevMarkedDays,
      [index]: !isMarked
    }));

    // Trigger the onDayClick callback with the updated events array
    onDayClick(events);
  };

  return (
    <div className="grid grid-cols-7 gap-2 p-8 dark:bg-slate-800 rounded">
      {/* Render the days of the week */}
      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
        <div key={day} className="text-center text-gray-600 dark:text-white text-xl">{day}</div>
      ))}
      {/* Render empty cells for the days before the first day of the month */}
      {[...Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()).keys()].map(i => (
        <div key={`empty-${i}`} className="h-8"></div>
      ))}
      {/* Render the days of the current month */}
      {[...Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()).keys()].map(day => {
        const dayOfMonth = day + 1;
        const isMarked = !!markedDays[dayOfMonth];
        
        return (
          <div
            key={dayOfMonth}
            onClick={() => isEditable && switchActive(dayOfMonth, isMarked)}
            className={`h-8 flex items-center justify-center rounded-full text-l cursor-pointer font-semibold
              ${isMarked ? 'text-white' : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-white'}`}
            style={isMarked ? { backgroundColor: color } : {}}
          >
            {dayOfMonth}
          </div>
        );
      })}
    </div>
  );
};

export default Calendar;