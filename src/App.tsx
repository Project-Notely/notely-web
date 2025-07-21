import Layout from "@/components/Layout";
import AnnotatedEditorPage from "@/pages/AnnotatedEditorPage";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<AnnotatedEditorPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
