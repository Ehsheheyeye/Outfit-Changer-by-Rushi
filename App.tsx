
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { PersonIcon } from './components/icons/PersonIcon';
import { OutfitIcon } from './components/icons/OutfitIcon';
import { virtualTryOn } from './services/geminiService';
import type { ImageData } from './types';

const App: React.FC = () => {
  const [userImage, setUserImage] = useState<ImageData | null>(null);
  const [outfitImage, setOutfitImage] = useState<ImageData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleUserImageUpload = useCallback((imageData: ImageData) => {
    setUserImage(imageData);
  }, []);

  const handleOutfitImageUpload = useCallback((imageData: ImageData) => {
    setOutfitImage(imageData);
  }, []);

  const handleTryOn = async () => {
    if (!userImage || !outfitImage) {
      setError("Please upload both your photo and an outfit photo.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultImage = await virtualTryOn(userImage, outfitImage);
      setGeneratedImage(resultImage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate image. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const canTryOn = userImage && outfitImage && !isLoading;

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploader
                id="user-image"
                onImageUpload={handleUserImageUpload}
                title="Your Photo"
                description="Upload a clear, full-body photo of yourself."
                icon={<PersonIcon className="w-12 h-12 text-slate-400" />}
              />
              <ImageUploader
                id="outfit-image"
                onImageUpload={handleOutfitImageUpload}
                title="Outfit Photo"
                description="Upload a photo of the clothing item or outfit."
                icon={<OutfitIcon className="w-12 h-12 text-slate-400" />}
              />
            </div>
            <button
              onClick={handleTryOn}
              disabled={!canTryOn}
              className="w-full py-4 px-6 text-lg font-semibold rounded-lg transition-all duration-300 ease-in-out bg-indigo-600 text-white disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed hover:enabled:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isLoading ? 'Generating...' : 'Virtual Try-On'}
            </button>
          </div>

          {/* Right Column: Result */}
          <div className="bg-slate-800/50 rounded-lg p-4 min-h-[300px] lg:min-h-0 flex items-center justify-center">
            <ResultDisplay
              isLoading={isLoading}
              error={error}
              generatedImage={generatedImage}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
