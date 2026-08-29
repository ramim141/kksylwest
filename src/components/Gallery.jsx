import React from 'react';
import GalleryHero from './gallery/GalleryHero';
import GalleryGrid from './gallery/GalleryGrid';

const Gallery = () => {
  return (
    <div className="min-h-screen animate-fade-in">
      <GalleryHero />
      <GalleryGrid />
    </div>
  );
};

export default Gallery;
