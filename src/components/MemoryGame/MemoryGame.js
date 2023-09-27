import { useEffect, useRef } from "react";
import "./MemoryGame.scss";
import MemoryItem from "./MemoryItem";
import gsap, { Quad, Quart } from "gsap";

const TRANSITION_TIME_CARDFLIP = 1;
let _valueTiles = [];
let _allTiles = [];

const MemoryGame = (props) => {
  useEffect(() => {
    _allTiles = Array.from(memory.current.querySelectorAll(".memory-item"));
  });

  const memory = useRef(null);
  const soundTick = new Audio('./sounds/tick.mp3');
  const soundClick = new Audio('./sounds/click.mp3');
  const soundMatch = new Audio('./sounds/jig_match.mp3');
  const soundNomatch = new Audio('./sounds/jig_nomatch.mp3');
  soundTick.volume = 0.3;
  soundClick.volume = 0.3;
  soundMatch.volume = 0.3;
  soundNomatch.volume = 0.3;

  // console.log(memory.current);
  // _allTiles = Array.from(memory.current.querySelectorAll(".memory-item"));

  let templateColumnsString = "";
  for (let i = 0; i < props.config.width; i++) {
    templateColumnsString += "1fr ";
  }

  const onClick = (e) => {
    if (e.target.dataset.animating) return;
    flipTween(e.target, !e.target.dataset.open ? true : false);
    lock();
    soundClick.play();
  };
  const onOver = (e) => {soundTick.play(0.4)};
  const onOut = (e) => {};

  const flipTween = (target, open = false) => {
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
              } else delete target.dataset.open;
              delete target.dataset.animating;
              if(_valueTiles.length === 1) target.dataset.locked = true;
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
      } else {
        _valueTiles.forEach((tile) => flipTween(tile));
        soundNomatch.play();
      }
      _valueTiles = [];
    }
    unlock();
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

  // const tilesByValue = (searchValue) => {
  //   return _tiles.filter((tile) => tile.dataset.value === searchValue)
  // }

  return (
    <div className={`memory-game colorset-${props.colorSet}`} ref={memory}>
      <div className="aspect-ratio-box">
        <ul className="grid" style={{ gridTemplateColumns: templateColumnsString }}>
          {props.config.items.map((item, index) => (
            <MemoryItem key={item.id} uid={item.id} onClick={onClick} onMouseOver={onOver} onMouseOut={onOut} config={item} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MemoryGame;
