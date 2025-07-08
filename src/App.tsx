import Layout from "@/components/Layout";
import EnhancedCanvasPage from "@/pages/EnhancedCanvasPage";
import SimpleCanvasPage from "@/pages/SimpleCanvasPage";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<EnhancedCanvasPage />} />
          <Route path='/simple' element={<SimpleCanvasPage />} />
          <Route path='/enhanced' element={<EnhancedCanvasPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
