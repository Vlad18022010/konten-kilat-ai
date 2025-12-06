import React, { ChangeEvent } from 'react';

interface ImageUploaderProps {
  imageSrc: string | null;
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ imageSrc, onImageSelected, isLoading }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${imageSrc ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
        
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt="Preview" 
            className="h-full w-full object-contain rounded-xl p-2" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Klik untuk unggah</span> atau seret gambar</p>
            <p className="text-xs text-gray-500">PNG, JPG atau WEBP</p>
          </div>
        )}
        
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
};