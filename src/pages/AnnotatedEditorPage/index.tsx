import AnnotatedTextEditor from "@/components/AnnotatedTextEditor";
import React from "react";

const AnnotatedEditorPage: React.FC = () => {
  const handleSave = (data: { content: unknown; drawing: unknown }) => {
    // TODO: Implement actual save functionality to backend
    console.log("Document saved:", data);
  };

  return (
    <div className='flex justify-center min-h-screen bg-gray-50 py-8'>
      <div className='w-full max-w-6xl px-4'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            📝 Annotated Editor
          </h1>
          <p className='text-gray-600 text-lg'>
            Write text and draw annotations on the same canvas
          </p>
        </div>

        <AnnotatedTextEditor
          className='w-full'
          initialMode='text'
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default AnnotatedEditorPage;
