import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Download, FileJson, Image } from 'lucide-react';

interface ScreenshotGalleryProps {
  jobId: string;
}

interface Screenshot {
  id: string;
  url: string;
  title: string;
  category: string;
  filename: string;
  timestamp: string;
}

const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ jobId }) => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingData, setGeneratingData] = useState(false);

  useEffect(() => {
    fetchScreenshots();
  }, [jobId]);

  const fetchScreenshots = async () => {
    try {
      const response = await axios.get(`/api/screenshots/list/${jobId}`);
      setScreenshots(response.data);
    } catch (error) {
      toast.error('Failed to load screenshots');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFineTuning = async () => {
    setGeneratingData(true);
    try {
      await axios.post(`/api/screenshots/generate-finetuning/${jobId}`);
      toast.success('Fine-tuning data generated!');
    } catch (error) {
      toast.error('Failed to generate fine-tuning data');
    } finally {
      setGeneratingData(false);
    }
  };

  const handleDownload = () => {
    window.open(`/api/screenshots/download/${jobId}`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-8">Loading screenshots...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Screenshot Gallery</h2>
        <div className="space-x-2">
          <button
            onClick={handleGenerateFineTuning}
            disabled={generatingData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <FileJson className="h-4 w-4 mr-2" />
            {generatingData ? 'Generating...' : 'Generate Fine-tuning Data'}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {screenshots.map((screenshot) => (
          <div key={screenshot.id} className="border rounded-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              <img
                src={`/uploads/${jobId}/${screenshot.filename}`}
                alt={screenshot.title}
                className="object-cover w-full h-48"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {screenshot.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {screenshot.category}
              </p>
              <a
                href={screenshot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 block truncate"
              >
                {screenshot.url}
              </a>
            </div>
          </div>
        ))}
      </div>

      {screenshots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Image className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No screenshots found</p>
        </div>
      )}
    </div>
  );
};

export default ScreenshotGallery;