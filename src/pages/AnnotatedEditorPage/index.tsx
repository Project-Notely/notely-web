import TLDrawAnnotatedEditor from "@/components/AnnotatedTextEditior";
import React from "react";

const AnnotatedEditorPage: React.FC = () => {
  const handleSave = (data: { content: unknown; drawing: unknown }) => {
    console.log("💾 [SAVE] Document saved:", data);
    // TODO: Implement actual save functionality
  };

  return (
    <div className='flex justify-center'>
      <div className='w-full'>
        <TLDrawAnnotatedEditor
          className='w-full'
          initialMode='text'
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default AnnotatedEditorPage;
