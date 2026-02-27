import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useProject } from "./context/ProjectContext";
import { Steps } from "./components/Steps";
import { StepProjectAndRequirements } from "./components/StepProjectAndRequirements";
import { StepIteration } from "./components/StepIteration";
import { StepAnalysis } from "./components/StepAnalysis";
import { Sparkles } from "lucide-react";

function AppContent() {
  const { step, setStep } = useProject();
  const location = useLocation();
  const navigate = useNavigate();

  // Sync step indicator with route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/project") setStep(0);
    else if (path === "/iteration") setStep(1);
    else if (path === "/analysis") setStep(2);
  }, [location.pathname, setStep]);

  return (
    <div className="min-h-screen bg-[#f2f2f0] flex flex-col items-center py-10 px-5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        textarea:focus { border-color: #1a1a2e !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <header className="w-full max-w-[1000px] mb-9">
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-block bg-[#1a1a2e] text-[#c8f135] font-mono text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded">
            Requirements Studio
          </div>
          <Sparkles className="w-4 h-4 text-[#1a1a2e]" />
        </div>
        <h1 className="text-center font-sans text-3xl font-bold text-[#1a1a2e] leading-tight">
          Generador de Historias de Usuario
        </h1>
      </header>

      <main className="w-full max-w-[1000px] bg-white rounded-2xl p-9 shadow-[0_2px_24px_rgba(0,0,0,0.07)]">
        <section aria-label="Navegación de pasos">
          <Steps current={step} />
        </section>

        <section>
          <Routes>
            <Route path="/" element={<Navigate to="/project" replace />} />
            <Route path="/project" element={<StepProjectAndRequirements />} />
            <Route path="/iteration" element={<StepIteration />} />
            <Route path="/analysis" element={<StepAnalysis />} />
          </Routes>
        </section>
      </main>

      <footer className="mt-12 text-[#888] font-sans text-xs uppercase tracking-widest">
        &copy; {new Date().getFullYear()} User Stories Studio
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
