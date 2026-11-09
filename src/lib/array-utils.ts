/**
 * Mischt ein Array mit dem Fisher-Yates (Knuth) Shuffle-Algorithmus.
 * Gibt ein neues gemischtes Array zurück, ohne das Original zu verändern.
 * @template T Der Typ der Array-Elemente
 * @param {T[]} array Das zu mischende Array
 * @returns {T[]} Ein neues gemischtes Array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Erstellt ein Array mit Dubletten aus einem bestehenden Array.
 * Jedes Element wird genau einmal dupliziert, sodass das Ergebnis-Array
 * doppelt so lang ist wie das Original.
 * 
 * @template T Der Typ der Array-Elemente
 * @param {T[]} array Das zu duplizierende Array
 * @param {(item: T, index: number) => string | number} idGenerator Optional: Eine Funktion, die IDs für die duplizierten Elemente generiert
 * @returns {T[]} Ein neues Array mit duplizierten Elementen
 */
export function createPairs<T extends { id: string | number }>(
  array: T[],
  idGenerator?: (item: T, index: number) => string | number
): T[] {
  const result: T[] = [];
  
  // Füge die Originale hinzu
  result.push(...array);
  
  // Füge die Duplikate mit modifizierten IDs hinzu
  array.forEach((item, index) => {
    const duplicatedId = idGenerator 
      ? idGenerator(item, index) 
      : `${item.id}_duplicate`;
      
    result.push({
      ...item,
      id: duplicatedId
    });
  });
  
  return result;
} 