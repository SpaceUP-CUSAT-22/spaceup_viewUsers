import React, { useState, useEffect } from 'react'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
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

const firebaseConfig2 = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY_2,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN_2,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID_2,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET_2,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID_2,
  appId: import.meta.env.VITE_FIREBASE_APPID_2,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID_2
};

// Initialize both Firebase instances
const app1 = initializeApp(firebaseConfig, "app1");
const app2 = initializeApp(firebaseConfig2, "app2");
const db1 = getFirestore(app1);
const db2 = getFirestore(app2);

function Tshirt() {
  const [users, setUsers] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [usersCopy, setUsersCopy] = useState([])
  const [referralCounts, setReferralCounts] = useState({});


  useEffect(() => {
    async function fetchRegisteredUsers() {
      const usersCollection1 = collection(db1, 'merchorders');
      const usersCollection2 = collection(db2, 'merchorders');
      
      try {
        const [querySnapshot1, querySnapshot2] = await Promise.all([
          getDocs(usersCollection1),
          getDocs(usersCollection2)
        ]);
        
        const usersData = [];
        
        function processSnapshot(querySnapshot, dbIndex) {
          querySnapshot.forEach((doc) => {
            const userData = { 
              id: `${dbIndex}-${doc.id}`, 
              ...doc.data(),
              dbSource: dbIndex 
            };
            usersData.push(userData);
          });
        }

        processSnapshot(querySnapshot1, 1);
        processSnapshot(querySnapshot2, 2);
        
        setUsers(usersData);
        setTotalPrice(usersData.reduce((sum, user) => sum + user.price, 0));
        setUsersCopy(usersData);

        // Calculate referral counts
        const counts = usersData.reduce((acc, user) => {
          if (user.referralCode) {
            acc[user.referralCode] = (acc[user.referralCode] || 0) + 1;
          }
          return acc;
        }, {});
        setReferralCounts(counts);
      } catch (error) {
        console.error('Error fetching registered users:', error);
      }
    }
    fetchRegisteredUsers();
  }, [])

  const handleCode = (e) => {
    const value = e.target.value.toLowerCase();
    setUsersCopy(value ? users.filter(user => user.token.toLowerCase().includes(value)) : users)
  }

  const handleName = (e) => {
    const value = e.target.value.toLowerCase();
    setUsersCopy(value ? users.filter(user => user.name.toLowerCase().includes(value)) : users)
  }

  const handleDeliveredChange = async (userId, delivered) => {
    const [dbIndex, docId] = userId.split('-');
    const db = dbIndex === '1' ? db1 : db2;
    const userRef = doc(db, 'merchorders', docId);
    try {
      await updateDoc(userRef, { delivered });
      setUsers(users.map(user => 
        user.id === userId ? {...user, delivered} : user
      ));
      setUsersCopy(usersCopy.map(user => 
        user.id === userId ? {...user, delivered} : user
      ));
    } catch (error) {
      console.error("Error updating delivery status:", error);
    }
  }

  const exportToCSV = () => {
    const csvData = Papa.unparse(users);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tshirts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-zinc-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
            Register
          </Link>
          <Link to="/volunteer" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
            Volunteer
          </Link>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              onChange={handleCode}
              type="text"
              placeholder="Search by code"
              className="w-full sm:w-64 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              onChange={handleName}
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

        {users.length > 0 && (
          <div className="bg-zinc-800 rounded-xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { label: "Total Amount", value: `₹${totalPrice}` },
              { label: "Total Orders", value: users.length },
              { label: "Black/Orange T-Shirts", value: users.filter(user => user.orangeShirt).length },
              { label: "White T-Shirts", value: users.filter(user => user.whiteShirt).length },
              { label: "White Hoodies", value: users.filter(user => user.hoodie).length },
              { label: "Black Hoodies", value: users.filter(user => user.blackHoodie).length },
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
          {usersCopy.map(user => (
            <div key={user.id} className={`${user.independence ? 'bg-green-900' : 'bg-zinc-800'} rounded-xl overflow-hidden shadow-lg`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-red-500 text-xl font-bold">{user.token || 'No Token'}</h2>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`delivered-${user.id}`}
                      checked={user.delivered || false}
                      onChange={(e) => handleDeliveredChange(user.id, e.target.checked)}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor={`delivered-${user.id}`} className="ml-2 text-white text-sm">Delivered</label>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Name", value: user.name },
                    { label: "Phone", value: user.phone },
                    { label: "Email", value: user.email },
                    { label: "Size", value: user.size },
                    { label: "Address", value: user.address },
                    { label: "Orange Shirt", value: user.orangeShirt == 1 || user.orangeShirt == true ? "Yes" : "No" },
                    { label: "White Shirt", value: user.whiteShirt == 1 || user.whiteShirt == true ? "Yes" : "No" },
                    { label: "Hoodie", value: user.hoodie == 1 || user.hoodie == true ? "Yes" : "No" },
                    { label: "Black Hoodie", value: user.blackHoodie == 1 || user.blackHoodie == true ? "Yes" : "No" },
                    { label: "Price", value: user.price },
                    { label: "Referral Code", value: user.referralCode },
                    ]
                  .map((item, index) => (
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

export default Tshirt