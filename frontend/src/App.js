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
      <h1>TEST123</h1>
      <Error message={msg}>TOIM123 paskaa paskaa</Error>
      <Footer></Footer>
    </div>
  )

}

export default App;
