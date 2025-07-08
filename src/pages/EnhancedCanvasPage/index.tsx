import EnhancedDrawingCanvas from "@/components/EnhancedDrawingCanvas";
import React from "react";

const EnhancedCanvasPage: React.FC = () => {
  const handleSaveSuccess = (drawingId: string) => {
    console.log("Drawing saved successfully with ID:", drawingId);
  };

  const handleError = (error: string) => {
    console.error("Drawing canvas error:", error);
  };

  return (
    <div className='py-6'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='text-center mb-6'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            🎨 Enhanced Drawing Canvas
          </h1>
          <p className='text-gray-600 text-lg'>
            Advanced drawing canvas with custom hook, better UI, and
            comprehensive features
          </p>
        </div>

        <div className='flex justify-center'>
          <EnhancedDrawingCanvas
            width={800}
            height={600}
            backgroundColor='#ffffff'
            autoSaveEnabled={true}
            autoSaveInterval={5000}
            maxStrokesBeforeAutoSave={3}
            userId='demo_user'
            onSaveSuccess={handleSaveSuccess}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedCanvasPage;
