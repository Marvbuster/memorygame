'use client';

import { useState, useEffect, useRef } from 'react';
import { MemoryCard } from '@components/memory-game/memory-card';
import { useMemoryGame } from '@context/memory-game-context';
import { useSound } from '@context/sound-context';
import gsap from 'gsap';

interface MemoryGameProps {
  style?: React.CSSProperties;
}

export function MemoryGame({ style }: MemoryGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const { state, startGame, resetGame, flipCard } = useMemoryGame();
  const { playSound, stopAllSounds, toggleMute, isMuted, setBgMusicVolume, initializeAudio } = useSound();
  
  // Touch-Event-Handler
  const [activeItem, setActiveItem] = useState<HTMLElement | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  // Audio-Initialisierung beim ersten Laden
  useEffect(() => {
    const initAudio = () => {
      // Nur einmal initialisieren
      if (!audioInitialized) {
        initializeAudio();
        setAudioInitialized(true);
        // Event-Listener entfernen nach der Initialisierung
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
      }
    };
    
    // Event-Listener für erste Nutzerinteraktion
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, [audioInitialized, initializeAudio]);
  
  // Klick auf Start-Button
  const handleStart = () => {
    // Initialisiere Audio für Browser-Kompatibilität
    initializeAudio();
    setAudioInitialized(true);
    
    // Sound abspielen
    playSound('click');
    
    // Starte Spiel
    startGame();
    
    // Starte Hintergrundmusik mit Verzögerung
    setTimeout(() => {
      playSound('bgMusic');
      // Setze die Lautstärke mit weiterer Verzögerung
      setTimeout(() => {
        setBgMusicVolume(0.08);
      }, 500);
    }, 300);
  };
  
  // Klick auf Restart-Button nach Gewinn
  const handleReplay = () => {
    // Sound abspielen und Spiel zurücksetzen
    playSound('click');
    resetGame();
    
    // Starte Hintergrundmusik mit Verzögerung
    setTimeout(() => {
      playSound('bgMusic');
      setTimeout(() => {
        setBgMusicVolume(0.08);
      }, 500);
    }, 300);
    
    if (gameRef.current) {
      // Reset Splash-Screen
      const splash = gameRef.current.querySelector('.splash');
      if (splash) {
        const h1 = splash.querySelector('h1');
        const p = splash.querySelector('p');
        const button = splash.querySelector('button');
        
        if (h1) h1.innerHTML = 'Memory-Chill';
        if (p) p.innerHTML = 'Eine kleine Runde geht doch immer...';
        if (button) button.innerHTML = 'Starten';
      }
    }
  };
  
  // Sound beim Hovern
  const handleMouseOver = () => {
    playSound('tick');
  };
  
  // Zeige Win-Screen an, wenn das Spiel gewonnen wurde
  useEffect(() => {
    if (gameRef.current && state.isGameWon) {
      playSound('win');
      
      // Splash-Screen anzeigen
      const splash = gameRef.current.querySelector('.splash');
      if (splash) {
        const h1 = splash.querySelector('h1');
        const p = splash.querySelector('p');
        const button = splash.querySelector('button');
        
        if (h1) h1.innerHTML = 'Juhu!';
        if (p) p.innerHTML = 'Du hast gewonnen!!';
        if (button) button.innerHTML = 'Nochmal';
        
        splash.classList.add('visible');
      }
      
      // Vorhang aktivieren
      const curtain = gameRef.current.querySelector('.game-curtain');
      curtain?.classList.add('active');
    }
  }, [state.isGameWon, playSound]);
  
  useEffect(() => {
    if (gameRef.current && state.isGameStarted) {
      // Audio starten, wenn das Spiel beginnt
      playSound('bgMusic');
      
      // Lautstärke langsam erhöhen
      setTimeout(() => {
        setBgMusicVolume(0.08);
      }, 300);
      
      // Splash-Screen und Curtain ausblenden
      const splash = gameRef.current.querySelector('.splash');
      splash?.classList.remove('visible');
      const curtain = gameRef.current.querySelector('.game-curtain');
      curtain?.classList.remove('active');
    }
  }, [state.isGameStarted, playSound, setBgMusicVolume]);
  
  // Touch-Events für mobiles Spielen
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    if (!target) {
      setActiveItem(null);
      return;
    }
    
    const memoryItem = target.closest('.memory-item') as HTMLElement;
    if (memoryItem && memoryItem !== activeItem) {
      playSound('tick');
      memoryItem?.classList.add('touch-active');
      setActiveItem(memoryItem);
    } else if (!memoryItem) {
      activeItem?.classList.remove('touch-active');
      setActiveItem(null);
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    const memoryItem = target.closest('.memory-item') as HTMLElement;
    
    playSound('tick');
    memoryItem?.classList.remove('touch-active');
    setActiveItem(null);
  };
  
  return (
    <div 
      ref={gameRef}
      className={`memory-game colorset-${state.currentColorSet}`} 
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="aspect-ratio-box">
        <ul className="grid" style={style}>
          {state.items.map((item) => (
            <MemoryCard
              key={item.id}
              item={item}
              onFlip={() => {
                playSound('click');
                flipCard(item);
              }}
              onMouseOver={handleMouseOver}
            />
          ))}
        </ul>
        
        {/* Splash Screen */}
        <div className="splash visible">
          <h1>Memory-Chill</h1>
          <p>Eine kleine Runde geht doch immer...</p>
          <button onClick={state.isGameWon ? handleReplay : handleStart}>
            {state.isGameWon ? 'Nochmal' : 'Starten'}
          </button>
        </div>
      </div>
      
      {/* Mute Button */}
      <div className="game-controls">
        <div className={`mute ${isMuted ? 'muted' : ''}`} onClick={toggleMute}>
          <svg id="volume" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 576 512">
            <path
              d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" />
            <path
              id="x"
              d="M425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"
            />
          </svg>
        </div>
      </div>
      
      {/* Game Info (versteckt) */}
      <div className="game-info">
        <div className="score">Versuche: {state.attempts}</div>
      </div>
      
      {/* Game Curtain */}
      <div className="game-curtain active"></div>
    </div>
  );
} 