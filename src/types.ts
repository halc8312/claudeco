export interface ScreenshotMetadata {
  id: string;
  url: string;
  title: string;
  description?: string;
  timestamp: string;
  category: string;
  viewport: {
    width: number;
    height: number;
  };
  screenshot: {
    filename: string;
    width: number;
    height: number;
    fileSize: number;
  };
  elements?: {
    buttons: number;
    links: number;
    forms: number;
    images: number;
    inputs: number;
  };
  error?: string;
}

export interface CollectionProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
}

export interface WebAction {
  type: 'click' | 'type' | 'scroll' | 'hover' | 'select';
  selector?: string;
  value?: string;
  coordinates?: { x: number; y: number };
  description: string;
}