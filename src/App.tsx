import React from "react";
import SimpleDrawingCanvas from "./components/SimpleDrawingCanvas";

const App: React.FC = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
      }}
    >
      <SimpleDrawingCanvas />
    </div>
  );
};

export default App;
