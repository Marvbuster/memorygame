'use client';

import { SoundProvider } from '@context/sound-context';
import { MemoryGameProvider } from '@context/memory-game-context';
import dynamic from 'next/dynamic';

// Dynamische Import für die Memory-Spiel-Container-Komponente
const MemoryGameContainer = dynamic(
  () => import('@components/memory-game/memory-game-container').then(mod => mod.MemoryGameContainer),
  { 
    loading: () => (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-pulse text-center text-xl">
          Lade Memory-Spiel...
        </div>
      </div>
    ),
    ssr: false // Deaktiviere serverseitiges Rendering für Audio-Kompatibilität
  }
);

export default function HomePage() {
  return (
    <div id="root">
      <div className="memory-wrapper" style={{ width: '500px' }}>
        <SoundProvider>
          <MemoryGameProvider>
            <MemoryGameContainer />
          </MemoryGameProvider>
        </SoundProvider>
      </div>
    </div>
  );
} 