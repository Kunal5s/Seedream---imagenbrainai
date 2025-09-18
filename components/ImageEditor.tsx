import React, { useState, useCallback, useEffect } from 'react';
import { editImage } from '../services/geminiService';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import UploadIcon from './ui/UploadIcon';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    // Cleanup object URL on component unmount or when image changes
    return () => {
      if (originalImage) {
        URL.revokeObjectURL(originalImage.url);
      }
    };
  }, [originalImage]);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setError(null);
      setOriginalImage({ file, url: URL.createObjectURL(file) });
      setEditedImage(null);
    } else {
      setError('Please upload a valid image file (PNG, JPG, etc.).');
      setOriginalImage(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const removeImage = () => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage.url);
    }
    setOriginalImage(null);
  };

  const handleEdit = async () => {
    if (!prompt || !originalImage) {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(originalImage.file);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const result = await editImage(base64String, originalImage.file.type, prompt);
          setEditedImage(result);
        } catch (err) {
           setError(err instanceof Error ? err.message : 'An unknown error occurred during editing.');
        } finally {
            setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
        setIsLoading(false);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {originalImage ? (
            <div className="relative group bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700 p-4 min-h-[250px] flex items-center justify-center">
              <img src={originalImage.url} alt="Original" className="max-h-64 rounded-lg object-contain" />
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <button onClick={removeImage} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors">
                  Remove Image
                </button>
              </div>
            </div>
          ) : (
            <label htmlFor="image-upload" className={`flex flex-col items-center justify-center text-center bg-gray-900/50 rounded-lg border-2 border-dashed p-4 min-h-[250px] cursor-pointer transition-colors ${isDragging ? 'border-green-400 bg-green-500/20' : 'border-gray-700 hover:border-gray-500'}`}>
              <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="sr-only"/>
              <UploadIcon className="h-12 w-12 text-gray-500 mb-2" />
              <p className="text-gray-400"><span className="font-semibold text-green-300">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP, etc.</p>
              {error && !originalImage && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </label>
          )}
        </div>

        <div className="flex items-center justify-center bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700 p-4 min-h-[250px] lg:min-h-full">
            {isLoading && <Spinner />}
            {error && !isLoading && !(!originalImage) && <p className="text-red-400 text-center">{error}</p>}
            {editedImage && !isLoading && (
              <img src={editedImage} alt="Edited" className="max-h-64 rounded-lg object-contain" />
            )}
            {!isLoading && !error && !editedImage && (
              <p className="text-gray-500">Your edited image will appear here</p>
            )}
             {!isLoading && error && !originalImage && (
              <p className="text-gray-500">Your edited image will appear here</p>
            )}
        </div>
      </div>
       <div>
          <label htmlFor="edit-prompt" className="block text-lg font-medium text-green-300 mb-2">
            How should we change it?
          </label>
          <textarea
            id="edit-prompt"
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
            placeholder="e.g., add a llama next to the main subject"
          />
        </div>
      <Button onClick={handleEdit} disabled={isLoading || !originalImage}>
        {isLoading ? 'Editing...' : 'Edit Image'}
      </Button>
    </div>
  );
};

export default ImageEditor;