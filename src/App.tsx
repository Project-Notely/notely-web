import React, { useEffect } from "react";
import DrawingCanvas from "./components/DrawingCanvas";
import { useDrawingStore } from "@/store/drawingStore";

const App: React.FC = () => {
  const { fetchRecentDrawings } = useDrawingStore();

  // Load recent drawings on app start
  useEffect(() => {
    fetchRecentDrawings().catch(console.error);
  }, [fetchRecentDrawings]);

  return (
    <div className="app">
      <DrawingCanvas />
    </div>
  );
};

export default App;
