'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface SoundMap {
  [key: string]: {
    element: HTMLAudioElement | null;
    volume: number;
  };
}

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (id: string) => void;
  stopSound: (id: string) => void;
  stopAllSounds: () => void;
  setVolume: (id: string, volume: number) => void;
  setBgMusicVolume: (volume: number) => void;
  initializeAudio: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

interface SoundProviderProps {
  children: ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  
  // Verwende Refs anstatt State für Audio-Elemente
  const soundsRef = useRef<SoundMap>({});
  
  // Höre auf Benutzerinteraktionen (z.B. Klicks), um Audio zu aktivieren
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        // Versuche alle Sounds kurz anzuspielen und dann zu pausieren
        // um den Audiokontext zu aktivieren
        Object.values(soundsRef.current).forEach(sound => {
          if (sound?.element) {
            try {
              const playPromise = sound.element.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    sound.element.pause();
                    sound.element.currentTime = 0;
                  })
                  .catch(err => {
                    // Ignoriere Fehler hier
                  });
              }
            } catch (error) {
              // Ignoriere Fehler
            }
          }
        });
      }
    };
    
    // Binde Event-Listener für Benutzerinteraktionen
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [userInteracted]);
  
  // Initialisiere Sounds nur einmal beim ersten Laden
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Prüfe, ob Audio-Elemente vorhanden sind, um Fehler zu vermeiden
    try {
      // Erstelle Audio-Elemente
      soundsRef.current = {
        tick: {
          element: new Audio('/sounds/tick.mp3'),
          volume: 0.1,
        },
        click: {
          element: new Audio('/sounds/click.mp3'),
          volume: 0.3,
        },
        match: {
          element: new Audio('/sounds/jig_match.mp3'),
          volume: 0.3,
        },
        nomatch: {
          element: new Audio('/sounds/jig_nomatch.mp3'),
          volume: 0.3,
        },
        bgMusic: {
          element: new Audio('/sounds/fis_theme.mp3'),
          volume: 0,
        },
        win: {
          element: new Audio('/sounds/win.mp3'),
          volume: 0.4,
        },
      };

      // Laden aller Audio-Dateien vorbereiten
      Object.entries(soundsRef.current).forEach(([id, sound]) => {
        if (sound.element) {
          // Event-Listener für Fehler hinzufügen
          sound.element.addEventListener('error', (e) => {
            console.warn(`Fehler beim Laden der Audio-Datei ${id}:`, e);
          });
          
          // Für Safari - beginne mit dem Laden
          sound.element.preload = 'auto';
          sound.element.load();
        }
      });

      // Einstellungen für Hintergrundmusik
      if (soundsRef.current.bgMusic.element) {
        soundsRef.current.bgMusic.element.loop = true;
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Fehler beim Initialisieren der Sounds:', error);
    }
    
    // Cleanup beim Unmount
    return () => {
      Object.values(soundsRef.current).forEach(sound => {
        if (sound.element) {
          sound.element.pause();
          sound.element.src = '';
        }
      });
    };
  }, []);

  // Aktualisiere Stummschaltung
  useEffect(() => {
    if (!isInitialized) return;
    
    Object.entries(soundsRef.current).forEach(([id, sound]) => {
      if (sound.element) {
        sound.element.volume = isMuted ? 0 : sound.volume;
      }
    });
  }, [isMuted, isInitialized]);

  // Manuell Audio initialisieren (für Start-Button)
  const initializeAudio = () => {
    if (!isInitialized) return;
    
    setUserInteracted(true);
    
    // Spiele und pausiere kurz alle Sounds, um den Audiokontext zu aktivieren
    Object.values(soundsRef.current).forEach(sound => {
      if (sound?.element) {
        try {
          const playPromise = sound.element.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                sound.element.pause();
                sound.element.currentTime = 0;
              })
              .catch(err => {
                // Ignoriere Fehler hier
              });
          }
        } catch (error) {
          // Ignoriere Fehler
        }
      }
    });
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const playSound = (id: string) => {
    if (!isInitialized || isMuted) return;
    
    // Wenn noch keine Benutzerinteraktion stattgefunden hat,
    // ignoriere die Soundwiedergabe, da sie ohnehin blockiert würde
    if (!userInteracted && id !== 'click') {
      return;
    }
    
    const sound = soundsRef.current[id];
    if (sound?.element) {
      try {
        sound.element.currentTime = 0;
        // Promise verwenden, um Fehler abzufangen
        const playPromise = sound.element.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            // Autoplay wurde blockiert oder ein anderer Fehler ist aufgetreten
            console.warn(`Fehler beim Abspielen des Sounds ${id}:`, err);
            
            // Setze Benutzerinteraktion zurück, wenn Autoplay blockiert wurde
            if (!userInteracted && id === 'bgMusic') {
              setUserInteracted(false);
            }
          });
        }
      } catch (error) {
        console.error(`Fehler beim Abspielen des Sounds ${id}:`, error);
      }
    }
  };

  const stopSound = (id: string) => {
    if (!isInitialized) return;
    
    const sound = soundsRef.current[id];
    if (sound?.element) {
      try {
        sound.element.pause();
        sound.element.currentTime = 0;
      } catch (error) {
        console.error(`Fehler beim Stoppen des Sounds ${id}:`, error);
      }
    }
  };

  const stopAllSounds = () => {
    if (!isInitialized) return;
    
    Object.values(soundsRef.current).forEach(sound => {
      if (sound.element) {
        try {
          sound.element.pause();
          sound.element.currentTime = 0;
        } catch (error) {
          console.error('Fehler beim Stoppen aller Sounds:', error);
        }
      }
    });
  };

  const setVolume = (id: string, volume: number) => {
    if (!isInitialized) return;
    
    const sound = soundsRef.current[id];
    if (sound) {
      // Speichere ursprüngliche Lautstärke
      sound.volume = volume;
      // Setze aktuelle Lautstärke (0 wenn stumm)
      if (sound.element && !isMuted) {
        try {
          sound.element.volume = volume;
        } catch (error) {
          console.error(`Fehler beim Setzen der Lautstärke für ${id}:`, error);
        }
      }
    }
  };

  const setBgMusicVolume = (volume: number) => {
    if (!isInitialized) return;
    setVolume('bgMusic', volume);
  };

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        playSound,
        stopSound,
        stopAllSounds,
        setVolume,
        setBgMusicVolume,
        initializeAudio,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound muss innerhalb eines SoundProviders verwendet werden');
  }
  return context;
} 