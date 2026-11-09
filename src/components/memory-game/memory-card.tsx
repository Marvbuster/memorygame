'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { MemoryItem } from '@context/memory-game-context';

interface MemoryCardProps {
  item: MemoryItem;
  onFlip: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
}

// GSAP-Konfiguration für Kartenanimationen
const TRANSITION_TIME_CARDFLIP = 1;      // Zeit für das Umdrehen (offen)
const TRANSITION_TIME_CARDFLIP_BACK = 0.6; // Zeit für das Zurückdrehen (geschlossen)

export function MemoryCard({ item, onFlip, onMouseOver, onMouseOut }: MemoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  
  // Kartendrehung mit GSAP animieren
  useEffect(() => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const content = card.querySelector('.content') as HTMLElement;
    
    if (!content) return;
    
    // Führe Flip-Animation durch, wenn sich isFlipped ändert
    if (item.isAnimating && !isAnimating.current) {
      isAnimating.current = true;
      
      flipTween(card, content, item.isFlipped)
        .then(() => {
          isAnimating.current = false;
        });
    }
  }, [item.isFlipped, item.isAnimating]);
  
  // GSAP-Animation für das Umdrehen der Karte
  const flipTween = async (target: HTMLElement, content: HTMLElement, open = false) => {
    return new Promise<void>((resolve) => {
      // Perspective für 3D-Effekt
      gsap.set(target, { perspective: 1500 });
      
      // Dataset erst NACH der vollständigen Animation setzen
      target.dataset.animating = "true";
      
      const time = open 
        ? TRANSITION_TIME_CARDFLIP / 2 
        : TRANSITION_TIME_CARDFLIP_BACK / 2;
      
      // Selektoren für die verschiedenen Teile der Karte
      const curtainFrontBack = content.querySelectorAll('.content--front .curtain, .content--back .curtain');
      const curtainSides = content.querySelectorAll('.content--left .curtain, .content--right .curtain');
      
      // Phase 1: Drehung zur Hälfte
      gsap.to(content, {
        rotationY: 90, 
        duration: time, 
        ease: "quad.in",
        onComplete: () => {
          // Phase 2: Drehung abschließen
          gsap.to(content, {
            rotationY: open ? 180 : 0, 
            duration: time, 
            ease: "quad.out",
            onComplete: () => {
              setTimeout(() => {
                // Erst NACH der kompletten Animation das Dataset setzen
                if (open) {
                  target.dataset.open = "true";
                } else {
                  delete target.dataset.open;
                }
                delete target.dataset.animating;
                resolve();
              }, 100);
            }
          });
          
          // Vorhang-Animation für besseren visuellen Effekt
          gsap.to(curtainSides, {
            opacity: 0.5,
            duration: time,
            ease: "quad.out",
          });
          
          gsap.to(curtainFrontBack, {
            opacity: 0,
            duration: time,
            ease: "quart.out",
          });
        }
      });
      
      // Vorhang-Animation während der ersten Phase
      gsap.to(curtainSides, {
        opacity: 0,
        duration: time,
        ease: "quad.in",
      });
      
      gsap.to(curtainFrontBack, {
        opacity: 0.8,
        duration: time,
        ease: "quart.in",
      });
    });
  };
  
  // Event-Handler für Klicks
  const handleClick = () => {
    if (
      item.isMatched ||
      item.isAnimating ||
      item.isDisabled ||
      isAnimating.current ||
      cardRef.current?.dataset.locked ||
      cardRef.current?.dataset.disabled
    ) {
      return;
    }
    
    onFlip();
  };
  
  return (
    <div
      ref={cardRef}
      className="memory-item"
      onClick={handleClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      data-value={item.value}
      data-id={item.id}
      data-disabled={item.isMatched ? "true" : undefined}
      data-locked={item.isDisabled ? "true" : undefined}
      data-open={item.isFlipped ? "true" : undefined}
    >
      <div className="content">
        <div className="content--front">
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 530">
            <use xlinkHref="#triforce" />
          </svg>
          <div className="curtain"></div>
        </div>
        
        <div className="content--left">
          <div className="curtain"></div>
        </div>
        
        <div className="content--right">
          <div className="curtain"></div>
        </div>
        
        <div className="content--back">
          {item.image && <img src={item.image} alt="memory-item" />}
          <div className="curtain"></div>
        </div>
      </div>
    </div>
  );
} 