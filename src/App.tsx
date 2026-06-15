import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SandboxPage from "@/pages/SandboxPage";
import ReplayPage from "@/pages/ReplayPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/sandbox" replace />} />
        <Route path="/sandbox" element={<SandboxPage />} />
        <Route path="/replay" element={<ReplayPage />} />
        <Route path="*" element={<Navigate to="/sandbox" replace />} />
      </Routes>
    </Router>
  );
}
