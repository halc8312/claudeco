import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface ProgressDisplayProps {
  jobId: string;
  onComplete?: () => void;
}

interface CollectionStatus {
  jobId: string;
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
  screenshots: any[];
}

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ jobId, onComplete }) => {
  const [status, setStatus] = useState<CollectionStatus | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on(`job-status-${jobId}`, (newStatus: CollectionStatus) => {
      setStatus(newStatus);
      if (!newStatus.inProgress && onComplete) {
        onComplete();
      }
    });

    return () => {
      newSocket.close();
    };
  }, [jobId, onComplete]);

  if (!status) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading status...</span>
        </div>
      </div>
    );
  }

  const progressPercentage = status.total > 0
    ? ((status.completed + status.failed) / status.total) * 100
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Collection Progress</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {status.completed + status.failed} / {status.total}
            </span>
            <span className="text-sm text-gray-500">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{status.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{status.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{status.failed}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          {status.inProgress ? (
            <>
              <Loader className="h-5 w-5 animate-spin text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Collection in progress...</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">Collection complete!</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressDisplay;