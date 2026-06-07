import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import EditorPage from '@/pages/EditorPage';
import PlayerPage from '@/pages/PlayerPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/player/:id" element={<PlayerPage />} />
        <Route path="/play/*" element={<PlayerPage />} />
      </Routes>
    </Router>
  );
}
