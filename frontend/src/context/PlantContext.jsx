import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const PlantContext = createContext();

export const PlantProvider = ({ children }) => {
  const [plants, setPlants] = useState([]);
  const [activePlant, setActivePlant] = useState(null);
  const [loading, setLoading] = useState(true);

  // For this prototype, we'll fetch dummy plants or from an API if it existed.
  // Since we didn't build a dedicated Plant controller yet (just the model), 
  // we'll mock the plants for the frontend until it's fully integrated.
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        // Mock data for the context
        const mockPlants = [
          { _id: 'plant1', name: 'Berlin Assembly Plant', plantId: 'P-BER-01' },
          { _id: 'plant2', name: 'Munich Foundry', plantId: 'P-MUN-02' }
        ];
        
        setPlants(mockPlants);
        // Load saved preference or default to first
        const savedPlantId = localStorage.getItem('activePlantId');
        if (savedPlantId) {
            const savedPlant = mockPlants.find(p => p._id === savedPlantId);
            if (savedPlant) setActivePlant(savedPlant);
            else setActivePlant(mockPlants[0]);
        } else {
            setActivePlant(mockPlants[0]);
        }
      } catch (error) {
        console.error('Error fetching plants:', error);
        toast.error('Failed to load plants');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const changeActivePlant = (plantId) => {
    const plant = plants.find(p => p._id === plantId);
    if (plant) {
        setActivePlant(plant);
        localStorage.setItem('activePlantId', plantId);
        toast.info(`Switched to ${plant.name}`);
    }
  };

  return (
    <PlantContext.Provider value={{ plants, activePlant, changeActivePlant, loading }}>
      {children}
    </PlantContext.Provider>
  );
};
