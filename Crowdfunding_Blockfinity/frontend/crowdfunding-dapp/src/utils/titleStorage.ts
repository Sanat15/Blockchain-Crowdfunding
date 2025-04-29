// src/utils/titleStorage.ts

export const saveTitleToStorage = (campaignId: number | string, title: string): void => {
    try {
      const storedTitles = localStorage.getItem('campaignTitles');
      const titles = storedTitles ? JSON.parse(storedTitles) : {};
      
      titles[campaignId] = title;
      localStorage.setItem('campaignTitles', JSON.stringify(titles));
    } catch (error) {
      console.error('Failed to save title to localStorage:', error);
    }
  };
  
  export const getTitleFromStorage = (campaignId: number | string): string | null => {
    try {
      const storedTitles = localStorage.getItem('campaignTitles');
      if (!storedTitles) return null;
      
      const titles = JSON.parse(storedTitles);
      return titles[campaignId] || null;
    } catch (error) {
      console.error('Failed to retrieve title from localStorage:', error);
      return null;
    }
  };
  
  export const clearTitleStorage = (): void => {
    try {
      localStorage.removeItem('campaignTitles');
    } catch (error) {
      console.error('Failed to clear title storage:', error);
    }
  };