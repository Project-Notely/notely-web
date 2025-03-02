import React from 'react';
import DrawingCanvas from './components/DrawingCanvas';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen">
      <DrawingCanvas />
    </div>
  );
};

export default App;
