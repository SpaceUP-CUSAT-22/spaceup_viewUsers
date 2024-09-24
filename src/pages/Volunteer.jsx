import React from 'react'

import React, { useState, useEffect } from 'react'
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase configuration details
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reference the "volunteer_applications" collection
const volunteersRef = collection(db, "volunteer_applications");

const Volunteer = () => {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    // Fetch the volunteer applications
    async function getVolunteerApplications() {
      try {
        const querySnapshot = await getDocs(volunteersRef);
        const volunteerList = [];
        querySnapshot.forEach((doc) => {
          volunteerList.push({ id: doc.id, ...doc.data() });
        });
        setVolunteers(volunteerList);
      } catch (error) {
        console.error("Error fetching volunteer applications:", error);
      }
    }

    getVolunteerApplications();
  }, []);

  return (
    <div>
      <h1>Volunteer Applications</h1>
      {volunteers.map((volunteer) => (
        <div key={volunteer.id}>
          {/* Display volunteer information here */}
          <p>{volunteer.name}</p>
          {/* Add more fields as needed */}
        </div>
      ))}
    </div>
  )
}

export default Volunteer

