/* 
  HabitTracker Component
  This component handles fetching user and friend data, selecting habits, 
  navigating months, and toggling event status on calendar days.
*/

import React, { useState, useEffect } from 'react';
import MonthNavigator from './MonthNavigator.jsx';
import Calendar from './Calendar.jsx';
import FriendSelector from './FriendSelector.jsx';

// For local development
const API_BASE_URL = "http://localhost:3000";

// For production, switch to deployed URL
//const API_BASE_URL = "https://braude-habbits-v2-hksm.vercel.app";

const HabitTracker = () => {
  // State to manage user's habits
  const [habitList, setHabitList] = useState([]);

  // State to manage selected friend's habits
  const [selectedFriendHabitList, setSelectedFriendHabitList] = useState([]);

  // State to manage the list of friends
  const [friendsList, setFriendsList] = useState([]);

  // State to manage the current month being displayed in the calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // State to manage the selected friend
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Get the user ID from local storage
  const [userID] = useState(localStorage.getItem("userID"));
  
  // State to manage the friend ID (though it seems unused in this context)
  const [friendID, setFriendID] = useState({});

  // State to manage the selected habit
  const [selectedHabit, setSelectedHabit] = useState({ title: 'Choose a habit' });

  // State to manage the dropdown's open/closed status
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch user's habits from the backend
  const fetchHabits = (id) => {
    fetch(`${API_BASE_URL}/get_user_habits?id=${id}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch user habits');
        }
      })
      .then(data => {
        if (data.habits && Object.keys(data.habits).length > 0) {
          const newHabitList = Object.keys(data.habits).map((habitName, index) => ({
            key: index + 1,
            title: data.habits[habitName].name,
            color: data.habits[habitName].color,
            events: data.habits[habitName].events
          }));
          // Update the habit list based on whether it's for the current user or a friend
          if(id === localStorage.getItem("userID")) {
            setHabitList(newHabitList);
          } else {
            setSelectedFriendHabitList(newHabitList);
          }
        } else {
          // If no habits are found, clear the habit list
          if(id === localStorage.getItem("userID")) {
            setHabitList([]);
          } else {
            setSelectedFriendHabitList([]);
          }
          
        }
      })
      .catch(error => {
        console.log('Error:', error);
      });
  };

  // Fetch user's friends from the backend
  const fetchFriends = () => {
    fetch(`${API_BASE_URL}/get_user_personal_data?id=${localStorage.getItem("userID")}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to fetch user friends');
      }
    })
    .then(data => {
      if (data && data.friends && Array.isArray(data.friends)) {
        const newFriendsList = [];
        // Fetch each friend's data by ID
        data.friends.forEach((friendID, index) => {
          fetch(`${API_BASE_URL}/get_user_personal_data?id=${friendID}`)
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Failed to fetch user friends');
            }
          })
          .then(data2 => {
            if (data2) {
              const friend = {
                id: friendID,
                name: data2.name + " " + data2.surname
              }
              newFriendsList.push(friend);
              
            }
          })
          .catch(error => {
            console.log('Error:', error);
          });

        });
  
        // Update the friends list state
        setFriendsList(newFriendsList);
      } else {
        setFriendsList([]);
      }
    })
    .catch(error => {
      console.log('Error:', error);
    });

  }

  useEffect(() => {
  }, [selectedFriendHabitList]);

  useEffect(() => {
    fetchHabits(localStorage.getItem("userID"));
    fetchFriends();
  }, []);

  useEffect(() => {
    if (selectedFriend?.id) {
      fetchHabits(selectedFriend.id);
    }
  }, [selectedFriend]);


  // Move to the previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Move to the next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Update the events in the selected habit list
  const toggleDayStatus = (updatedList) => {
    habitList.events = updatedList;
    setHabitList(habitList);
  };

  // Handle habit selection from the dropdown
  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-900">
      <div className="mx-auto p-4">
        <div className="flex items-center justify-center mb-4">
          <h2 className="text-2xl font-semibold dark:text-white">{selectedHabit.title}</h2>
          <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-black ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                <ul>
                  {habitList.map((habit) => (
                    <li key={habit.key} className="px-4 py-2 hover:bg-gray-100 cursor-pointer dark:bg-slate-700 dark:text-white"                      onClick={() => handleHabitSelect(habit)}>
                      {habit.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Month navigation */}
        <MonthNavigator currentMonth={currentMonth} prevMonth={prevMonth} nextMonth={nextMonth} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          <div>
            <h4 className="text-xl font-semibold mb-4 dark:text-white">Your Calendar</h4>
            <div className="max-w-md mx-auto">
              {/*User's calendar*/}
              <Calendar
                currentMonth={currentMonth}
                currentYear={currentMonth.getFullYear()}
                id={userID}
                isEditable={true}
                onDayClick={toggleDayStatus}
                events = {selectedHabit.events}
                color = {selectedHabit.color}
                title = {selectedHabit.title}
              />
            </div>
          </div>

          {/* Friend's calendar section */}
          <div>
            <FriendSelector
              friends={friendsList}
              selectedFriend={selectedFriend}
              onSelectFriend={setSelectedFriend}
            />
      {/* Display friend's calendar if a friend is selected */}
      {selectedFriend && selectedFriendHabitList.length >= 0 && (
        <div className="mt-8">
          <h4 className="text-xl font-semibold mb-4 dark:text-white">{selectedFriend.name}'s Calendar</h4>
          <div className="max-w-md mx-auto">
            {selectedFriendHabitList.some(habit => habit.title == selectedHabit.title) ? (
              selectedFriendHabitList
                .filter(habit => habit.title == selectedHabit.title)
                .map((habit) => (
                  <Calendar
                    key={habit.title} // Use a unique key
                    currentMonth={currentMonth}
                    currentYear={currentMonth.getFullYear()}
                    id={selectedFriend.id}
                    isEditable={false}
                    onDayClick={() => { }}
                    events={habit.events}
                    color={habit.color}
                    title={habit.title}
                  />
                ))
            ) : (
              <p className="text-red-500">This habit is not found in {selectedFriend.name}'s habit list.</p>
            )}
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;