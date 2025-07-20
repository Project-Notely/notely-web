import TLDrawAnnotatedEditor from "@/components/TLDrawAnnotatedEditor";
import React from "react";

const AnnotatedEditorPage: React.FC = () => {
  const handleSave = (data: { content: any; drawing: any }) => {
    console.log("💾 [SAVE] Document saved:", data);
    // TODO: Implement actual save functionality
  };

  return (
    <div className='py-6'>
      <div className='max-w-4xl mx-auto px-4'>
        <div className='text-center mb-6'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            📝🎨 Annotated Text Editor
          </h1>
          <p className='text-gray-600 text-lg'>
            Draw on top of your text with TLDraw
          </p>
        </div>

        {/* Main Editor Component */}
        <div className='flex justify-center'>
          <div className='w-full'>
            <TLDrawAnnotatedEditor
              className='w-full'
              initialMode='text'
              onSave={handleSave}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className='mt-6 bg-blue-50 rounded-lg p-4'>
          <h3 className='font-semibold text-blue-800 mb-2'>🎯 How to Use</h3>
          <ul className='text-blue-700 space-y-1 text-sm'>
            <li>
              • <strong>One Screen</strong>: Text editor and drawing canvas are
              always present
            </li>
            <li>
              • <strong>Text Tool</strong>: Click and type in the text editor
              (drawing canvas transparent)
            </li>
            <li>
              • <strong>Draw Tool</strong>: Click and draw on the transparent
              canvas over your text
            </li>
            <li>
              • <strong>Switch Tools</strong>: Use toggle buttons to switch
              between typing and drawing
            </li>
            <li>• Both layers work simultaneously - no separate modes!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnnotatedEditorPage;
