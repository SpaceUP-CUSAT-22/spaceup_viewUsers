import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Tshirt from './pages/Tshirt';
import Register from './pages/Register';
import Volunteer from './pages/Volunteer';

function App() {
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/tshirt" element={<Tshirt />} />
          <Route path="/" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/volunteer" element={<Volunteer />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
