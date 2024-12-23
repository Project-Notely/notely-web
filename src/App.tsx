
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Editor from "./pages/Editor";
import Home from "./pages/Home";
import Login from "./pages/Login";

import React from 'react'

export default () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </>
  )
}
