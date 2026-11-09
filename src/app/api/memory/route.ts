import { NextRequest, NextResponse } from 'next/server';
import { shuffleArray } from '@lib/array-utils';

// Typdefinitionen
export interface MemoryItem {
  id: string | number;
  value: string;
  image: string;
}

export interface MemoryState {
  items: MemoryItem[];
  attempts: number;
  matches: number;
}

/**
 * GET /api/memory
 * Gibt die verfügbaren Memory-Kartensets zurück
 */
export async function GET() {
  // Standardkonfiguration für Memory-Spiel
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

  // Verfügbare Konfigurationen
  const configurations = [
    {
      id: 'standard',
      name: 'Standard',
      width: 4,
      items: defaultItems,
    },
    {
      id: 'easy',
      name: 'Einfach',
      width: 3,
      items: defaultItems.slice(0, 4), // Nur die ersten 4 Items für einfache Version
    },
    {
      id: 'hard',
      name: 'Schwer',
      width: 4,
      items: [
        ...defaultItems,
        { id: 8, value: 'I', image: '/images/nx_icon__0009_star.png' },
        { id: 9, value: 'J', image: '/images/nx_icon__0010_flower.png' },
        { id: 10, value: 'K', image: '/images/nx_icon__0006_koopa_shell.png' },
        { id: 11, value: 'L', image: '/images/nx_icon__0008_yoshi_egg.png' },
      ],
    },
  ];

  return NextResponse.json({ configurations });
}

/**
 * POST /api/memory/shuffle
 * Mischt die Karten serverseitig
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  if (!body || !body.items || !Array.isArray(body.items)) {
    return NextResponse.json(
      { error: "Ungültige Anfrage. 'items' Array wird benötigt." },
      { status: 400 }
    );
  }
  
  // Mische die Karten
  const shuffledItems = shuffleArray([...body.items]);
  
  // Bereite Karten für das Spiel vor
  const gameItems = shuffledItems.map(item => ({
    ...item,
    isMatched: false,
    isFlipped: false,
    isAnimating: false,
    isDisabled: false,
  }));
  
  return NextResponse.json({ 
    items: gameItems,
    message: "Karten erfolgreich gemischt!" 
  });
}

// Helper-Funktion (nicht exportiert) um serverseitig zu prüfen, ob Karten übereinstimmen
function checkMatch(firstCard: MemoryItem, secondCard: MemoryItem): boolean {
  // Hier kann komplexere Logik implementiert werden
  return firstCard.value === secondCard.value;
} 