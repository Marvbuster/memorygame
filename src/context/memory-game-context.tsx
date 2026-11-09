'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSound } from '@context/sound-context';

// Hilfsfunktionen direkt definieren statt sie zu importieren
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function createPairs<T>(items: T[], idGenerator: (item: T, index: number) => string | number): T[] {
  const pairs: T[] = [];
  items.forEach((item, index) => {
    // Original-Item
    pairs.push(item);
    // Duplikat mit neuer ID
    pairs.push({
      ...item,
      id: idGenerator(item, index)
    });
  });
  return pairs;
}

function checkForMatch(card1: any, card2: any): boolean {
  return card1.value === card2.value;
}

export interface MemoryItem {
  id: string | number;
  value: string;
  image: string;
  isMatched?: boolean;
  isFlipped?: boolean;
  isAnimating?: boolean;
  isDisabled?: boolean;
}

export interface MemoryGameConfig {
  width: number;
  items: MemoryItem[];
  autoStart: boolean;
}

interface MemoryGameState {
  items: MemoryItem[];
  attempts: number;
  matches: number;
  isGameStarted: boolean;
  isGameWon: boolean;
  selectedCards: MemoryItem[];
  isLocked: boolean;
  currentColorSet: number;
}

interface MemoryGameContextType {
  state: MemoryGameState;
  config: MemoryGameConfig;
  startGame: () => void;
  resetGame: () => void;
  flipCard: (card: MemoryItem) => void;
  checkCards: (firstCard: MemoryItem, secondCard: MemoryItem) => void;
  changeColorSet: () => void;
}

const MemoryGameContext = createContext<MemoryGameContextType | undefined>(undefined);

const defaultConfig: MemoryGameConfig = {
  width: 4,
  items: [],
  autoStart: false,
};

interface MemoryGameProviderProps {
  children: ReactNode;
  initialConfig?: Partial<MemoryGameConfig>;
}

// Zufälliges Farbschema generieren (0-5)
const getRandomColorSet = (currentSet: number) => {
  let newSet;
  do {
    newSet = Math.floor(Math.random() * 6);
  } while (newSet === currentSet);
  return newSet;
};

