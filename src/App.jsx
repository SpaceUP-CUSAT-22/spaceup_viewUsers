import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Tshirt from './pages/Tshirt';
import Register from './pages/Register';

function App() {
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/tshirt" element={<Tshirt />} />
          <Route path="/" element={<Register />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
