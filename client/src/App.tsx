import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CollectionForm from './components/CollectionForm';
import ProgressDisplay from './components/ProgressDisplay';
import ScreenshotGallery from './components/ScreenshotGallery';
import { Camera } from 'lucide-react';

function App() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  const handleJobStart = (jobId: string) => {
    setActiveJobId(jobId);
    setShowGallery(false);
  };

  const handleCollectionComplete = () => {
    setShowGallery(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Web Screenshot Collector for GPT-4o Vision
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <CollectionForm onJobStart={handleJobStart} />
          </div>
          
          <div>
            {activeJobId && (
              <ProgressDisplay
                jobId={activeJobId}
                onComplete={handleCollectionComplete}
              />
            )}
          </div>
        </div>

        {showGallery && activeJobId && (
          <div className="mt-8">
            <ScreenshotGallery jobId={activeJobId} />
          </div>
        )}
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;