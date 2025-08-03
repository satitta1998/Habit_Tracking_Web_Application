/** index.js file sets up a backend server that connects to Firebase Firestore (via Firebase Admin SDK)
 * and exposes  REST API endpoints for Habit Tracking application. */

const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;
const { db, FieldValue } = require('./firebase.js');

// Enable CORS for all routes
app.use(cors());

// Define a route handler for the default home page
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Add user to user collection in the firestore db
app.get('/add_user', async (req, res) => {
  console.log('I am in add_user');
  const { id, name, surname } = req.query;
  if (!id || !name || !surname) {
    // Error 400 - sign-in request with password couldn't be processed
    return res.status(400).json({success: false, message: "ID, name, and surname are required"});
  }
  try {
    const peopleRef4 = db.collection('users').doc(id);
    await peopleRef4.set({
      name: name,
      surname: surname,
      friends: []
    });
    res.json({ success: true, message: "User added successfully" });
  } catch (error) {
    console.error(`Error adding ${name} ${surname}: `, error);
    // Error 500 - server got an unexpected condition and could not process the request
    res.status(500).json({success: false, message: "Error adding user: ", error});
  }
});

// Endpoint for adding new habit
// endpoint should get user's id and habit name
app.get('/add_habit', async (req, res) => {
  console.log('I am in add_habit');

  const {id, habitName, color} = req.query;
  if (!id || !habitName || !color) {
    return res.status(400).send('ID and habit name are required');
  }

  try {
    // Reference to the user's document
    const userRef = db.collection('users_habits').doc(id);
    const userDoc = await userRef.get();

    // Create a structure for the habit with an empty list of events
    const newHabit = {
      name: habitName,
      color: color,
      events: [] // Empty list of habit events
    };

    // Check if the user document exists
    if (userDoc.exists) {
      // User exists, so update their document with the new habit
      await userRef.update({
        [habitName]: newHabit
      });
    } else {
      // User doesn't exist, create a new document with the habit
      await userRef.set({
        [habitName]: newHabit
      });
    }

    res.status(200).send('Habit added successfully');
  } catch (error) {
    console.error('Error adding habit:', error);
    res.status(500).send('Error adding habit');
  }
});

// Endpoint adding event for specific habig
// endpoint should get user's id, habit name and event(date)
app.get('/add_event_to_habit', async (req, res) => {
  console.log('I am in add_event');

  const { id, habitName, habitEvent } = req.query;
  if (!id || !habitName || !habitEvent) {
    return res.status(400).send('ID, habit name, and event are required');
  }

  try {
    // Reference to the user's document
    const userRef = db.collection('users_habits').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('User or habit not found');
    }

    const habitData = userDoc.data()[habitName];

    if (!habitData) {
      return res.status(404).send('Habit not found');
    }

    // Add the new event to the habit's events array
    habitData.events.push(habitEvent);

    // Update the habit with the new event in Firestore
    await userRef.update({
      [habitName]: habitData
    });

    res.status(200).send('Event added successfully');
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).send('Error adding event');
  }
});


// Endpoint for deleting a habit
// endpoint should get user's id and habit name
app.get('/delete_habit', async (req, res) => {
  console.log('I am in del_habit');
  
  const { id, habitName } = req.query;
  console.log(id, habitName);

  if (!id || !habitName) {
    return res.status(400).send('ID and habit name are required');
  }

  try {
    // Reference to the user's document
    const userRef = db.collection('users_habits').doc(id);
    const userDoc = await userRef.get();

    // Check if the user document exists
    if (!userDoc.exists) {
      console.error('[ERROR] userDoc is not in DB - userDoc.exists is false');
      return res.status(404).send('User or habit not found');
    }

    const habitData = userDoc.data();
    
    // Check if the habit exists in the document
    if (!habitData[habitName]) {
      console.error('[ERROR] Habit not found in user document');
      return res.status(404).send('Habit not found');
    }

    // Remove the habit from the document

    await userRef.update({
      [habitName]: FieldValue.delete()
    });

    console.log('Habit deleted successfully');
    return res.status(200).send('Habit deleted successfully');
    
  } catch (error) {
    console.error('[ERROR]: delete habit:', error);
    return res.status(500).send('Error deleting habit');
  }
});
// Endpoint adding event for specific habig
// // endpoint should get user's id, habit name and event(date)
app.get('/delete_event_from_habit', async (req, res) => {
  console.log('I am in delete_event_from_habit');

  const { id, habitName, eventDate } = req.query;

  if (!id || !habitName || !eventDate) {
    return res.status(400).send('ID, habit name, and event date are required');
  }

  try {
    // Reference to the user's document
    const userRef = db.collection('users_habits').doc(id);
    const userDoc = await userRef.get();

    // Check if the user document exists
    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const userData = userDoc.data();

    // Check if the habit exists in the user's document
    if (!userData[habitName]) {
      return res.status(404).send('Habit not found');
    }

    const habit = userData[habitName];

    // Filter out the event to be deleted
    const updatedEvents = habit.events.filter(event => event !== eventDate);

    // Update the habit with the new list of events
    await userRef.update({
      [`${habitName}.events`]: updatedEvents
    });

    res.status(200).send('Event deleted successfully');
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).send('Error deleting event');
  }
});


