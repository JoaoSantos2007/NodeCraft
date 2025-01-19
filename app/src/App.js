import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

// Components
import Navbar from './components/Navbar/index.js';

// Pages
import Home from './pages/Home/index.js';
import Instance from './pages/Instance/index.js';
import { MusicPlayer } from './components/MusicPlayer/MusicPlayer.jsx';



function App() {
  const playlist = [
    "minecraft.mp3",
    "haggstrom.mp3",
    "moog.mp3",
    "subwoofer.mp3"
  ]

  const [musicStarted, setMusicStarted] = useState(false);

  // Função para iniciar a música
  const startMusic = () => {
    if (!musicStarted) setMusicStarted(true);
  };

  return (
    <div className="App" onClick={startMusic}>

      <MusicPlayer playlist={playlist} musicStarted = {musicStarted}/>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path='/' element={<Home />} />

          <Route path='/instance/:id' element={<Instance />} />
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
