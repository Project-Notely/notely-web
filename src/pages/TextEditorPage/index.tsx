import TextEditor from "@/components/TextEditor";
import React from "react";

const TextEditorPage: React.FC = () => {
  return (
    <div className='py-6'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='text-center mb-6'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            📝 Text Editor
          </h1>
          <p className='text-gray-600 text-lg'>
            Rich text editor powered by Tiptap with advanced formatting options
          </p>
        </div>

        <div className='flex justify-center'>
          <div className='w-full max-w-4xl'>
            <div className='bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden'>
              <TextEditor className='min-h-[500px]' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditorPage;
