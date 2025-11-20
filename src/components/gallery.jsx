// Purpose: To display the Gallery page with user-uploaded photos and image upload functionality 

import React, { useState, useRef, useEffect } from 'react';
import Footer from './Footer';

const glassPanel =
  "rounded-3xl border border-white/40 bg-white/60 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-2xl transition-colors duration-300 dark:border-slate-700/60 dark:bg-slate-900/55";

// Import images from the assets folder (replace with your actual paths)
import image1 from '../assets/download-1.jpg';
import image2 from '../assets/download-2.jpg';
import image3 from '../assets/download-3.jpg';
import image4 from '../assets/download-7.jpg';
import image5 from '../assets/download-8.jpg';
import image6 from '../assets/download-9.jpg';
import image7 from '../assets/download-10.jpg';
import image8 from '../assets/download-11.jpg';
import image9 from '../assets/images-1.jpg';

const Gallery = () => {

  const [images, setImages] = useState([
    { src: image1, name: 'Image 1' },
    { src: image2, name: 'Image 2' },
    { src: image3, name: 'Image 3' },
    { src: image4, name: 'Image 4' },
    { src: image5, name: 'Image 5' },
    { src: image6, name: 'Image 6' },
    { src: image7, name: 'Image 7' },
    { src: image8, name: 'Image 8' },
    { src: image9, name: 'Image 9' },
  ]);

  // Function to handle image upload
  const handleImageUpload = (event) => {
    const files = event.target.files; // Get the uploaded files
    const uploadedImages = Array.from(files).map((file) => {
      // Use FileReader to read the file as a data URL
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        reader.onload = () => resolve({ src: reader.result, name: file.name });
      });
    });

    // Add the uploaded images to the state
    Promise.all(uploadedImages).then((newImages) => {
      setImages((prevImages) => [...prevImages, ...newImages]);
    });
  };

  return (
    <div className="flex flex-col gap-8 text-slate-800 dark:text-slate-100">
      <header className={`${glassPanel} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}>
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">
            Enchanting Forest Gallery
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Discover the breathtaking beauty of forests and serene landscapes. Feel free to add your favorite photos to enrich this gallery!
          </p>
        </div>
      </header>

      {/* Gallery Grid */}
      <section className={`${glassPanel} p-6`}>
        <div
          id="gallery"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
        {images.map((img, index) => (
          <div
            key={index}
            className="relative group overflow-hidden rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
          >
            {/* Image */}
            <img
              src={img.src}
              alt={img.name}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Overlay with name */}
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <p className="text-white text-lg font-semibold">{img.name}</p>
            </div>
          </div>
        ))}
        </div>
      </section>

      {/* Drag-and-Drop Upload Section */}
      <section className={`${glassPanel} p-6`}>
        <div
          className="text-center border-2 border-dashed border-white/60 dark:border-slate-700/60 p-6 rounded-2xl bg-white/40 dark:bg-slate-900/40 transition-all duration-300 hover:shadow-lg"
        >
        <p className="text-gray-700 dark:text-gray-300">
          Drag and drop images here or click below to upload
        </p>
        <label className="block mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-transform duration-300 hover:scale-105">
          Upload Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </label>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Gallery;