// Endpoint for getting user's personal data
// endpoint should get user's id
app.get('/get_user_personal_data', async (req, res) => {
  console.log('I am in get_user_personal_data');
  //id = "337889133";
  const {id} = req.query;
  try {
    if(!id) {
      return res.status(400).send('User ID is required');
    }

    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      res.status(404).send('No such user found!');
    } else {
      console.log(userDoc.data());
      res.json(userDoc.data());
    }
  }catch (error) {
    console.error("Error getting user: ", error);
  }
});

// Endpoint for getting user's habits:
// endpoint should get user's id
app.get('/get_user_habits', async (req, res) => {
  console.log('I am in get_user_habits');
  const id = req.query.id;

  if (!id) {
    return res.status(400).send('User ID is required');
  }

  try {
    const userHabitsRef = db.collection('users_habits').doc(id);
    const userHabitsDoc = await userHabitsRef.get();

    if (!userHabitsDoc.exists) {
      return res.status(404).send('No habits found for this user');
    }

    const userHabitsData = userHabitsDoc.data();

    console.log('User habits:', userHabitsData);
    res.json({ habits: userHabitsData });
  } catch (error) {
    console.error("Error retrieving user's habits: ", error);
    res.status(500).send('Error retrieving habits');
  }
});


// Endpoint for getting user's specific habit data:
// endpoint should get: user's id, habit name
app.get('/get_specific_habit', async (req, res) => {
  console.log('I am in get_specific_habit');
  
  const id = req.query.id;
  const habitName = req.query.habitName;


  if (!id || !habitName) {
    return res.status(400).send('ID and habit name are required');
  }

  try {
    // Reference to the user's habit document
    const habitRef = db.collection('users_habits').doc(id);
    const habitDoc = await habitRef.get();

    if (!habitDoc.exists) {
      return res.status(404).send('No habit data found for this user');
    }

    const habitData = habitDoc.data();

    // Check if the habit exists
    if (!habitData[habitName]) {
      return res.status(404).send('Habit not found for this user');
    }

    // Retrieve the specific habit data
    const habit = habitData[habitName];
    console.log(habit);
    res.json(habit);
  } catch (error) {
    console.error("Error retrieving habit data: ", error);
    res.status(500).send('Error retrieving habit data');
  }
});

// Get all users data
app.get('/get_all_users', async (req, res) => {
  console.log('I am in get_all_users');
  
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    if (snapshot.empty) {
      return res.status(404).send('No users found');
    }
    
    const users = [];
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(users);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).send('Error fetching users');
  }
});

// Adding a friend to a user's friend list
// endpoint should get user's id and friend's id
app.get('/add_friend', async (req, res) => {
  console.log('I am in add_friend');
  try {
    const userId = req.query.userId; // Get the userId from the query parameters
    const friendId = req.query.friendId; // Get the friendId from the query parameters

    if (!userId || !friendId) {
      return res.status(400).send('User ID and Friend ID are required.');
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('User not found.');
    }

    // Get the current friends array
    const userData = userDoc.data();
    const currentFriends = userData.friends || [];

    // Check if the friendId is already in the list
    if (currentFriends.includes(friendId)) {
      return res.status(400).send('Friend already added.');
    }

    // Add the new friendId to the friends array
    currentFriends.push(friendId);

    // Update the user's document with the new friends array
    await userRef.update({ friends: currentFriends });

    res.send('Friend added to Firestore successfully.');
  } catch (error) {
    console.error("Error adding friend: ", error);
    res.status(500).send('Error adding friend to Firestore.');
  }
});

// Removing a friend from a user's friend list
// endpoint should get user's id and friend's id
app.get('/remove_friend', async (req, res) => {
  console.log('I am in remove_friend');
  try {
    const userId = req.query.userId; // Get the userId from the query parameters
    const friendId = req.query.friendId; // Get the friendId from the query parameters

    if (!userId || !friendId) {
      return res.status(400).send('User ID and Friend ID are required.');
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('User not found.');
    }

    // Get the current friends array
    const userData = userDoc.data();
    const currentFriends = userData.friends || [];

    // Check if the friendId is in the list
    if (!currentFriends.includes(friendId)) {
      return res.status(400).send('Friend not found in list.');
    }

    // Remove the friendId from the friends array
    const updatedFriends = currentFriends.filter(id => id !== friendId);

    // Update the user's document with the new friends array
    await userRef.update({ friends: updatedFriends });

    res.send('Friend removed from Firestore successfully.');
  } catch (error) {
    console.error("Error removing friend: ", error);
    res.status(500).send('Error removing friend from Firestore.');
  }
});


// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



