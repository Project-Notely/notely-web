import React from "react";
import { Link } from "react-router-dom";

const Homepage: React.FC = () => {
  return (
    <div className='py-12'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-800 mb-4'>
            Welcome to Notely Drawing Canvas
          </h1>
          <p className='text-xl text-gray-600'>
            Choose your drawing experience
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
          {/* Simple Canvas Card */}
          <Link
            to='/simple'
            className='bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 group'
          >
            <div className='text-center'>
              <div className='text-4xl mb-4'>🎨</div>
              <h2 className='text-2xl font-semibold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors'>
                Simple Canvas
              </h2>
              <p className='text-gray-600 mb-6'>
                Basic drawing functionality with stroke collection and auto-save
                features. Perfect for quick sketches and notes.
              </p>
              <div className='inline-flex items-center text-blue-600 font-medium'>
                Start Drawing
                <svg
                  className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </div>
            </div>
          </Link>

          {/* Enhanced Canvas Card */}
          <Link
            to='/enhanced'
            className='bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 group'
          >
            <div className='text-center'>
              <div className='text-4xl mb-4'>🚀</div>
              <h2 className='text-2xl font-semibold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors'>
                Enhanced Canvas
              </h2>
              <p className='text-gray-600 mb-6'>
                Advanced drawing canvas with custom hooks, better UI, and
                comprehensive features. Built for professional use.
              </p>
              <div className='inline-flex items-center text-blue-600 font-medium'>
                Try Enhanced
                <svg
                  className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
