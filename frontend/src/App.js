import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Footer from './components/Footer'
import Error from './components/Error'
import CourseTable from './components/CourseTable'
import CourseView from './components/CourseView'
import courseService from './services/courseService'
import channelService from "./services/channelService"
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

const App = () => {
  const params = new URLSearchParams(document.location.search);
  const msg = params.get("msg");
  const [courses, setCourses] = useState([]);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    courseService.getAll()
    .then(response => {
      setCourses(response)
    });
  }, []);

  useEffect(() => {
    channelService.getAll()
    .then(response => {
      setChannels(response)
    });
  }, []);

  return (
    <div>
      <h1>TEST123</h1>
      <Routes>
        <Route path='/courses/:id' element={ <CourseView courses={ courses } channels={ channels } /> } />
        <Route path= '/' element={ <CourseTable courses={ courses } /> } />
      </Routes>
      <Footer></Footer>
    </div>
  );
}

export default App;
