// Purpose: Ecology page component to display species (flora, fauna) from the conservation area with images and detailed information

import React, { useState, useRef, useEffect } from 'react';
import ecologyData from '../data/ecologydata.json';
import { IoVolumeHigh, IoVolumeOff } from 'react-icons/io5';

const Ecology = () => {
  const [selectedItem, setSelectedItem] = useState(null); 
  const [habitatFilter, setHabitatFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const speechSynthesisRef = useRef(null);
  const textRef = useRef("");

  useEffect(() => {
    const loadVoices = () => {
      const voicesList = window.speechSynthesis.getVoices();
      setVoices(voicesList);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Handle text-to-speech
  const handleTextToSpeech = () => {
    if (speechSynthesisRef.current && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (speechSynthesisRef.current && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      textRef.current = `
        Welcome to the Ecology Explorer! Discover wildlife in saltwater, freshwater, and terrestrial habitats 
        of St. Margaret's Bay. Use filters to explore by habitat or species type. 
        Click any species card to learn more.
      `;
      const utterance = new SpeechSynthesisUtterance(textRef.current);
      
      // Select a soft female voice
      const selectedVoice = voices.find(voice => voice.name.includes("Female") && voice.lang === "en-US");
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Adjust pitch and rate for a softer tone
      utterance.pitch = 1.4; // Slightly higher pitch
      utterance.rate = 0.9; // Slightly slower rate

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      utterance.onend = () => {
        speechSynthesisRef.current = null;
        setIsPaused(false);
      };
    }
  };

  // Function to close the modal by resetting the selected item to null
  const closeModal = () => setSelectedItem(null);

  // Get all species from all habitats
  // Function to get the image path for a species
  const getSpeciesImage = (commonName) => {
    if (!commonName) return null;
    
    // Create filename from common name
    // Remove parentheses, replace forward slashes and spaces with underscores
    const filename = commonName
      .replace(/[()]/g, '') // Remove parentheses
      .replace(/\//g, '_') // Replace forward slashes with underscores
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .trim() + '.jpg';
    
    try {
      // Dynamically import the image
      return `/src/assets/ecologyimages/${filename}`;
    } catch (error) {
      console.log(`Image not found for: ${commonName}`);
      return null;
    }
  };

  const getAllSpecies = () => {
    const allSpecies = [];
    
    Object.keys(ecologyData.species_by_habitat).forEach(habitat => {
      const habitatData = ecologyData.species_by_habitat[habitat];
      
      if (habitatData.flora && habitatData.flora.length > 0) {
        habitatData.flora.forEach(species => {
          allSpecies.push({ ...species, type: 'Flora', habitat });
        });
      }
      
      if (habitatData.fauna && habitatData.fauna.length > 0) {
        habitatData.fauna.forEach(species => {
          allSpecies.push({ ...species, type: 'Fauna', habitat });
        });
      }
    });
    
    return allSpecies;
  };

  const allSpecies = getAllSpecies();

  // Filter species based on selected filters
  const filteredData = allSpecies.filter(item => {
    const matchesHabitat = habitatFilter === 'All' || item.habitat === habitatFilter;
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    return matchesHabitat && matchesType;
  }).sort((a, b) => {
    // Sort by conservation score (lower scores first - most at-risk species at top)
    return a.conservation_score - b.conservation_score;
  });

  // Function to get conservation color based on score
  const getConservationColor = (score) => {
    if (score <= 3) return 'bg-red-600'; // Critically at risk
    if (score <= 5) return 'bg-orange-500'; // Threatened
    if (score <= 7) return 'bg-yellow-500'; // Managed
    return 'bg-blue-500'; // Abundant
  };

  // Function to check if species needs an alert label
  const getAlertLabel = (item) => {
    const category = item.category?.toLowerCase() || '';
    const commonName = item.common_name?.toLowerCase() || '';
    
    // Check for invasive species
    if (category.includes('invasive') || category.includes('at risk - invasive')) {
      return { type: 'invasive', text: 'INVASIVE', color: 'bg-red-600' };
    }
    
    // Check for health concerns
    if (category.includes('health concern') || category.includes('disease vector')) {
      return { type: 'health', text: 'HEALTH RISK', color: 'bg-red-600' };
    }
    
    // Check for specific harmful species
    if (commonName.includes('tick') || commonName.includes('green crab')) {
      return { type: 'harmful', text: 'HARMFUL', color: 'bg-red-600' };
    }
    
    return null;
  };

  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Header Section with Audio */}
      <div className="flex items-center justify-center w-full mb-6">
        <h1 className="text-4xl font-bold text-center flex-1 text-gray-900 dark:text-gray-100">
          Species You May Encounter in the Conservation Area
        </h1>
        <button
          onClick={handleTextToSpeech}
          className="ml-4 bg-yellow-400 text-gray-900 dark:bg-yellow-500 dark:text-gray-100 rounded-full p-3 focus:outline-none"
        >
          {speechSynthesisRef.current && !isPaused ? (
            <IoVolumeOff className="text-2xl" />
          ) : (
            <IoVolumeHigh className="text-2xl" />
          )}
        </button>
      </div>
      
      <p className="text-center text-lg mb-8 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
        Explore the diverse wildlife of St. Margaret's Bay! Click on any species to learn more about their habitat, identification tips, and conservation status.
      </p>

      {/* Combined Filter System */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mx-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Habitat Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Habitat
            </label>
            <div className="flex flex-wrap gap-2">
              {['All', 'saltwater', 'freshwater', 'terrestrial'].map((habitat) => (
                <button
                  key={habitat}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    habitatFilter === habitat
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setHabitatFilter(habitat)}
                >
                  {habitat === 'All' ? 'All' : habitat.charAt(0).toUpperCase() + habitat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Flora', 'Fauna'].map((type) => (
                <button
                  key={type}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    typeFilter === type
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setTypeFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex-shrink-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredData.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                of {allSpecies.length} species
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Interactive Grid for displaying species */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item, index) => {
          const imagePath = getSpeciesImage(item.common_name);
          
          return (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105 bg-white dark:bg-gray-800"
              onClick={() => setSelectedItem(item)}
            >
              {/* Image Container */}
              <div className="h-64 relative overflow-hidden">
                {imagePath ? (
                  <>
                    <img 
                      src={imagePath} 
                      alt={item.common_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gradient if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    {/* Fallback gradient (hidden by default) */}
                    <div className="hidden absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 dark:from-green-600 dark:to-blue-700"></div>
                  </>
                ) : (
                  /* Gradient fallback for species without images */
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 dark:from-green-600 dark:to-blue-700"></div>
                )}
                
                {/* Overlay with gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                
                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  {/* Alert Labels and Conservation Status Badge */}
                  <div className="flex justify-between items-start z-10">
                    {/* Alert Label */}
                    {getAlertLabel(item) && (
                      <div className={`${getAlertLabel(item).color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse`}>
                        {getAlertLabel(item).text}
                      </div>
                    )}
                    
                    {/* Conservation Status Badge */}
                    <div className={`${getConservationColor(item.conservation_score)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                      Score: {item.conservation_score}/10
                    </div>
                  </div>
                  
                  {/* Main content area */}
                  <div className="text-center text-white z-10">
                    <h3 className="text-2xl font-bold drop-shadow-lg mb-2">{item.common_name}</h3>
                    <p className="text-sm italic drop-shadow-md">{item.scientific_name}</p>
                  </div>
                  
                  {/* Bottom info section */}
                  <div className="space-y-2 z-10">
                    <p className="text-sm text-white drop-shadow-md">{item.type} • {item.habitat}</p>
                    <p className="text-xs text-gray-200 drop-shadow-md">{item.category}</p>
                    
                    {/* Population trend tag */}
                    <div className="flex justify-center">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/30">
                        Population: {item.population_trend}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for displaying the selected species details */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 z-10"
              onClick={closeModal}
            >
              ✕
            </button>
            
            {/* Modal Image/Header */}
            <div className="relative w-full h-48 rounded-lg mb-4 overflow-hidden">
              {getSpeciesImage(selectedItem.common_name) ? (
                <>
                  <img 
                    src={getSpeciesImage(selectedItem.common_name)} 
                    alt={selectedItem.common_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback gradient */}
                  <div className="hidden absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 dark:from-green-600 dark:to-blue-700"></div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 dark:from-green-600 dark:to-blue-700"></div>
              )}
              
              {/* Overlay for text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <h2 className="text-3xl font-bold drop-shadow-lg">{selectedItem.common_name}</h2>
                  <p className="text-lg italic mt-2 drop-shadow-md">{selectedItem.scientific_name}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Alert Warning */}
              {getAlertLabel(selectedItem) && (
                <div className={`${getAlertLabel(selectedItem).color} text-white p-3 rounded-lg text-center font-bold`}>
                  ⚠️ {getAlertLabel(selectedItem).text} - {getAlertLabel(selectedItem).type === 'invasive' ? 'Non-native species causing ecosystem damage' : 
                  getAlertLabel(selectedItem).type === 'health' ? 'Can carry diseases or cause health issues' : 
                  'Potentially harmful to native species or humans'}
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Classification</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Type:</span> {selectedItem.type} • 
                  <span className="font-medium"> Habitat:</span> {selectedItem.habitat}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Category:</span> {selectedItem.category}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Identification</h3>
                <p className="text-gray-700 dark:text-gray-300">{selectedItem.identification}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Educational Value</h3>
                <p className="text-gray-700 dark:text-gray-300">{selectedItem.educational_value}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conservation Status</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">IUCN Status:</span> {selectedItem.iucn_status}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Population Trend:</span> {selectedItem.population_trend}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Conservation Score:</span> {selectedItem.conservation_score}/10
                </p>
              </div>

              {selectedItem.conservation_notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conservation Notes</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedItem.conservation_notes}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Taxonomy</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kingdom: {selectedItem.taxonomy.kingdom} • 
                  Phylum: {selectedItem.taxonomy.phylum} • 
                  {selectedItem.taxonomy.class && `Class: ${selectedItem.taxonomy.class} • `}
                  Family: {selectedItem.taxonomy.family}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ecology;

