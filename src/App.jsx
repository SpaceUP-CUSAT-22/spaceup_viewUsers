import React from 'react'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs } from "firebase/firestore";
const firebaseConfig = {
  apiKey:  import.meta.env.VITE_apiKey,
  authDomain:  import.meta.env.VITE_authDomain,
  projectId:  import.meta.env.VITE_projectId,
  storageBucket:  import.meta.env.VITE_storageBucket,
  messagingSenderId:  import.meta.env.VITE_messagingSenderId,
  appId:  import.meta.env.VITE_appId,
  measurementId:  import.meta.env.VITE_measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

function App() {
  const [users, setUsers] = React.useState([])
  const [usersCopy, setUsersCopy] = React.useState([])
  React.useEffect(() => {
    async function fetchRegisteredUsers() {
      const usersCollection = collection(db, 'registeredUsers');
      
      try {
        const querySnapshot = await getDocs(usersCollection);
        
        const usersData = [];
        
        querySnapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() });
        });
        
        setUsers(usersData)
        setUsersCopy(usersData)
        console.log(usersData)
      } catch (error) {
        console.error('Error fetching registered users:', error);
        throw error;
      }
    }
    fetchRegisteredUsers()
  }, [])

  const handleCode = (e) => {
    if(e.target.value == ''){
      setUsersCopy(users)
    }else{
      setUsersCopy(users.filter(user => user.formData.code.toLowerCase().includes(e.target.value)))
    }
  }
  const handleName = (e) => {
    if(e.target.value == ''){
      setUsersCopy(users)
    }else{
      setUsersCopy(users.filter(user => user.formData.name.toLowerCase().includes(e.target.value)))
    }
  }

  return (
    <div className='px-10 py-10'>
      <div className='flex justify-evenly'>
        <input onChange={e => handleCode(e)} type="text" placeholder='search by code' className='pl-3 py-3 rounded-[10px] border-[1.5px] border-zinc-300' />
        <input onChange={e => handleName(e)} type="text" placeholder='search by name' className='pl-3 py-3 rounded-[10px] border-[1.5px] border-zinc-300' />
      </div>
      {usersCopy && usersCopy.map(user => (
        <div className='my-10 bg-zinc-900 px-10 py-5 rounded-[15px]' key={user.id}>
          <h1 className='text-red-500 text-xl'><span className='font-bold'>Code: </span>{user.formData.code || 'None'}</h1>
          <h1 className='text-white text-xl'><span className='font-bold'>Name: </span>{user.formData.name}</h1>
          <h1 className='text-white text-xl'><span className='font-bold'>Phone: </span>{user.formData.phone}</h1>
          <h1 className='text-white text-xl'><span className='font-bold'>Name: </span>{user.formData.email}</h1>
          <h1 className='text-white text-xl'><span className='font-bold'>from CUSAT: </span>{user.formData.isFromCUSAT}</h1>
          <h1 className='text-white text-xl'><span className='font-bold'>from SEDS: </span>{user.formData.isSEDSMember}</h1>
          <h1 className='text-white text-xl'><span className='font-bold'>Year of study: </span>{user.formData.yearOfStudy}</h1>
          <h1 className='text-white text-xl'><span className='font-bold'>Referral Code: </span>{user.formData.referralCode || 'None'}</h1>
          <img src={user.formData.file} className='w-[150px]' alt="" />
        </div>
      ))
      }
    </div>
  )
}

export default App
