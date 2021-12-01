import React from 'react'
import axios from 'axios'
import Footer from './components/Footer'
import Error from './components/Error' 
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom'

const App = () => {
  const params = new URLSearchParams(document.location.search);
  const msg = params.get("msg");
  return (
    <div>
      <Error message={msg}></Error>
      <Footer></Footer>
    </div>
  )
    
}

export default App;
