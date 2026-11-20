import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
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

// Limit the wait for a game bundle on slow or interrupted connections.
function lazyPartTwo(load: () => Promise<{ default: React.ComponentType }>) {
  return lazy(() => new Promise<{ default: React.ComponentType }>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('Tiempo de carga agotado')), 15000);
    void load().then(resolve, reject).finally(() => window.clearTimeout(timeout));
  }));
}

class PartTwoBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <section className="game" aria-labelledby="part-two-load-error">
        <h1 id="part-two-load-error">No se pudo abrir la Parte 2</h1>
        <p role="alert" className="game-hint">Recarga para volver a intentar.</p>
        <button className="ios-button ios-button-primary" onClick={() => window.location.reload()}>Recargar</button>{' '}
        <Link className="ios-button ios-button-secondary" to="/parte-2">Ver actividades</Link>
      </section>
    );
  }
}

// Parte 2: Actividades lúdicas virtuales de Camila (Semana 10)
const CamilaRuleta = lazyPartTwo(() => import('./pages/parte2/CamilaRuleta').then(m => ({ default: m.CamilaRuleta })));
const CamilaDesafio = lazyPartTwo(() => import('./pages/parte2/CamilaDesafio').then(m => ({ default: m.CamilaDesafio })));
const CamilaDetectives = lazyPartTwo(() => import('./pages/parte2/CamilaDetectives').then(m => ({ default: m.CamilaDetectives })));
const CamilaBingo = lazyPartTwo(() => import('./pages/parte2/CamilaBingo').then(m => ({ default: m.CamilaBingo })));
const CamilaCarrera = lazyPartTwo(() => import('./pages/parte2/CamilaCarrera').then(m => ({ default: m.CamilaCarrera })));
const CamilaExperto = lazyPartTwo(() => import('./pages/parte2/CamilaExperto').then(m => ({ default: m.CamilaExperto })));
const CamilaBatalla = lazyPartTwo(() => import('./pages/parte2/CamilaBatalla').then(m => ({ default: m.CamilaBatalla })));
const CamilaSemaforo = lazyPartTwo(() => import('./pages/parte2/CamilaSemaforo').then(m => ({ default: m.CamilaSemaforo })));

// Parte 2: Actividades lúdicas virtuales de Leidi (Semana 9)
const LeidiBingo = lazyPartTwo(() => import('./pages/parte2/LeidiBingo').then(m => ({ default: m.LeidiBingo })));
const LeidiDetectives = lazyPartTwo(() => import('./pages/parte2/LeidiDetectives').then(m => ({ default: m.LeidiDetectives })));

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
  const { pathname } = useLocation();
  const routes = (
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Home & Direct Part Views */}
              <Route path="/" element={<Home />} />
              <Route path="/parte-1" element={<Home defaultPart={1} />} />
              <Route path="/parte-2" element={<Home defaultPart={2} />} />

              {/* Parte 1: Direct QR scan activities */}
              <Route path="/semana/1" element={<Semana1Crossword />} />
              <Route path="/semana/2" element={<Semana2Quiz />} />
              <Route path="/semana/3" element={<Semana3Matching />} />
              <Route path="/semana/4" element={<Semana4Cloze />} />
              <Route path="/semana/5" element={<Semana5WordSearch />} />
              <Route path="/maraton" element={<Maraton />} />
              <Route path="/semana/6" element={<Maraton />} />

              {/* Parte 2: Actividades de Camila */}
              <Route path="/parte-2/camila/ruleta" element={<CamilaRuleta />} />
              <Route path="/parte-2/camila/desafio" element={<CamilaDesafio />} />
              <Route path="/parte-2/camila/detectives" element={<CamilaDetectives />} />
              <Route path="/parte-2/camila/bingo" element={<CamilaBingo />} />
              <Route path="/parte-2/camila/carrera" element={<CamilaCarrera />} />
              <Route path="/parte-2/camila/experto" element={<CamilaExperto />} />
              <Route path="/parte-2/camila/batalla" element={<CamilaBatalla />} />
              <Route path="/parte-2/camila/semaforo" element={<CamilaSemaforo />} />

              {/* Parte 2: Actividades de Leidi */}
              <Route path="/parte-2/leidi/bingo" element={<LeidiBingo />} />
              <Route path="/parte-2/leidi/detectives" element={<LeidiDetectives />} />

              <Route path="/parte-2/*" element={<Navigate to="/parte-2" replace />} />

              {/* QR Management and Book printing */}
              <Route path="/qr" element={<QRManager />} />

              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
  );
  return (
    <div className="app-container">
      <Header />
      <main style={{ flex: 1, width: '100%' }}>
        {pathname.startsWith('/parte-2/') ? (
          <PartTwoBoundary key={pathname}>{routes}</PartTwoBoundary>
        ) : routes}
      </main>
    </div>
  );
};

export const App = () => <BrowserRouter><AppShell /></BrowserRouter>;
export default App;
