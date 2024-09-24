import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Link } from 'react-router-dom';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const volunteersRef = collection(db, "volunteer_applications");

const Volunteer = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getVolunteerApplications = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(volunteersRef);
        const volunteerList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched volunteers:", volunteerList);
        setVolunteers(volunteerList);
      } catch (error) {
        console.error("Error fetching volunteer applications:", error);
        setError("Error fetching volunteer applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getVolunteerApplications();
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-8">Loading volunteer applications...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

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
          <p className="text-white text-center">No volunteer applications found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteers.map((volunteer) => (
              <div
                key={volunteer.id}
                className="bg-zinc-800 rounded-xl overflow-hidden shadow-lg p-6"
              >
                <h3 className="text-red-500 text-xl font-bold mb-4">{volunteer.name}</h3>
                <ul className="text-white space-y-2 mb-4">
                  <li><strong>Phone:</strong> {volunteer.phone}</li>
                  <li><strong>Email:</strong> {volunteer.email}</li>
                  <li><strong>Department:</strong> {volunteer.department}</li>
                  <li><strong>Preferred Team:</strong> {volunteer.preferredTeam}</li>
                  <li><strong>Year of Study:</strong> {volunteer.yearOfStudy}</li>
                  <li><strong>Reason:</strong> {volunteer.reason}</li>
                  <li><strong>Timestamp:</strong> {new Date(volunteer.timestamp?.toDate()).toLocaleString()}</li>
                </ul>
                {volunteer.fileUrl && volunteer.fileUrl.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white font-semibold mb-2">Uploaded Images:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {volunteer.fileUrl.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Uploaded image ${index + 1}`}
                          className="w-full h-auto object-cover rounded"
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

