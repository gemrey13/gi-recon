import { HashRouter, Routes, Route } from 'react-router-dom';
import Overview from '@renderer/pages/Overview';
import ReconView from '@renderer/pages/ReconView';
import MainLayout from '@renderer/layouts/MainLayout';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Overview />} />
          <Route path="recon/panda" element={<ReconView partner="PANDA" />} />
          <Route path="recon/grab" element={<ReconView partner="GRAB" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;