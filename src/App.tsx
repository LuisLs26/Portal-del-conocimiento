import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Semana1Crossword } from './pages/Semana1Crossword';
import { Semana2Quiz } from './pages/Semana2Quiz';
import { Semana3Matching } from './pages/Semana3Matching';
import { Semana4Cloze } from './pages/Semana4Cloze';
import { Semana5WordSearch } from './pages/Semana5WordSearch';
import { QRManager } from './pages/QRManager';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Header />
        
        <main style={{ flex: 1, width: '100%' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/semana/1" element={<Semana1Crossword />} />
            <Route path="/semana/2" element={<Semana2Quiz />} />
            <Route path="/semana/3" element={<Semana3Matching />} />
            <Route path="/semana/4" element={<Semana4Cloze />} />
            <Route path="/semana/5" element={<Semana5WordSearch />} />
            <Route path="/qr" element={<QRManager />} />
            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
