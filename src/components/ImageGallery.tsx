import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images?: string[];
}

export default function ImageGallery({ images = [] }: ImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % displayImages.length);
  };

  const previousImage = () => {
    setCurrentImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Ensure we have at least one image
  const displayImages = images?.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'];

  return (
    <div className="relative">
      {/* Main image */}
      <div className="aspect-[4/3] relative overflow-hidden rounded-lg">
        <img
          src={displayImages[currentImage]}
          alt="Photo de l'annonce"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback image if the current one fails to load
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
          }}
        />
        
        {/* Navigation */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg text-gray-800 transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg text-gray-800 transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Position indicator */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImage ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-none w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentImage ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img
                src={image}
                alt={`Miniature ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}