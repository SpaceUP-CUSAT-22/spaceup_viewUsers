import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Link } from 'react-router-dom';

const firebaseConfig = {
  // Your Firebase configuration details
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const volunteersRef = collection(db, "volunteer_applications");

const Volunteer = () => {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    const getVolunteerApplications = async () => {
      try {
        const querySnapshot = await getDocs(volunteersRef);
        const volunteerList = [];
        querySnapshot.forEach((doc) => {
          volunteerList.push({ id: doc.id, ...doc.data() });
        });
        setVolunteers(volunteerList);
      } catch (error) {
        console.error("Error fetching volunteer applications:", error);
        alert("Error fetching volunteer applications. Please try again later.");
      }
    };
    getVolunteerApplications();
  }, []);

  return (
    <div className="bg-zinc-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
            Register
          </Link>
          <Link to="/tshirt" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
            T-shirt
          </Link>
        </div>

        {volunteers.length === 0 ? (
          <p className="text-white">Loading volunteer applications...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteers.map((volunteer) => (
              <div
                key={volunteer.id}
                className="bg-zinc-800 rounded-xl overflow-hidden shadow-lg p-6"
              >
                <h3 className="text-red-500 text-xl font-bold">{volunteer.name}</h3>
                <div className="space-y-2 mt-4">
                  <p className="text-white">
                    <span className="font-semibold">Email:</span> {volunteer.email}
                  </p>
                  <p className="text-white">
                    <span className="font-semibold">Phone:</span> {volunteer.phone}
                  </p>
                  <p className="text-white">
                    <span className="font-semibold">Department:</span> {volunteer.department}
                  </p>
                  <p className="text-white">
                    <span className="font-semibold">Preferred Team:</span> {volunteer.preferredTeam}
                  </p>
                  <p className="text-white">
                    <span className="font-semibold">Reason:</span> {volunteer.reason}
                  </p>
                  <p className="text-white">
                    <span className="font-semibold">Year of Study:</span> {volunteer.yearOfStudy}
                  </p>
                  <p className="text-white">
                    <span className="font-semibold">Timestamp:</span> {volunteer.timestamp}
                  </p>
                </div>
                {volunteer.fileUrls && volunteer.fileUrls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white font-bold">Uploaded Files:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {volunteer.fileUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Uploaded File ${index}`}
                          className="volunteer-file-img rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Volunteer;