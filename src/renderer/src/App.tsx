import { HashRouter, Routes, Route } from "react-router-dom";
import Overview from "@renderer/pages/Overview";
import MainLayout from "@renderer/layouts/MainLayout";
import { Toaster } from "react-hot-toast";
import GrabPage from "@renderer/pages/GrabPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Overview />} />
          <Route path="recon/grab" element={<GrabPage />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" reverseOrder={false} />
    </HashRouter>
  );
}

export default App;
