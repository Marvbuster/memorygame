import {useEffect, useRef, useState} from "react";
import "./MemoryGame.scss";
import MemoryItem from "./MemoryItem";
import gsap, {Quad, Quart} from "gsap";

const TRANSITION_TIME_CARDFLIP = 1;
const TRANSITION_TIME_CARDFLIP_BACK = 0.6;
let AUDIOMUTE = false;
let WIN_CONDITION = -1;
let _activeTiles = 0;
let _valueTiles: HTMLElement[] = [];
let _allTiles: HTMLElement[] = [];
let _splash: HTMLElement | null, _curtain: HTMLElement | null, _muteButton: HTMLElement | null, _counter: { user: number; matches: number };
let soundTick: HTMLAudioElement, soundClick: HTMLAudioElement, soundMatch: HTMLAudioElement, soundNomatch: HTMLAudioElement, soundBgMusic: HTMLAudioElement,
  soundWin: HTMLAudioElement;

// Funktion zur Generierung einer zufälligen Zahl für die Klasse
const getRandomColorSet = (currentSet: number) => {
  let newSet;
  do {
    newSet = Math.floor(Math.random() * 6); // Zahl zwischen 0 und 5
  } while (newSet === currentSet);
  return newSet;
};

const MemoryGame = (props: any) => {
  const [itemsArray, setItemsArray] = useState(props.config.items);
  const [colorSetClass, setColorSetClass] = useState(`colorset-${getRandomColorSet(-1)}`);
  const [activeItem, setActiveItem] = useState<HTMLElement | null>(null);

  useEffect(() => {
    _allTiles = Array.from(memory.current!.querySelectorAll(".memory-item"));
    _splash = memory.current!.querySelector(".splash");
    _curtain = memory.current!.querySelector(".game-curtain");
    _muteButton = memory.current!.querySelector(".game-controls .mute");
    WIN_CONDITION = _allTiles.length / 2;

    soundTick = new Audio("./sounds/tick.mp3");
    soundClick = new Audio("./sounds/click.mp3");
    soundMatch = new Audio("./sounds/jig_match.mp3");
    soundNomatch = new Audio("./sounds/jig_nomatch.mp3");
    soundBgMusic = new Audio("./sounds/fis_theme.mp3");
    soundWin = new Audio("./sounds/win.mp3");

    soundTick.volume = 0.1;
    soundClick.volume = 0.3;
    soundMatch.volume = 0.3;
    soundNomatch.volume = 0.3;
    soundBgMusic.volume = 0;
    soundBgMusic.loop = true;
    soundWin.volume = 0.4;

    initGame();
  }, []);

  const initGame = () => {
    _counter = {
      user: 0,
      matches: 0,
    };
    shuffle(itemsArray);
  };

  const memory = useRef<HTMLDivElement>(null);

  let templateColumnsString = "";
  for (let i = 0; i < props.config.width; i++) {
    templateColumnsString += "1fr ";
  }

  const onClick = (e: any) => {
    if (e.target.dataset.animating) return;
    flipTween(e.target, !e.target.dataset.open);
    if (!AUDIOMUTE) soundClick.play();
    _activeTiles++;
    if (_activeTiles >= 2) {
      lock();
      _activeTiles = 0;
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    if(!target) {
      setActiveItem(null);
      return;
    }
    const memoryItem = target.closest(".memory-item") as HTMLElement;

    if (memoryItem && memoryItem !== activeItem) {
      if (!AUDIOMUTE) soundTick.play();
      console.log("Touch Move", e, activeItem, memoryItem);
      memoryItem?.classList.add("touch-active");
      setActiveItem(null);
      setActiveItem(memoryItem);
    } else if (!memoryItem) {
      activeItem?.classList.remove("touch-active");
      setActiveItem(null);
    }
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    const memoryItem = target.closest(".memory-item") as HTMLElement;
    // if (memoryItem && memoryItem !== activeItem) {
      if (!AUDIOMUTE) soundTick.play();
      console.log("Touch End ", e, ' MemoryItem =' , memoryItem);
      memoryItem?.classList.remove("touch-active");
      setActiveItem(null);
    // } else if (!memoryItem) {
    //   activeItem?.classList.remove("touch-active");
    //   setActiveItem(null);
    // }
    // setActiveItem(null);
    // console.log("Touch End", e);
  };

  const onOver = (e: any) => {
    if (!AUDIOMUTE) soundTick.play();
  };

  const onOut = (e: any) => {
  };

  const flipTween = async (target: HTMLElement, open = false, unlockAfter = false) => {
    return new Promise<void>((resolve) => {
      if (open) target.dataset.open = "true";

      target.dataset.animating = "true";
      gsap.set(target, {perspective: 1500});

      let time = open ? TRANSITION_TIME_CARDFLIP / 2 : TRANSITION_TIME_CARDFLIP_BACK / 2;
      let content = target.querySelector(".content") as HTMLElement;
      let curtainFrontBack = content.querySelectorAll(".content--front .curtain, .content--back .curtain");
      let curtainLeftRight = content.querySelectorAll(".content--left .curtain, .content--right .curtain");

      // flip fore
      gsap.to(content, {rotationY: 90, duration: time, ease: Quad.easeIn});
      gsap.to(curtainLeftRight, {
        opacity: 0,
        duration: time,
        ease: Quad.easeIn,
      });
      gsap.to(curtainFrontBack, {
        opacity: 0.8,
        duration: time,
        ease: Quart.easeIn,
        // flip back
        onComplete: () => {
          gsap.to(content, {rotationY: open ? 180 : 0, duration: time, ease: Quad.easeOut});
          gsap.to(curtainLeftRight, {
            opacity: 0.5,
            duration: time,
            ease: Quad.easeOut,
          });
          gsap.to(curtainFrontBack, {
            opacity: 0,
            duration: time,
            ease: Quart.easeOut,
            // adding tile to check for match and reset animation
            onComplete: () => {
              setTimeout(() => {
                if (open) {
                  addTile(target);
                } else {
                  delete target.dataset.open;
                }
                delete target.dataset.animating;
                if (_valueTiles.length === 1) target.dataset.locked = "true";
                if (unlockAfter) {
                  delete target.dataset.locked;
                }
                resolve();
              }, 500);
            },
          });
        },
      });
    });
  };

  const winMatch = () => {
    soundWin.play();
    refillSplash("win");
  };

  const refillSplash = (type: string) => {
    switch (type) {
      case "win":
        _splash!.querySelector("h1")!.innerHTML = "Juhu!";
        _splash!.querySelector("p")!.innerHTML = "Du hast gewonnen!!";
        _splash!.querySelector("button")!.innerHTML = "Nochmal";
        _splash!.classList.add("visible");
        _curtain!.classList.add("active");
        _splash!.dataset.replay = "true";
        break;

      default:
        break;
    }
  };

  const addTile = (tile: HTMLElement) => {
    _valueTiles.push(tile);
    if (_valueTiles.length > 1) {
      // matching tiles
      if (_valueTiles[0].dataset.value === _valueTiles[1].dataset.value) {
        _counter.matches++;
        disable(_valueTiles);
        if (_counter.matches >= WIN_CONDITION) {
          winMatch();
        } else if (!AUDIOMUTE) soundMatch.play();
        unlock();
      } else {
        // not matching tiles
        unlock(_valueTiles);
        _valueTiles.forEach((tile) => flipTween(tile, false, true));
        if (!AUDIOMUTE) soundNomatch.play();
      }
      _valueTiles = [];
      _counter.user++;
    }
  };

  const disable = (tiles: HTMLElement[]) => {
    tiles.forEach((tile) => (tile.dataset.disabled = "true"));
  };

  const lock = () => {
    _allTiles.forEach((tile) => (tile.dataset.locked = "true"));
  };

  const unlock = (exceptionTiles?: HTMLElement[]) => {
    if (exceptionTiles)
      _allTiles.forEach((tile) => {
        if (tile !== exceptionTiles[0] && tile !== exceptionTiles[1]) delete tile.dataset.locked;
      });
    else _allTiles.forEach((tile) => delete tile.dataset.locked);
  };

  const startMemory = async () => {

    if (!AUDIOMUTE) await soundClick.play();
    if (!AUDIOMUTE) await soundBgMusic.play();
    if (!AUDIOMUTE) gsap.to(soundBgMusic, {volume: 0.08, duration: 6});
    _splash!.classList.remove("visible");
    _curtain!.classList.remove("active");

    if (_splash!.dataset.replay) {
      _counter.user = 0;
      _counter.matches = 0;
      // await bis alle fliptweens zuende sind
      await Promise.all(_allTiles.map((tile) => {
        delete tile.dataset.disabled;
        return flipTween(tile, false, true);
      }));
      shuffle(itemsArray);
    }
    changeBackgroundColor();
  };

  const toggleMute = () => {
    soundClick.play();
    if (!AUDIOMUTE) {
      AUDIOMUTE = true;
      gsap.to(soundBgMusic, {volume: 0, duration: 2, overwrite: true});
      _muteButton!.classList.add("muted");
    } else {
      AUDIOMUTE = false;
      soundBgMusic.play();
      gsap.to(soundBgMusic, {volume: 0.08, duration: 6, overwrite: true});
      _muteButton!.classList.remove("muted");
    }
  };

  function shuffle(a: any[]) {
    let b = [...a];

    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }

    setItemsArray(b);
  }

  // Funktion, die beim Starten des Spiels das data-colorset Attribut ändert
  const changeBackgroundColor = () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const currentSet = parseInt(rootElement.getAttribute('data-colorset') || '-1', 10);
      const newSet = getRandomColorSet(currentSet);
      rootElement.setAttribute('data-colorset', newSet.toString());
    }
  };

  return (
    <div className={`memory-game colorset-${props.colorSet}`} ref={memory} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="aspect-ratio-box">
        <ul className="grid" style={{gridTemplateColumns: templateColumnsString}}>
          {itemsArray.map((item: any, index: number) => (
            // if setActiveItem is item, add class touch-active
            <MemoryItem key={item.id} uid={item.id} onClick={onClick} onMouseOver={onOver} onMouseOut={onOut} config={item}
            />
          ))}
        </ul>
        <div className="splash visible">
          <h1>Memory-Chill</h1>
          <p>Eine kleine Runde geht doch immer...</p>
          <button onClick={startMemory}>Starten</button>
        </div>
      </div>
      <div className="game-controls">
        <div className="mute" onClick={toggleMute}>
          <svg id="volume" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 576 512">
            <path
              d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" />
            <path
              id="x"
              d="M425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"
            />
          </svg>
        </div>
        <div className="volume"></div>
      </div>
      <div className="game-info">
        <div className="score">Versuche:</div>
      </div>
      <div className="game-curtain active"></div>
    </div>
  );
};

export default MemoryGame;