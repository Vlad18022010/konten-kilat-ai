export interface AnalysisState {
  status: 'idle' | 'uploading' | 'analyzing_image' | 'generating_copy' | 'complete' | 'error';
  imageSrc: string | null;
  imageDescription: string | null;
  finalCopy: string | null;
  error: string | null;
}

export interface KolosalConfig {
  apiKey: string;
}

declare global {
  interface Window {
    marked: {
      parse: (text: string) => string;
    };
  }
}