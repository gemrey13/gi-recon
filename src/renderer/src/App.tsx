import { HashRouter, Routes, Route } from 'react-router-dom';
import Overview from '@renderer/pages/Overview';
import MainLayout from '@renderer/layouts/MainLayout';
import GrabDashboard from '@renderer/pages/GrabDashboard';
import GrabSessionDetail from '@renderer/pages/GrabSessionDetail';
import { Toaster } from "react-hot-toast";

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
      <Toaster position="bottom-right" reverseOrder={false} />
    </HashRouter>
  );
}

export default App;