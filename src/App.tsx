import Layout from "@/components/Layout";
import AnnotatedEditorPage from "@/pages/AnnotatedEditorPage";
import EnhancedCanvasPage from "@/pages/EnhancedCanvasPage";
import SimpleCanvasPage from "@/pages/SimpleCanvasPage";
import TextEditorPage from "@/pages/TextEditorPage";
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
          <Route path='/editor' element={<TextEditorPage />} />
          <Route path='/annotated' element={<AnnotatedEditorPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
