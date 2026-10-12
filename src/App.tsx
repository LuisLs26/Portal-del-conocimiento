import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';

// Code-splitting with lazy loading for extreme mobile speed
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Semana1Crossword = lazy(() => import('./pages/Semana1Crossword').then(m => ({ default: m.Semana1Crossword })));
const Semana2Quiz = lazy(() => import('./pages/Semana2Quiz').then(m => ({ default: m.Semana2Quiz })));
const Semana3Matching = lazy(() => import('./pages/Semana3Matching').then(m => ({ default: m.Semana3Matching })));
const Semana4Cloze = lazy(() => import('./pages/Semana4Cloze').then(m => ({ default: m.Semana4Cloze })));
const Semana5WordSearch = lazy(() => import('./pages/Semana5WordSearch').then(m => ({ default: m.Semana5WordSearch })));
const Maraton = lazy(() => import('./pages/Maraton').then(m => ({ default: m.Maraton })));
const QRManager = lazy(() => import('./pages/QRManager').then(m => ({ default: m.QRManager })));

// Minimal Apple iOS loader indicator
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: 'var(--text-secondary)',
    fontSize: '13px'
  }}>
    <div style={{
      width: '20px',
      height: '20px',
      border: '2px solid var(--separator-dark)',
      borderTopColor: 'var(--apple-blue)',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      marginRight: '8px'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <span>Cargando...</span>
  </div>
);

const AppShell: React.FC = () => {
  return (
      <div className="app-container">
        <Header />
        
        <main style={{ flex: 1, width: '100%' }}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Home is only shown on root / */}
              <Route path="/" element={<Home />} />

              {/* Direct QR scan activities - open directly into the game */}
              <Route path="/semana/1" element={<Semana1Crossword />} />
              <Route path="/semana/2" element={<Semana2Quiz />} />
              <Route path="/semana/3" element={<Semana3Matching />} />
              <Route path="/semana/4" element={<Semana4Cloze />} />
              <Route path="/semana/5" element={<Semana5WordSearch />} />

              <Route path="/maraton" element={<Maraton />} />
              <Route path="/semana/6" element={<Maraton />} />

              {/* QR Management and Book printing */}
              <Route path="/qr" element={<QRManager />} />

              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
  );
};

export const App = () => <BrowserRouter><AppShell /></BrowserRouter>;
export default App;
