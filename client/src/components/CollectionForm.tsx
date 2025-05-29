import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Play, Key, Globe } from 'lucide-react';

interface CollectionFormProps {
  onJobStart: (jobId: string) => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({ onJobStart }) => {
  const [count, setCount] = useState(10);
  const [apiKey, setApiKey] = useState('');
  const [customUrls, setCustomUrls] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const urls = customUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const response = await axios.post('/api/screenshots/collect', {
        count,
        apiKey: apiKey || undefined,
        urls: urls.length > 0 ? urls : undefined
      });

      toast.success('Collection started!');
      onJobStart(response.data.jobId);
    } catch (error) {
      toast.error('Failed to start collection');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Start New Collection</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Screenshots
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Key className="inline h-4 w-4 mr-1" />
            Screenshot API Key (Optional)
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Leave empty for placeholder images"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get free API key from screenshotlayer.com
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Globe className="inline h-4 w-4 mr-1" />
            Custom URLs (Optional)
          </label>
          <textarea
            value={customUrls}
            onChange={(e) => setCustomUrls(e.target.value)}
            placeholder="https://example.com\nhttps://another-site.com"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            One URL per line. Leave empty to use default URLs.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4 mr-2" />
          {loading ? 'Starting...' : 'Start Collection'}
        </button>
      </form>
    </div>
  );
};

export default CollectionForm;