export function MemoryGameProvider({ 
  children,
  initialConfig = {}
}: MemoryGameProviderProps) {
  const mergedConfig = { ...defaultConfig, ...initialConfig };
  const { playSound } = useSound();
  
  const [state, setState] = useState<MemoryGameState>({
    items: [],
    attempts: 0,
    matches: 0,
    isGameStarted: false,
    isGameWon: false,
    selectedCards: [],
    isLocked: false,
    currentColorSet: getRandomColorSet(-1),
  });
  
  const [config, setConfig] = useState<MemoryGameConfig>(mergedConfig);
  
  // Wechselt das Farbschema
  const changeColorSet = () => {
    const newColorSet = getRandomColorSet(state.currentColorSet);
    setState(prev => ({ ...prev, currentColorSet: newColorSet }));
  };
  
  // Überprüfe, ob das Spiel gewonnen wurde
  useEffect(() => {
    if (state.matches > 0 && state.matches === config.items.length / 2) {
      // Alle Paare gefunden - Spiel gewonnen!
      setState(prev => ({ ...prev, isGameWon: true }));
    }
  }, [state.matches, config.items.length]);
  
  // Automatisch starten, wenn konfiguriert
  useEffect(() => {
    if (config.autoStart && config.items.length > 0 && !state.isGameStarted) {
      startGame();
    }
  }, [config.autoStart, config.items.length, state.isGameStarted]);
  
  // Überprüfe auf Match, wenn zwei Karten ausgewählt sind
  useEffect(() => {
    if (state.selectedCards.length === 2 && !state.isLocked) {
      setState(prev => ({ ...prev, isLocked: true }));
      
      const [firstCard, secondCard] = state.selectedCards;
      checkCards(firstCard, secondCard);
    }
  }, [state.selectedCards, state.isLocked]);

  // Initialisiere Spielzustand
  const prepareGameItems = (sourceItems: MemoryItem[]) => {
    // Mische die Items
    const shuffledItems = shuffleArray([...sourceItems]);
    
    const preparedItems = shuffledItems.map((item: MemoryItem) => ({
      ...item,
      isMatched: false,
      isFlipped: false,
      isAnimating: false,
      isDisabled: false,
    }));
    
    setState(prev => ({ ...prev, items: preparedItems }));
  };

  // Starte das Spiel
  const startGame = () => {
    prepareGameItems(config.items);
    setState(prev => ({
      ...prev,
      isGameStarted: true,
      isGameWon: false,
      attempts: 0,
      matches: 0,
      selectedCards: [],
      isLocked: false,
    }));
    changeColorSet();
  };

  // Spiel zurücksetzen
  const resetGame = () => {
    setState(prev => ({
      ...prev,
      isGameStarted: false,
      isGameWon: false,
      attempts: 0,
      matches: 0,
      selectedCards: [],
      isLocked: false,
    }));
    prepareGameItems(config.items);
  };

  // Karte umdrehen
  const flipCard = (card: MemoryItem) => {
    // Finde die Karte im state.items Array
    const cardIndex = state.items.findIndex(item => item.id === card.id);
    if (cardIndex === -1) return;
    
    const selectedCard = state.items[cardIndex];
    
    // Ignoriere, wenn die Karte bereits umgedreht, matched oder disabled ist
    // oder eine Animation läuft oder das Spiel gesperrt ist
    if (
      selectedCard.isFlipped || 
      selectedCard.isMatched || 
      selectedCard.isDisabled || 
      state.isLocked || 
      selectedCard.isAnimating
    ) {
      return;
    }
    
    // Aktualisiere die Karte im Array
    const updatedItems = [...state.items];
    updatedItems[cardIndex] = {
      ...selectedCard,
      isFlipped: true,
      isAnimating: true,
    };
    
    // Füge die Karte zu den ausgewählten Karten hinzu
    setState(prev => ({
      ...prev,
      items: updatedItems,
      selectedCards: [...prev.selectedCards, selectedCard],
    }));
    
    // Nach Animation: isAnimating zurücksetzen
    setTimeout(() => {
      const finalItems = [...updatedItems];
      finalItems[cardIndex] = {
        ...updatedItems[cardIndex],
        isAnimating: false,
      };
      
      setState(prev => ({
        ...prev,
        items: finalItems,
      }));
      
      // Wenn zwei Karten ausgewählt sind, prüfe auf Match
      if (state.selectedCards.length === 1) {
        // Sperre das Spiel während der Prüfung
        setState(prev => ({ ...prev, isLocked: true }));
        
        // Kurze Verzögerung, damit die Animation fertig ist
        setTimeout(() => {
          checkCards(state.selectedCards[0], selectedCard);
        }, 500);
      }
    }, 500);
  };

  // Überprüft, ob zwei Karten übereinstimmen
  const checkCards = (firstCard: MemoryItem, secondCard: MemoryItem) => {
    // Inkrementiere die Versuche
    setState(prev => ({ ...prev, attempts: prev.attempts + 1 }));
    
    // Überprüfe auf Match
    if (checkForMatch(firstCard, secondCard)) {
      // Match gefunden
      playSound('match');
      
      // Markiere beide Karten als matched
      const updatedItems = state.items.map(item => {
        if (item.id === firstCard.id || item.id === secondCard.id) {
          return { ...item, isMatched: true };
        }
        return item;
      });
      
      // Aktualisiere den Zustand
      setState(prev => ({
        ...prev,
        items: updatedItems,
        matches: prev.matches + 1,
        selectedCards: [],
        isLocked: false,
      }));
      
      // Prüfe ob Spiel gewonnen wurde
      if (state.matches + 1 === config.items.length / 2) {
        setTimeout(() => {
          setState(prev => ({ ...prev, isGameWon: true }));
        }, 500);
      }
    } else {
      // Kein Match
      playSound('nomatch');
      
      // Drehe die Karten nach einer Verzögerung wieder um
      setTimeout(() => {
        // Finde die Indizes der zwei Karten
        const firstCardIndex = state.items.findIndex(item => item.id === firstCard.id);
        const secondCardIndex = state.items.findIndex(item => item.id === secondCard.id);
        
        if (firstCardIndex === -1 || secondCardIndex === -1) {
          // Falls die Karten nicht gefunden werden können, entsperre das Spiel
          setState(prev => ({ ...prev, isLocked: false, selectedCards: [] }));
          return;
        }
        
        // Erstelle eine Kopie des item-Arrays
        const updatedItems = [...state.items];
        
        // Markiere die Karten als animierend und nicht umgedreht
        updatedItems[firstCardIndex] = {
          ...updatedItems[firstCardIndex],
          isFlipped: false,
          isAnimating: true,
        };
        
        updatedItems[secondCardIndex] = {
          ...updatedItems[secondCardIndex],
          isFlipped: false,
          isAnimating: true,
        };
        
        // Aktualisiere den Zustand
        setState(prev => ({
          ...prev,
          items: updatedItems,
          selectedCards: [],
        }));
        
        // Animation Flag nach Animation zurücksetzen
        setTimeout(() => {
          const finalItems = [...updatedItems];
          finalItems[firstCardIndex] = {
            ...finalItems[firstCardIndex],
            isAnimating: false,
          };
          finalItems[secondCardIndex] = {
            ...finalItems[secondCardIndex],
            isAnimating: false,
          };
          
          // Entsperre das Spiel
          setState(prev => ({
            ...prev,
            items: finalItems,
            isLocked: false,
          }));
        }, 600);
      }, 1000);
    }
  };

  const contextValue: MemoryGameContextType = {
    state,
    config,
    startGame,
    resetGame,
    flipCard,
    checkCards,
    changeColorSet,
  };

  return (
    <MemoryGameContext.Provider value={contextValue}>
      {children}
    </MemoryGameContext.Provider>
  );
}

export function useMemoryGame() {
  const context = useContext(MemoryGameContext);
  if (context === undefined) {
    throw new Error('useMemoryGame muss innerhalb eines MemoryGameProviders verwendet werden');
  }
  return context;
} 