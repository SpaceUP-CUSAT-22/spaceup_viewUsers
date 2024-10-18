import React, { useState, useEffect } from 'react'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Link } from 'react-router-dom';
import Papa from 'papaparse';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

function Register() {
  const [users, setUsers] = React.useState([])
  const [totalPrice, setTotalPrice] = React.useState(0)
  const [usersCopy, setUsersCopy] = React.useState([])
  const [referralCounts, setReferralCounts] = useState({});


  useEffect(() => {
    async function fetchRegisteredUsers() {
      const usersCollection = collection(db, 'ticketorders');
      
      try {
        const querySnapshot = await getDocs(usersCollection);
        
        const usersData = [];
        let totalPriceSum = 0;
        
        querySnapshot.forEach((doc) => {
          const userData = { id: doc.id, ...doc.data(), arrived: doc.data().arrived || false };
          usersData.push(userData);
          
          // Calculate total price
          if (userData.price) {
            totalPriceSum += userData.price;
          } else if (userData.referralCode) {
            totalPriceSum += 359.10;
          }
        });
        
        setUsers(usersData);
        setTotalPrice(totalPriceSum);
        setUsersCopy(usersData);

        // Calculate referral counts
        const counts = usersData.reduce((acc, user) => {
          if (user.referralCode) {
            acc[user.referralCode] = (acc[user.referralCode] || 0) + 1;
          }
          return acc;
        }, {});
        setReferralCounts(counts);

        console.log(usersData);
      } catch (error) {
        console.error('Error fetching registered users:', error);
        throw error;
      }
    }
    fetchRegisteredUsers();
  }, []);

  const handleCode = (e) => {
    if(e.target.value == ''){
      setUsersCopy(users)
    }else{
      setUsersCopy(users.filter(user => user.token.toLowerCase().includes(e.target.value)))
    }
  }

  const handleName = (e) => {
    if(e.target.value == ''){
      setUsersCopy(users)
    }else{
      setUsersCopy(users.filter(user => user.name.toLowerCase().includes(e.target.value)))
    }
  }

  const handleArrivalChange = async (userId, arrived) => {
    const userRef = doc(db, 'ticketorders', userId);
    try {
      await updateDoc(userRef, {
        arrived: arrived
      });
      setUsers(users.map(user => 
        user.id === userId ? {...user, arrived: arrived} : user
      ));
      setUsersCopy(usersCopy.map(user => 
        user.id === userId ? {...user, arrived: arrived} : user
      ));
    } catch (error) {
      console.error("Error updating user arrival status:", error);
    }
  };

  const exportToCSV = () => {
    const csvData = Papa.unparse(users);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'registrations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="bg-zinc-900 min-h-screen p-4 sm:p-6 lg:p-8">
  <div className="max-w-7xl mx-auto">
    <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
      <Link to="/tshirt" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
        T-shirt
      </Link>
      <Link to="/volunteer" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
        Volunteer
      </Link>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <input
          onChange={e => handleCode(e)}
          type="text"
          placeholder="Search by code"
          className="w-full sm:w-64 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <input
          onChange={e => handleName(e)}
          type="text"
          placeholder="Search by name"
          className="w-full sm:w-64 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <button
        onClick={exportToCSV}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
        Export to CSV
      </button>
    </div>

    {users && (
      <div className="bg-zinc-800 rounded-xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total registered", value: users.length },
          { label: "Arrived", value: users.filter(user => user.arrived === true).length },
          { label: "Total Amount", value: `₹${totalPrice}` },
          { label: "Dr. Yedu Krishna", value: users.filter(user => user.workshop === "Dr. Yedu Krishna").length },
          { label: "AMAL SREE AJITH", value: users.filter(user => user.workshop === "AMAL SREE AJITH").length },
          { label: "TEAM MARUTSAKA", value: users.filter(user => user.workshop === "TEAM MARUTSAKA").length },
          { label: "Quiz", value: users.filter(user => user.workshop === "Quiz").length },
        ].map((item, index) => (
          <div key={index} className="bg-zinc-700 p-4 rounded-lg">
            <p className="text-zinc-300 text-sm">{item.label}</p>
            <p className="text-white text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    )}

{Object.keys(referralCounts).length > 0 && (
          <div className="bg-zinc-800 rounded-xl p-6 mb-8">
            <h2 className="text-white text-xl font-bold mb-4">Referral Code Usage</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(referralCounts).map(([code, count]) => (
                <div key={code} className="bg-zinc-700 p-4 rounded-lg">
                  <p className="text-zinc-300 text-sm">Referral Code: {code}</p>
                  <p className="text-white text-2xl font-bold">Used {count} time{count !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}


    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {usersCopy && usersCopy.map(user => (
        <div key={user.id} className={`${user.independence ? 'bg-green-900' : 'bg-zinc-800'} rounded-xl overflow-hidden shadow-lg`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-red-500 text-xl font-bold">{user.token || 'No Token'}</h2>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id={`arrived-${user.id}`}
                  checked={user.arrived || false}
                  onChange={(e) => handleArrivalChange(user.id, e.target.checked)}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor={`arrived-${user.id}`} className="ml-2 text-white text-sm">Arrived</label>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Name", value: user.name },
                { label: "Phone", value: user.phone },
                { label: "Email", value: user.email },
                { label: "Institution", value: user.college },
                { label: "Class/Year", value: user.year },
                { label: "Workshop", value: user.workshop },
                { label: "Referral code", value: user.referralCode },
              ].map((item, index) => (
                <p key={index} className="text-white">
                  <span className="font-semibold">{item.label}:</span> {item.value}
                </p>
              ))}
            </div>
          </div>
          {user.paymentScreenshot && (
            <div className="p-4 bg-zinc-700">
              <p className="text-white text-sm mb-2">Payment Screenshot:</p>
              <img src={user.paymentScreenshot} className="w-full h-full object-cover rounded" alt="Payment Screenshot" />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
</div>
  )
}

export default Register
