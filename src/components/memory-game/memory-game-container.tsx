'use client';

import { useEffect, useState } from 'react';
import { MemoryGame } from '@components/memory-game/memory-game';
import { useMemoryGame } from '@context/memory-game-context';
import type { MemoryItem } from '@context/memory-game-context';

// Standardkonfiguration für das Memory-Spiel
const defaultItems: MemoryItem[] = [
  { id: 0, value: 'A', image: '/images/nx_icon__0003_metroid_logo.png' },
  { id: 1, value: 'B', image: '/images/nx_icon__0005_zelda_royal.png' },
  { id: 2, value: 'C', image: '/images/nx_icon__0015_mario.png' },
  { id: 3, value: 'D', image: '/images/nx_icon__0014_luigi.png' },
  { id: 4, value: 'E', image: '/images/nx_icon__0013_peach.png' },
  { id: 5, value: 'F', image: '/images/nx_icon__0012_yoshi.png' },
  { id: 6, value: 'G', image: '/images/nx_icon__0007_5block.png' },
  { id: 7, value: 'H', image: '/images/nx_icon__0011_mushroom.png' },
];

export function MemoryGameContainer() {
  const { state, config, startGame, resetGame } = useMemoryGame();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Initialisiere Spielitems und -konfiguration
  useEffect(() => {
    if (isClient && config.items.length === 0) {
      // Bereite Duplikate für jedes Item vor
      const itemPairs: MemoryItem[] = [];
      defaultItems.forEach((item, index) => {
        // Original-Item
        itemPairs.push(item);
        // Duplikat mit neuer ID
        itemPairs.push({
          ...item,
          id: `${item.id}_duplicate_${index}`
        });
      });
      
      // Aktualisiere die Konfiguration
      config.items = itemPairs;
      config.width = 4;
    }
  }, [isClient, config]);
  
  // Erstelle das Spielraster basierend auf der Breite
  let templateColumnsString = '';
  for (let i = 0; i < config.width; i++) {
    templateColumnsString += '1fr ';
  }
  
  // Gib die MemoryGame-Komponente zurück
  return (
    <MemoryGame 
      style={{ gridTemplateColumns: templateColumnsString.trim() }} 
    />
  );
} 