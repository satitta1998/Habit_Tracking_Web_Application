/**
 * LoginPage Component
 * This component provides the UI and functionality for both user login and sign-up.
 * Uses Firebase Authentication.
 * Adds a new user and automatically adds a default example habit for new user.
 */

import React, { useState } from "react";
import DarkModeToggle from "./DarkModeToggle";
import { auth } from '../firebase/config.js';
import { signInWithEmailAndPassword, getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// For local development
//const API_BASE_URL = "http://localhost:3000";

// For production, switch to deployed URL
const API_BASE_URL = "https://habit-tracking-web-application.onrender.com";

const LoginPage = ({ onLogin, setIsDarkMode, isDarkMode }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userID, setUserID] = useState(null);
  const [email, setEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [userAdded, setUserAdded] = useState(false); // State to track if user has been added

  const toggleDarkMode = (isDarkMode) => {
    localStorage.setItem("isDarkMode", isDarkMode);
    setIsDarkMode(isDarkMode);
  };

  // Handle sign-up submission for new users
  const handleSignUp = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      //Check if name and surname are empty or only spaces
      if(!name.trim()) {
        throw new Error("Name and surname are required");
      }
      // Create a new user account in Firebase Authentication with an email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, signUpPassword);

      const user = userCredential.user;
      setUserID(user.uid);
      localStorage.setItem("userID", user.uid);
      localStorage.setItem("name", name);
      localStorage.setItem("surname", surname);
      console.log("User signed up successfully to authorization mechanism");
      setUserAdded(true); // Set userAdded to true

      fetch(`${API_BASE_URL}/add_user?id=${user.uid}&name=${name}&surname=${surname}`)
        .then((response) => {
          if (!response.ok) {
            const errorData = response.json();   //read JSON from backend
            throw new Error("Failed to add user to Firestore users collection: ", errorData.message);
          }
          return response.json();
        })
        .then((data) => {
          console.log("User added:", data);
          console.log("Adding example habit user-habits collection in Firebase", user.uid);
          fetch(`${API_BASE_URL}/add_habit?id=${encodeURIComponent(user.uid)}&habitName=ExampleHabit&color=${encodeURIComponent('#000000')}`)
            .then((response) => {
              console.log("Example habit added successfully", response);
            });
        })
        .catch((error) => {
          console.log("Error adding user:", error);
        });
    } catch (error) {
      console.log(`Sign Up Error: ${error.message}`);
      if(error.code) {
        // switch-case on error code to give appropriate message
        switch(error.code) {
          case 'auth/email-already-in-use':
            alert('The provided email is already in use by an existing user');
            break;
          case 'auth/invalid-email':
            alert('The provided value for the email user property is invalid');
            break;
          case 'auth/missing-password':
            alert('Missing password')
            break;
          case 'auth/weak-password':
            alert('Weak password: password should be at least 6 characters');
            break;
        }
      } else {
        alert(`Sign Up Error: ${error.message}`);
      }
    }
  };

  // Handle form submission for logging in
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Log in to an exist user account in Firebase Authentication with an email and password
    signInWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setUserID(user.uid);
        localStorage.setItem("userID", user.uid);
        console.log("Log In successful");
        onLogin();
      })
      .catch((error) => {
        console.log(`Log In Error: ${error.message}`);
        if(error.code){
          switch(error.code){
            case 'auth/invalid-email':
              alert('The provided value for the email user property is invalid');
              break;
            case 'auth/missing-password':
              alert('Missing password');
              break;
            case 'auth/invalid-credential':
              alert('The provided credentials could not be used or wrong password');
              break;
          }
        } else {
          alert('Log In Error');
        }
      });
  };

  return (
    <div
      className={`flex min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white " : "bg-violet-100 text-gray-900"
      }`}
    >
      <main className="flex-grow p-6">
        <header className="flex justify-end mb-6">
          <DarkModeToggle onToggle={toggleDarkMode} />
        </header>

        {/* Log In Form */}
        <form
          onSubmit={handleSubmit}
          className={`max-w-sm mx-auto rounded p-5 mb-6 ${
            isDarkMode
              ? "bg-gray-700 text-white"
              : "bg-white text-gray-900 shadow-md"
          }`}
        >
          <h2 className="text-2xl font-bold mb-2 text-center">Please Log In</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(info) => setUsername(info.target.value)}
            className={`w-full p-2 mb-4 border rounded ${
              isDarkMode ? "bg-gray-500 border-gray-700 placeholder-white" : ""
            }`}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(info) => setPassword(info.target.value)}
            className={`w-full p-2 mb-4 border rounded ${
              isDarkMode ? "bg-gray-500 border-gray-700 placeholder-white" : ""
            }`}
          />
          <button
            type="submit"
            className="w-full p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Log In
          </button>
        </form>

        {/* Sign Up Form */}
        {!userAdded ? ( // Show sign up form or message based on userAdded state
          <form
            onSubmit={handleSignUp}
            className={`max-w-sm mx-auto rounded p-5 ${
              isDarkMode
                ? "bg-gray-700 text-white"
                : "bg-white text-gray-900 shadow-md"
            }`}
          >
            <h2 className="text-2xl font-bold mb-2 text-center">Sign Up</h2>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-2 mb-4 border rounded ${
                isDarkMode ? "bg-gray-500 border-gray-700 placeholder-white" : ""
              }`}
            />
            <input
              type="text"
              placeholder="Surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className={`w-full p-2 mb-4 border rounded ${
                isDarkMode ? "bg-gray-500 border-gray-700 placeholder-white" : ""
              }`}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 mb-4 border rounded ${
                isDarkMode ? "bg-gray-500 border-gray-700 placeholder-white" : ""
              }`}
            />
            <input
              type="password"
              placeholder="Password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              className={`w-full p-2 mb-4 border rounded ${
                isDarkMode ? "bg-gray-500 border-gray-700 placeholder-white" : ""
              }`}
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign Up New User
            </button>
          </form>
        ) : (
          <div className="max-w-sm mx-auto rounded p-5 bg-green-100 text-gray-900 shadow-md">
            <h2 className="text-2xl font-bold mb-2 text-center">User Added!</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default LoginPage;
