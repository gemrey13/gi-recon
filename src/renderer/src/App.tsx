import { HashRouter, Routes, Route } from 'react-router-dom';
import Overview from '@renderer/pages/Overview';
import MainLayout from '@renderer/layouts/MainLayout';
import GrabDashboard from '@renderer/pages/GrabDashboard';
import GrabGroupDetail from '@renderer/pages/GrabGroupDetail';
import { Toaster } from "react-hot-toast";
import TestingPage from '@renderer/pages/TestingPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Overview />} />
          <Route path="recon/grab" element={<GrabDashboard />} />
          <Route path="recon/grab/record" element={<GrabGroupDetail />} />
          <Route path="recon/test" element={<TestingPage />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" reverseOrder={false} />
    </HashRouter>
  );
}

export default App;