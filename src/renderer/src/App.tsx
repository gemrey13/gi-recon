import { HashRouter, Routes, Route } from "react-router-dom";
import Overview from "@renderer/pages/Overview";
import MainLayout from "@renderer/layouts/MainLayout";
import { Toaster } from "react-hot-toast";
import GrabPage from "@renderer/pages/GrabPage";
import PandaPage from "@renderer/pages/PandaPage";
import ReportsPage from "@renderer/pages/ReportPage";
import SettingsPage from "@renderer/pages/SettingsPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Overview />} />
          <Route path="recon/panda" element={<PandaPage />} />
          <Route path="recon/grab" element={<GrabPage />} />
          <Route path="recon/reports" element={<ReportsPage />} />
          <Route path="recon/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" reverseOrder={false} />
    </HashRouter>
  );
}

export default App;
