import React from 'react'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

function Register() {
  const [users, setUsers] = React.useState([])
  const [totalPrice, setTotalPrice] = React.useState(0)
  const [usersCopy, setUsersCopy] = React.useState([])

  React.useEffect(() => {
    async function fetchRegisteredUsers() {
      const usersCollection = collection(db, 'registrations');
      
      try {
        const querySnapshot = await getDocs(usersCollection);
        
        const usersData = [];
        
        querySnapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() });
        });
        
        setUsers(usersData)
        setTotalPrice(usersData.reduce((sum, user) => sum + user.price, 0))
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

  return (
    <div className='bg-zinc-800 px-10 py-10'>
      <div className='flex justify-evenly'>
        <Link to='/tshirt' className='bg-red-500 px-5 py-3 rounded-[10px] text-white'>T-shirt</Link>
        <input onChange={e => handleCode(e)} type="text" placeholder='search by code' className='pl-3 py-3 rounded-[10px] border-[1.5px] border-zinc-300' />
        <input onChange={e => handleName(e)} type="text" placeholder='search by name' className='pl-3 py-3 rounded-[10px] border-[1.5px] border-zinc-300' />
      </div>
      {/* <div className='my-10 bg-zinc-900 px-10 py-5 rounded-[15px]'>
        <h1 className='text-red-500 text-xl'><span className='font-bold'>Code: </span>#asdasdf</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>Name: </span>Abhinav C V</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>Phone: </span>+919778393558</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>Name: </span>abhinavcv007@gmail.com  </h1>
        <h1 className='text-white text-xl'><span className='font-bold'>from CUSAT: </span>Yes</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>from SEDS: </span>Yes</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>Year of study: </span>2025</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>Referral Code: </span>None</h1>
        <img src='/vite.svg' className='w-[150px]' alt="" />
      </div>
      <div className='my-10 bg-zinc-900 px-10 py-5 rounded-[15px]'>
        <h1 className='text-red-500 text-xl'><span className='font-bold'>Code: </span>#asdasdf</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>Name: </span>Abhinav C V</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>Phone: </span>+919778393558</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>Name: </span>abhinavcv007@gmail.com  </h1>
        <h1 className='text-white text-xl'><span className='font-bold'>from CUSAT: </span>Yes</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>from SEDS: </span>Yes</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>Year of study: </span>2025</h1>
        <h1 className='text-white text-xl'><span className='font-bold'>Referral Code: </span>None</h1>
        <img src='/vite.svg' className='w-[150px]' alt="" />
      </div> */}
      {users && 
      <div className='bg-zinc-900 rounded-[15px] px-10 py-5 my-20'>
        <p className='text-white text-xl'>Total registered: <span className='font-bold text-2xl ml-3'>{users.length}</span></p>
        <p className='text-white text-xl'>Total number of seds members: <span className='font-bold text-2xl ml-3'>{users.find(user => user.cusatian == 'seds') ? users.filter(user => user.cusatian == 'seds').length : 0}</span></p>
        <p className='text-white text-xl'>Total number of non-seds members: <span className='font-bold text-2xl ml-3'>{users.find(user => user.cusatian == 'nonseds') ? users.filter(user => user.cusatian == 'nonseds').length : 0}</span></p>
        <p className='text-white text-xl'>Total number of tshirts: <span className='font-bold text-2xl ml-3'>{users.find(user => user.tshirt == 'yes') ? users.filter(user => user.tshirt == 'yes').length : 0}</span></p>
        <p className='text-white text-xl'>Total Amount received: <span className='font-bold text-2xl ml-3'>{totalPrice}</span></p>
      </div>}
      {usersCopy && usersCopy.map(user => (
        <>
          <div className='my-10 bg-zinc-900 px-10 py-5 rounded-[15px]' key={user.id}>
            <h1 className='text-red-500 text-xl'><span className='font-bold'>Token: </span>{user.token || 'None'}</h1>
            <h1 className='text-white text-xl'><span className='font-bold'>Name: </span>{user.name}</h1>
            <h1 className='text-white text-xl'><span className='font-bold'>Phone: </span>{user.phone}</h1>
            <h1 className='text-white text-xl'><span className='font-bold'>Email: </span>{user.email}</h1>
            <h1 className='text-white text-xl'><span className='font-bold'>Institution: </span>{user.institution}</h1>
            <h1 className='text-white text-xl'><span className='font-bold'>Class/Year: </span>{user.class}</h1>
            <h1 className='text-white text-xl'><span className='font-bold'>Session: </span>{user.session}</h1>
            {user.tshirt == "yes" && <><h1 className='text-white text-xl'><span className='font-bold'>Tshirt size: </span>{user.size}</h1>
            <h1 className='text-white text-xl'><span className='font-bold'>Address: </span>{user.address}</h1></>}
            <h1 className='text-white text-xl'><span className='font-bold'>from CUSAT: </span>{user.cusatian}</h1>
            <img src={user.paymentScreenshot} className='w-[150px]' alt="" />
          </div>
        </>
      ))
      }
    </div>
  )
}

export default Register
