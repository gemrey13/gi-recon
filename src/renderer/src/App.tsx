import { HashRouter, Routes, Route } from 'react-router-dom';
import Overview from '@renderer/pages/Overview';
import MainLayout from '@renderer/layouts/MainLayout';
import ReconPage from '@renderer/pages/ReconPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Overview />} />
          <Route path="recon/panda" element={<ReconPage partner="PANDA" />} />
          <Route path="recon/grab" element={<ReconPage partner="GRAB" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;