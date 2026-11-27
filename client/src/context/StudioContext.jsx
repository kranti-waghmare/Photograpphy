import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const StudioContext = createContext(null);

export function StudioProvider({ children }) {
  const [photographers, setPhotographers] = useState([]);
  const [loadingPhotographers, setLoadingPhotographers] = useState(true);
  const [selectedPhotographerSlug, setSelectedPhotographerSlug] = useState('elena-vance');
  const [activeBooking, setActiveBooking] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const refreshPhotographers = useCallback(async () => {
    try {
      setLoadingPhotographers(true);
      const data = await api.getPhotographers();
      setPhotographers(data.photographers || []);
      if (data.photographers?.length && !selectedPhotographerSlug) {
        setSelectedPhotographerSlug(data.photographers[0].slug);
      }
    } catch (err) {
      console.error('Failed to load photographers', err);
    } finally {
      setLoadingPhotographers(false);
    }
  }, [selectedPhotographerSlug]);

  useEffect(() => {
    refreshPhotographers();
  }, [refreshPhotographers]);

  const selectedPhotographer =
    photographers.find((p) => p.slug === selectedPhotographerSlug) || photographers[0] || null;

  return (
    <StudioContext.Provider
      value={{
        photographers,
        loadingPhotographers,
        refreshPhotographers,
        selectedPhotographerSlug,
        setSelectedPhotographerSlug,
        selectedPhotographer,
        activeBooking,
        setActiveBooking,
        toast,
        showToast,
        dismissToast: () => setToast(null),
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error('useStudio must be used within StudioProvider');
  }
  return ctx;
}
