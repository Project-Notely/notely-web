import Layout from "@/components/Layout";
import EnhancedCanvasPage from "@/pages/EnhancedCanvasPage";
import Homepage from "@/pages/Homepage";
import SimpleCanvasPage from "@/pages/SimpleCanvasPage";
import TestPage from "@/pages/TestPage";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<TestPage />} />
          <Route path='/simple' element={<SimpleCanvasPage />} />
          <Route path='/enhanced' element={<EnhancedCanvasPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
