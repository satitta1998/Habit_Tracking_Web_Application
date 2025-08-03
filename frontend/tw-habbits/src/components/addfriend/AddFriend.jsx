/**
 * AddFriend Component
 * Manages adding and removing friends for the user.
 * Displays a list of all users with options to add or remove them as friends.
 */

import React, { useState, useEffect } from 'react';

// For local development
//const API_BASE_URL = "http://localhost:3000";

// For production, switch to deployed URL
const API_BASE_URL = "https://habit-tracking-web-application.onrender.com";

const AddFriend = () => {
  const [friendsList, setFriendsList] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user's friends from the backend
  const fetchFriends = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_user_personal_data?id=${localStorage.getItem("userID")}`);
      if (!response.ok) throw new Error('Failed to fetch user friends');
  
      const data = await response.json();
      
      if (data && data.friends && Array.isArray(data.friends)) {
        const newFriendsList = await Promise.all(data.friends.map(async (friendID) => {
          const friendResponse = await fetch(`${API_BASE_URL}/get_user_personal_data?id=${friendID}`);
          if (!friendResponse.ok) throw new Error('Failed to fetch user friend details');
  
          const friendData = await friendResponse.json();
          return {
            id: friendID,
            name: `${friendData.name} ${friendData.surname}`
          };
        }));
  
        // Update the friends list state
        setMyFriends(newFriendsList);
      } else {
        setMyFriends([]);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  // Fetch all users from the backend
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_all_users`);
      if (!response.ok) throw new Error('Failed to get all users data');

      const data = await response.json();
      console.log("data", data)

      if (data) {
        // Map over the data and extract the necessary information
        const newFriendsList = data.map((user) => ({
          id: user.id,
          name: user.name,
          surname: user.surname,
        }));
  
        // Update the state with the new friends list
        setFriendsList(newFriendsList);
      } else {
        setFriendsList([]);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchFriends();
  }, []);

  // Adding and removing friends from DB and friendsList list
  const handleAddRemoveFriend = async (friend) => {
    try {
      if (myFriends.some(f => f.id === friend.id)) {
        // Remove friend from friendsList
        await fetch(`${API_BASE_URL}/remove_friend?userId=${localStorage.getItem("userID")}&friendId=${friend.id}`);
        console.log("Friend removed from DB");
        setMyFriends(prevFriends => prevFriends.filter(f => f.id !== friend.id));
      } else {
        // Add friend to friendsList
        await fetch(`${API_BASE_URL}/add_friend?userId=${localStorage.getItem("userID")}&friendId=${friend.id}`);
        console.log("Friend added to DB");
        setMyFriends(prevFriends => [...prevFriends, friend]);
      }
      // Re-fetch the friends list to ensure the state is up-to-date
      fetchFriends();
    } catch (error) {
      console.error('Error in adding/removing the friend:', error);
    }
  };

  const filteredFriends = friendsList
    .filter(friend => friend.id !== localStorage.getItem("userID")) // Exclude current user
    .filter(friend =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.surname.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name or surname..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 border rounded dark:bg-slate-800 dark:text-white"
      />

      {/* Friends List */}
      <ul className="space-y-4">
        {filteredFriends.map(friend => (
          <li key={friend.id} className="flex justify-between items-center">
            <div className="dark:text-white">
              <span className="font-bold">{friend.name}</span> {friend.surname}
            </div>
            <button
              onClick={() => handleAddRemoveFriend(friend)}
              className={`px-4 py-2 rounded ${
                myFriends.some(f => f.id === friend.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {myFriends.some(f => f.id === friend.id) ? 'Remove' : 'Add'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddFriend;
