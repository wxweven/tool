import React, { createContext, useState, useEffect, useContext } from 'react';

export const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const localData = localStorage.getItem('favoriteTools');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('favoriteTools', JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites to localStorage", error);
    }
  }, [favorites]);

  const addFavorite = (toolId) => {
    setFavorites((prevFavorites) => {
      if (!prevFavorites.includes(toolId)) {
        return [...prevFavorites, toolId];
      }
      return prevFavorites;
    });
  };

  const removeFavorite = (toolId) => {
    setFavorites((prevFavorites) => prevFavorites.filter((id) => id !== toolId));
  };

  const isFavorite = (toolId) => {
    return favorites.includes(toolId);
  };

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};