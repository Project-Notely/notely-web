
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import PrivateRoute from "./components/privateRoute";
import Editor from "./pages/Editor";
import Home from "./pages/Home";
import Login from "./pages/Login";

import React from 'react'

export default () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/editor" element={<PrivateRoute><Editor /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
