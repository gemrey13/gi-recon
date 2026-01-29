import { HashRouter, Routes, Route } from 'react-router-dom';
import Overview from '@renderer/pages/Overview';
import MainLayout from '@renderer/layouts/MainLayout';
import GrabDashboard from '@renderer/pages/GrabDashboard';
import GrabSessionDetail from '@renderer/pages/GrabSessionDetail';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Overview />} />
          <Route path="recon/grab" element={<GrabDashboard />} />
          <Route path="recon/grab/:sessionId" element={<GrabSessionDetail />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;