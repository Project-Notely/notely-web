import SimpleDrawingCanvas from "@/components/SimpleDrawingCanvas";
import React from "react";

const SimpleCanvasPage: React.FC = () => {
  return (
    <div className='h-full w-full'>
      <SimpleDrawingCanvas />
    </div>
  );
};

export default SimpleCanvasPage;
