import SimpleDrawingCanvas from "@/components/SimpleDrawingCanvas";
import React from "react";

const SimpleCanvasPage: React.FC = () => {
  return (
    <div className='py-6'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='text-center mb-6'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            🎨 Simple Drawing Canvas
          </h1>
          <p className='text-gray-600 text-lg'>
            Basic drawing functionality with stroke collection and auto-save
          </p>
        </div>

        <div className='flex justify-center'>
          <SimpleDrawingCanvas />
        </div>
      </div>
    </div>
  );
};

export default SimpleCanvasPage;
