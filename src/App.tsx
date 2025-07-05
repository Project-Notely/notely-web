import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-900 dark:to-gray-800'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Logo Section */}
          <div className='flex justify-center items-center gap-8 mb-12'>
            <a
              href='https://vite.dev'
              target='_blank'
              rel='noopener noreferrer'
              className='group transition-transform hover:scale-110'
            >
              <img
                src={viteLogo}
                className='h-20 w-20 drop-shadow-lg transition-all duration-300 group-hover:drop-shadow-2xl group-hover:brightness-110'
                alt='Vite logo'
              />
            </a>
            <div className='text-4xl text-secondary-400'>+</div>
            <a
              href='https://react.dev'
              target='_blank'
              rel='noopener noreferrer'
              className='group transition-transform hover:scale-110'
            >
              <img
                src={reactLogo}
                className='h-20 w-20 drop-shadow-lg transition-all duration-300 group-hover:drop-shadow-2xl group-hover:brightness-110 group-hover:animate-spin'
                alt='React logo'
              />
            </a>
          </div>

          {/* Title */}
          <h1 className='text-6xl font-bold mb-8 text-balance'>
            <span className='bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent'>
              Notely Web
            </span>
          </h1>

          <p className='text-xl text-secondary-600 dark:text-secondary-400 mb-12 text-pretty max-w-2xl mx-auto'>
            A modern React application built with TypeScript, Vite, Tailwind
            CSS, and Bun
          </p>

          {/* Interactive Card */}
          <div className='card max-w-md mx-auto mb-12 animate-fade-in'>
            <h2 className='text-2xl font-semibold mb-6 text-secondary-900 dark:text-secondary-100'>
              Counter Demo
            </h2>

            <div className='space-y-6'>
              <div className='text-4xl font-bold text-primary-600 dark:text-primary-400'>
                {count}
              </div>

              <div className='flex gap-3 justify-center'>
                <button
                  onClick={() => setCount(count => count - 1)}
                  className='btn-secondary'
                >
                  Decrease
                </button>
                <button
                  onClick={() => setCount(count => count + 1)}
                  className='btn-primary'
                >
                  Increase
                </button>
              </div>

              <button onClick={() => setCount(0)} className='btn-ghost'>
                Reset
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className='grid md:grid-cols-3 gap-6 mb-12'>
            <div className='card'>
              <div className='text-2xl mb-4'>🚀</div>
              <h3 className='text-lg font-semibold mb-2'>Bun Runtime</h3>
              <p className='text-sm text-secondary-600 dark:text-secondary-400'>
                Lightning-fast JavaScript runtime for optimal performance
              </p>
            </div>

            <div className='card'>
              <div className='text-2xl mb-4'>🎨</div>
              <h3 className='text-lg font-semibold mb-2'>Tailwind CSS</h3>
              <p className='text-sm text-secondary-600 dark:text-secondary-400'>
                Utility-first CSS framework for rapid UI development
              </p>
            </div>

            <div className='card'>
              <div className='text-2xl mb-4'>⚡</div>
              <h3 className='text-lg font-semibold mb-2'>Vite + React</h3>
              <p className='text-sm text-secondary-600 dark:text-secondary-400'>
                Modern build tool with React 19 and TypeScript
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className='text-secondary-500 dark:text-secondary-400'>
            <p className='mb-4'>
              Edit{" "}
              <code className='bg-secondary-200 dark:bg-secondary-800 px-2 py-1 rounded font-mono text-sm'>
                src/App.tsx
              </code>{" "}
              and save to test HMR
            </p>
            <p>
              Click on the logos to learn more about{" "}
              <a
                href='https://vite.dev'
                target='_blank'
                rel='noopener noreferrer'
              >
                Vite
              </a>{" "}
              and{" "}
              <a
                href='https://react.dev'
                target='_blank'
                rel='noopener noreferrer'
              >
                React
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
