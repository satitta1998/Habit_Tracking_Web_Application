/**
 * Dashboard Component
 * Displays the main dashboard of the habit tracking application.
 * Displays personal user data. Displays the user's daily habit success rate as a pie chart.
 * Displays the competition data showing friends' success rates in a bar chart.
 */

import React, { useState, useEffect } from "react";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import DashboardIntro from "./DashboardIntro";

// For local development
//const API_BASE_URL = "http://localhost:3000";

// For production, switch to deployed URL
const API_BASE_URL = "https://habit-tracking-web-application.onrender.com";

const Dashboard = ({ isDarkMode }) => {
  const [userData, setUserData] = useState(null); // State to hold user data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to track any error that occurs during data fetching
  // State to hold competition data for friends
  const [competitionData, setCompetitionData] = useState({
    name: [],
    percentage: [],
  });
  const [dailySuccessData, setDailySuccessData] = useState(null); // State to hold daily success data for the pie chart

  // Fetch user data
  const fetchUserData = () => {
    setLoading(true);
    fetch(
      `${API_BASE_URL}/get_user_personal_data?id=${localStorage.getItem(
        "userID"
      )}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        return response.json();
      })
      .then((data) => {
        setUserData(data);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const calcPercentage = () => {
      fetch(
        `${API_BASE_URL}/get_user_habits?id=${localStorage.getItem(
          "userID"
        )}`
      )
        .then((response) => {
          if (response.ok) {
          return response.json();
          } else throw new Error("Failed");
        })
        .then((data) => {
          if (data) {
            const habits = data.habits;
            const keys = Object.keys(habits);
            const total = keys.length; // total number of habits
            let active = 0; // actual preformed habbits
            const today = new Date().toISOString().split("T")[0]; //get todays date using correct format
            keys.forEach((key) => {
              if (habits[key].events.includes(today)) active++; // count if habbit preformed today
            });
            const percent = (active / total) * 100; // calculate percentage of performed habbits
            if (total > 0) setDailySuccessData([percent, 100 - percent]);
            else setDailySuccessData(0);
          }
        })
        .catch((error) => {
          setError(error.message);
        });
    };

    calcPercentage();
  }, [userData]);

  useEffect(() => {
    if (userData) {
      const friendsPercents = () => {
        const tempData = [];
  
        const fetchFriendData = async (friend) => {
          try {
            const personalResponse = await fetch(
              `${API_BASE_URL}/get_user_personal_data?id=${friend}`
            );
            if (!personalResponse.ok) {
              throw new Error(`Failed to fetch personal data for friend ID: ${friend}`);
            }
            const personalData = await personalResponse.json();
  
            const habitsResponse = await fetch(
              `${API_BASE_URL}/get_user_habits?id=${friend}`
            );
            if (!habitsResponse.ok) {
              if (habitsResponse.status === 404) {
                tempData.push({ name: personalData.name, percentage: 0 });
                return;
              } else {
                throw new Error(`Failed to fetch habits for friend ID: ${friend}`);
              }
            }
            const habitsData = await habitsResponse.json();

            const habits = habitsData.habits;
            const keys = Object.keys(habits);
            const total = keys.length; // total number of habits
            let active = 0; // actual preformed habbits
            const today = new Date().toISOString().split("T")[0]; //get todays date using correct format
            keys.forEach((key) => {
              if (habits[key].events.includes(today)) active++; // count if habbit preformed today
            });
            const percent = (active / total) * 100; // calculate percentage of performed habbits
            tempData.push({ name: personalData.name, percentage: percent });
          } catch (error) {
            console.error(`Error fetching data for friend ID: ${friend}`, error);
          }
        };
  
        const fetchAllFriendsData = async () => {
          await Promise.all(userData.friends.map(fetchFriendData));
          // Sort tempData based on the friend ID to maintain consistent order
          tempData.sort((a, b) => a.name.localeCompare(b.name));
          const names = tempData.map((entry) => entry.name);
          const percentages = tempData.map((entry) => entry.percentage);
          setCompetitionData({ name: names, percentage: percentages });
        };
  
        fetchAllFriendsData();
      };
  
      friendsPercents();
    }
  }, [userData]);
  

  useEffect(() => { // only fetch user data on page load
    fetchUserData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="mx-auto py-6 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="px-4 py-6 sm:px-0">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Hello, {userData.name + " " + userData.surname}
        </h2>
        <div>
          <DashboardIntro />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-2 bg-white border border-slate-900 overflow-hidden shadow rounded-lg p-5 dark:bg-slate-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Competition with Friends
            </h3>
            {competitionData.name.length > 0 ? (
              <BarChart data={competitionData} width={800} height={400} />
            ) : (
              <p className="text-black dark:text-white">
                You are not connected to any friends yet!
                <br />
                Please go to Add Friend tab to add your first friend!
              </p>
            )}
          </div>
          <div className="bg-white border border-slate-900 overflow-hidden shadow rounded-lg p-5 dark:bg-slate-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Daily Success Rate
            </h3>
            {dailySuccessData != 0 ? (
              <PieChart data={dailySuccessData} isDarkMode={isDarkMode} />
            ) : (
              <p className="text-black dark:text-white">
                You don't have any habits yet!
                <br />
                Please add habits on the habits page.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;