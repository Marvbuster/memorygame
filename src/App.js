import './App.css';
import MemoryGame from './components/MemoryGame/MemoryGame';

const memoryConfig = {
  width: 4,
  items: [
  {
    id: 0,
    value: 'A',
    image: './images/nx_icon__0003_metroid_logo.png',
  },
  {
    id: 1,
    value: 'B',
    image: './images/nx_icon__0005_zelda_royal.png',
  },
  {
    id: 2,
    value: 'C',
    image: './images/nx_icon__0015_mario.png',
  },
  {
    id: 3,
    value: 'D',
    image: './images/nx_icon__0014_luigi.png',
  },
  {
    id: 4,
    value: 'E',
    image: './images/nx_icon__0013_peach.png',
  },
  {
    id: 5,
    value: 'F',
    image: './images/nx_icon__0012_yoshi.png',
  },
  {
    id: 6,
    value: 'G',
    image: './images/nx_icon__0007_5block.png',
  },
  {
    id: 7,
    value: 'H',
    image: './images/nx_icon__0011_mushroom.png',
  },
  {
    id: 8,
    value: 'A',
    image: './images/nx_icon__0003_metroid_logo.png',
  },
  {
    id: 9,
    value: 'B',
    image: './images/nx_icon__0005_zelda_royal.png',
  },
  {
    id: 10,
    value: 'C',
    image: './images/nx_icon__0015_mario.png',
  },
  {
    id: 11,
    value: 'D',
    image: './images/nx_icon__0014_luigi.png',
  },
  {
    id: 12,
    value: 'E',
    image: './images/nx_icon__0013_peach.png',
  },
  {
    id: 13,
    value: 'F',
    image: './images/nx_icon__0012_yoshi.png',
  },
  {
    id: 14,
    value: 'G',
    image: './images/nx_icon__0007_5block.png',
  },
  {
    id: 15,
    value: 'H',
    image: './images/nx_icon__0011_mushroom.png',
  },
]
}

shuffle(memoryConfig.items);

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function App() {
  return (
   <>
   <div className="memory-wrapper" style={{width: '500px'}}>
    <MemoryGame config={memoryConfig} />
   </div>
   </>
  );
}

export default App;
