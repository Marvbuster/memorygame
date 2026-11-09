import { MemoryItem } from '@context/memory-game-context';

/**
 * Überprüft, ob zwei Karten übereinstimmen.
 * @param cardA Die erste Karte
 * @param cardB Die zweite Karte
 * @returns true, wenn die Karten übereinstimmen
 */
export function checkForMatch(cardA: MemoryItem, cardB: MemoryItem): boolean {
  // Prüfe, ob die Karten die gleichen Werte haben
  return cardA.value === cardB.value;
}

/**
 * Berechnet den Spielerscore basierend auf Versuchen und Übereinstimmungen.
 * @param attempts Anzahl der Versuche
 * @param matches Anzahl der gefundenen Paare
 * @param totalPairs Gesamtzahl der Paare
 * @returns Eine Punktzahl zwischen 0 und 1000
 */
export function calculateScore(attempts: number, matches: number, totalPairs: number): number {
  if (matches === 0) return 0;
  
  // Perfekter Score: Alle Paare mit minimaler Versuchszahl (= totalPairs)
  const perfectScore = totalPairs;
  const efficiency = perfectScore / attempts;
  
  // Skaliere auf 0-1000 Punkte
  let score = Math.round(1000 * (matches / totalPairs) * efficiency);
  
  // Begrenze auf maximal 1000 Punkte
  return Math.min(1000, score);
}

/**
 * Anhand der bisherigen Spielhistorie kann hier eine Empfehlung für
 * den nächsten Zug gegeben werden.
 * @param revealedCards Aufgedeckte Karten
 * @param currentCards Alle aktuellen Karten
 * @returns Ein Index oder null, wenn keine Empfehlung gegeben werden kann
 */
export function suggestNextMove(
  revealedCards: Record<number, string>,
  currentCards: MemoryItem[]
): number | null {
  // Beispiellogik für eine einfache Empfehlung:
  // Prüfe, ob es ein aufgedecktes Paar gibt
  
  // Sammle bekannte Karten
  const knownValues: Record<string, number[]> = {};
  
  Object.entries(revealedCards).forEach(([indexStr, value]) => {
    const index = parseInt(indexStr, 10);
    if (!knownValues[value]) {
      knownValues[value] = [];
    }
    knownValues[value].push(index);
  });
  
  // Suche nach potentiellen Paaren
  for (const [value, indices] of Object.entries(knownValues)) {
    if (indices.length === 1) {
      const currentCardValues = currentCards.map(card => card.value);
      // Suche nach einer Karte mit dem gleichen Wert, die noch nicht aufgedeckt wurde
      const matchingCardIndex = currentCardValues.findIndex(
        (cardValue, idx) => cardValue === value && !revealedCards[idx]
      );
      
      if (matchingCardIndex !== -1) {
        return matchingCardIndex;
      }
    }
  }
  
  return null;
} 