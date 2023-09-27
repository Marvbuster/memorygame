import { useEffect, useRef } from "react";
import "./MemoryGame.scss";
import MemoryItem from "./MemoryItem";
import gsap, { Quad, Quart } from "gsap";

const TRANSITION_TIME_CARDFLIP = 0.3;
let _activeTiles = 0;
let _valueTiles = [];
let _allTiles = [];
let _splash, _curtain;

const MemoryGame = (props) => {
  useEffect(() => {
    _allTiles = Array.from(memory.current.querySelectorAll(".memory-item"));
    _splash = memory.current.querySelector(".splash");
    _curtain = memory.current.querySelector(".game-curtain");
  });

  const memory = useRef(null);
  const soundTick = new Audio("./sounds/tick.mp3");
  const soundClick = new Audio("./sounds/click.mp3");
  const soundMatch = new Audio("./sounds/jig_match.mp3");
  const soundNomatch = new Audio("./sounds/jig_nomatch.mp3");
  const soundBgMusic = new Audio("./sounds/fis_theme.mp3");
  soundTick.volume = 0.1;
  soundClick.volume = 0.3;
  soundMatch.volume = 0.3;
  soundNomatch.volume = 0.3;
  soundBgMusic.volume = 0.08;
  soundBgMusic.loop = true;

  let templateColumnsString = "";
  for (let i = 0; i < props.config.width; i++) {
    templateColumnsString += "1fr ";
  }

  const onClick = (e) => {
    if (e.target.dataset.animating) return;
    flipTween(e.target, !e.target.dataset.open ? true : false);
    soundClick.play();
    _activeTiles++;
    if (_activeTiles >= 2) {
      lock();
      _activeTiles = 0;
    }
  };
  const onOver = (e) => {
    soundTick.play(0.4);
  };
  const onOut = (e) => {};

  const flipTween = (target, open = false, unlockAfter = false) => {
    if (open) target.dataset.open = true;

    target.dataset.animating = true;
    gsap.set(target, { perspective: 1000 });

    let content = target.querySelector(".content");
    let curtain = content.querySelector(".curtain");
    gsap.to(content, { rotationY: 90, duration: TRANSITION_TIME_CARDFLIP / 2, ease: Quad.easeIn });
    gsap.to(curtain, {
      opacity: 0.8,
      duration: TRANSITION_TIME_CARDFLIP / 2,
      ease: Quart.easeIn,
      onComplete: () => {
        gsap.to(content, { rotationY: open ? 180 : 0, duration: TRANSITION_TIME_CARDFLIP, ease: Quad.easeOut });
        gsap.to(curtain, {
          opacity: 0,
          duration: TRANSITION_TIME_CARDFLIP / 2,
          ease: Quart.easeOut,
          onComplete: () => {
            setTimeout(() => {
              if (open) {
                addTile(target);
              } else {
                delete target.dataset.open;
              }
              delete target.dataset.animating;
              if (_valueTiles.length === 1) target.dataset.locked = true;
              if (unlockAfter) unlock();
            }, 500);
          },
        });
      },
    });
  };

  const addTile = (tile) => {
    _valueTiles.push(tile);
    if (_valueTiles.length > 1) {
      if (_valueTiles[0].dataset.value === _valueTiles[1].dataset.value) {
        disable(_valueTiles);
        soundMatch.play();
        unlock();
      } else {
        _valueTiles.forEach((tile) => flipTween(tile, false, true));
        soundNomatch.play();
      }
      _valueTiles = [];
    }
  };

  const disable = (tiles) => {
    tiles.forEach((tile) => (tile.dataset.disabled = true));
  };

  const lock = () => {
    _allTiles.forEach((tile) => (tile.dataset.locked = true));
  };

  const unlock = (tiles) => {
    _allTiles.forEach((tile) => delete tile.dataset.locked);
  };

  const startMemory = () => {
    soundClick.play();
    soundBgMusic.play();
    _splash.classList.remove("visible");
    _curtain.classList.remove("active");
  };

  return (
    <div className={`memory-game colorset-${props.colorSet}`} ref={memory}>
      <div className="shadow"></div>
      <div className="aspect-ratio-box">
        <ul className="grid" style={{ gridTemplateColumns: templateColumnsString }}>
          {props.config.items.map((item, index) => (
            <MemoryItem key={item.id} uid={item.id} onClick={onClick} onMouseOver={onOver} onMouseOut={onOut} config={item} />
          ))}
        </ul>
      </div>
      <div className="game-curtain active"></div>
      <div className="splash visible">
        <h1>Moin!</h1>
        <p>Lust auf eine Runde Memory?</p>
        <button onClick={startMemory}>Starten</button>
      </div>
    </div>
  );
};

export default MemoryGame;
