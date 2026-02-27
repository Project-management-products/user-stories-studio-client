import { useState } from "react";
import ReactMarkdown from "react-markdown";

// ─── Mock generateContent (replace with your real function) ───────────────────
async function generateContent(projectInfo, requirement) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: `PROYECTO:\n${JSON.stringify(projectInfo, null, 2)}\n\nREQUERIMIENTO:\n${requirement.text}`,
        },
      ],
    }),
  });
  const data = await response.json();
  return data.content?.map((c) => c.text).join("") || "Sin respuesta";
}

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ["Proyecto y Requerimientos", "Iteración", "Análisis"];
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 40 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: i <= current ? "#1a1a2e" : "#e8e8e8",
                color: i <= current ? "#c8f135" : "#999",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 6px", fontWeight: 700, fontSize: 14,
                fontFamily: "'DM Mono', monospace", transition: "all 0.3s",
              }}
            >
              {i + 1}
            </div>
            <div style={{ fontSize: 11, fontWeight: i === current ? 700 : 400, color: i === current ? "#1a1a2e" : "#999", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {s}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ height: 2, flex: 1, background: i < current ? "#1a1a2e" : "#e8e8e8", transition: "all 0.3s", marginBottom: 24 }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── STEP 1: PROYECTO Y REQUERIMIENTOS (fusionado) ───────────────────────────
function StepProjectAndRequirements({ data, onChangeData, requirements, onChangeReqs, onNext }) {
  const [input, setInput] = useState("");

  const addReq = () => {
    const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const newReqs = lines.map((text, i) => ({ id: Date.now() + i, text, status: "pending" }));
    onChangeReqs([...requirements, ...newReqs]);
    setInput("");
  };

  const remove = (id) => onChangeReqs(requirements.filter((r) => r.id !== id));

  const canContinue = data.name && data.objective && requirements.length > 0;

  return (
    <div>
      {/* ── Información del Proyecto ── */}
      <h2 style={styles.sectionTitle}>Información del Proyecto</h2>
      <p style={styles.hint}>Describe el contexto general. Esto se usará como base para analizar cada requerimiento.</p>
      {[
        { key: "name", label: "Nombre del Proyecto", placeholder: "ej. Sistema de Gestión de Inventarios" },
        { key: "objective", label: "Objetivo Principal", placeholder: "¿Qué problema resuelve este proyecto?" },
        { key: "audience", label: "Usuarios / Audiencia", placeholder: "¿Quiénes usarán el sistema?" },
        { key: "context", label: "Contexto Adicional", placeholder: "Tecnologías, restricciones, integraciones..." },
      ].map(({ key, label, placeholder }) => (
        <div key={key} style={{ marginBottom: 20 }}>
          <label style={styles.label}>{label}</label>
          <textarea value={data[key] || ""} onChange={(e) => onChangeData({ ...data, [key]: e.target.value })} placeholder={placeholder} rows={key === "context" ? 4 : 2} style={styles.textarea} />
        </div>
      ))}

      {/* ── Divider ── */}
      <div style={{ borderTop: "2px solid #ebebeb", margin: "28px 0" }} />

      {/* ── Requerimientos ── */}
      <h2 style={{ ...styles.sectionTitle, marginTop: 0 }}>Requerimientos</h2>
      <p style={styles.hint}>Ingresa uno o varios requerimientos (uno por línea). Puedes agregar en múltiples rondas.</p>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={"El sistema debe permitir login con Google\nEl usuario puede exportar reportes en PDF\n..."} rows={5} style={styles.textarea} />
      <button onClick={addReq} disabled={!input.trim()} style={{ ...styles.btnSecondary, marginBottom: 28, opacity: !input.trim() ? 0.4 : 1 }}>
        + Agregar Requerimiento(s)
      </button>

      {requirements.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={styles.listHeader}>{requirements.length} requerimiento{requirements.length !== 1 ? "s" : ""} cargado{requirements.length !== 1 ? "s" : ""}</div>
          {requirements.map((r, i) => (
            <div key={r.id} style={styles.reqCard}>
              <span style={styles.reqNum}>#{i + 1}</span>
              <span style={{ flex: 1, fontSize: 14, color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif" }}>{r.text}</span>
              <button onClick={() => remove(r.id)} style={styles.btnRemove} title="Eliminar">×</button>
            </div>
          ))}
        </div>
      )}

      <button onClick={onNext} disabled={!canContinue} style={{ ...styles.btnPrimary, opacity: !canContinue ? 0.4 : 1 }}>
        Iterar Requerimientos →
      </button>
    </div>
  );
}

// ─── STEP 3: ITERATION ────────────────────────────────────────────────────────
function StepIteration({ requirements, onChange, onNext, onBack }) {
  const [selected, setSelected] = useState(null);
  const [editText, setEditText] = useState("");
  const [splitText, setSplitText] = useState("");
  const [mode, setMode] = useState(null);

  const openEdit = (req) => { setSelected(req); setEditText(req.text); setSplitText(""); setMode("edit"); };
  const openSplit = (req) => { setSelected(req); setEditText(req.text); setSplitText(""); setMode("split"); };

  const saveEdit = () => {
    onChange(requirements.map((r) => r.id === selected.id ? { ...r, text: editText, status: "edited" } : r));
    setSelected(null); setMode(null);
  };

  const saveSplit = () => {
    const lines = splitText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const newReqs = lines.map((text, i) => ({ id: Date.now() + i + 1, text, status: "derived", derivedFrom: selected.id }));
    onChange([...requirements.map((r) => r.id === selected.id ? { ...r, text: editText, status: "edited" } : r), ...newReqs]);
    setSelected(null); setMode(null); setSplitText("");
  };

  const markApproved = (id) => onChange(requirements.map((r) => r.id === id ? { ...r, status: "approved" } : r));
  const removeReq = (id) => onChange(requirements.filter((r) => r.id !== id));

  const statusColors = {
    pending: { bg: "#f5f5f5", text: "#888", label: "Pendiente" },
    edited: { bg: "#fff9e6", text: "#b07d00", label: "Editado" },
    approved: { bg: "#e8f5e0", text: "#3a7d1e", label: "Aprobado" },
    derived: { bg: "#e8f0ff", text: "#2952a3", label: "Derivado" },
  };

  return (
    <div>
      <h2 style={styles.sectionTitle}>Iterar Requerimientos</h2>
      <p style={styles.hint}>Revisa cada requerimiento. Puedes aprobarlo, editarlo, dividirlo en varios, o eliminarlo.</p>

      <div style={{ marginBottom: 24 }}>
        {requirements.map((r, i) => {
          const sc = statusColors[r.status] || statusColors.pending;
          return (
            <div key={r.id} style={{ ...styles.reqCard, background: selected?.id === r.id ? "#f0f4ff" : "#fafafa", border: selected?.id === r.id ? "2px solid #1a1a2e" : "2px solid #ebebeb", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
              <div style={{ display: "flex", width: "100%", alignItems: "center", gap: 10 }}>
                <span style={styles.reqNum}>#{i + 1}</span>
                <span style={{ flex: 1, fontSize: 14, color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif" }}>{r.text}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: sc.bg, color: sc.text, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
                  {sc.label}
                </span>
              </div>
              {r.derivedFrom && (
                <div style={{ fontSize: 11, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>
                  ↳ Derivado de #{requirements.findIndex((x) => x.id === r.derivedFrom) + 1}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => markApproved(r.id)} style={styles.btnAction("#3a7d1e", "#e8f5e0")}>✓ Aprobar</button>
                <button onClick={() => openEdit(r)} style={styles.btnAction("#b07d00", "#fff9e6")}>✎ Editar</button>
                <button onClick={() => openSplit(r)} style={styles.btnAction("#2952a3", "#e8f0ff")}>⊕ Separar</button>
                <button onClick={() => removeReq(r.id)} style={styles.btnAction("#c0392b", "#fdecea")}>✕ Eliminar</button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div style={{ background: "#fff", border: "2px solid #1a1a2e", borderRadius: 12, padding: 24, marginBottom: 28 }}>
          <h3 style={{ marginTop: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#1a1a2e" }}>
            {mode === "edit" ? "Editar Requerimiento" : "Separar Requerimiento"}
          </h3>
          <label style={styles.label}>{mode === "edit" ? "Texto del requerimiento" : "Requerimiento base (puedes modificarlo)"}</label>
          <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} style={styles.textarea} />
          {mode === "split" && (
            <>
              <label style={styles.label}>Nuevos requerimientos derivados (uno por línea)</label>
              <textarea value={splitText} onChange={(e) => setSplitText(e.target.value)} placeholder={"Sub-requerimiento A\nSub-requerimiento B\n..."} rows={4} style={styles.textarea} />
            </>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={mode === "edit" ? saveEdit : saveSplit} disabled={mode === "split" && !splitText.trim()} style={{ ...styles.btnPrimary, opacity: mode === "split" && !splitText.trim() ? 0.4 : 1 }}>
              Guardar
            </button>
            <button onClick={() => { setSelected(null); setMode(null); }} style={styles.btnGhost}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onBack} style={styles.btnGhost}>← Atrás</button>
        <button onClick={onNext} style={styles.btnPrimary}>Generar Análisis →</button>
      </div>
    </div>
  );
}

// ─── STEP 4: ANALYSIS ─────────────────────────────────────────────────────────
function StepAnalysis({ projectInfo, requirements, onBack }) {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const analyze = async (req) => {
    setLoading((l) => ({ ...l, [req.id]: true }));
    try {
      const result = await generateContent(projectInfo, req);
      setResults((r) => ({ ...r, [req.id]: result }));
    } catch (e) {
      const message = e.name === 'TypeError' && e.message === 'Failed to fetch'
        ? 'No se pudo conectar con el servidor. Intenta más tarde.'
        : e.message;
      setResults((r) => ({ ...r, [req.id]: `Error: ${message}` }));
    } finally {
      setLoading((l) => ({ ...l, [req.id]: false }));
    }
  };

  const approvedReqs = requirements.filter((r) => r.status === "approved");

  const analyzeAll = async () => {
    for (const req of approvedReqs) await analyze(req);
  };

  const anyLoading = Object.values(loading).some(Boolean);

  return (
    <div>
      <h2 style={styles.sectionTitle}>Análisis & Historias de Usuario</h2>
      <p style={styles.hint}>
        Envía los requerimientos a <code style={{ background: "#f0f0f0", padding: "1px 6px", borderRadius: 4, fontSize: 13 }}>generateContent</code> para obtener el análisis.
        Solo los requerimientos <strong>aprobados</strong> pueden analizarse.
      </p>

      {approvedReqs.length === 0 && (
        <div style={{ background: "#fff9e6", border: "2px solid #f0c040", borderRadius: 10, padding: "14px 18px", marginBottom: 24, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#7a5c00" }}>
          ⚠️ No hay requerimientos aprobados. Regresa al paso de <strong>Iteración</strong> y aprueba al menos uno antes de continuar.
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <button onClick={onBack} style={styles.btnGhost}>← Atrás</button>
        <button onClick={analyzeAll} disabled={anyLoading || approvedReqs.length === 0} style={{ ...styles.btnPrimary, opacity: anyLoading || approvedReqs.length === 0 ? 0.5 : 1 }}>
          {anyLoading ? "Analizando..." : "⚡ Analizar Todos los Aprobados"}
        </button>
      </div>

      {requirements.map((r, i) => {
        const isApproved = r.status === "approved";
        const statusColors = {
          pending: { bg: "#f5f5f5", text: "#888", label: "Pendiente" },
          edited: { bg: "#fff9e6", text: "#b07d00", label: "Editado" },
          approved: { bg: "#e8f5e0", text: "#3a7d1e", label: "Aprobado" },
          derived: { bg: "#e8f0ff", text: "#2952a3", label: "Derivado" },
        };
        const sc = statusColors[r.status] || statusColors.pending;
        return (
          <div key={r.id} style={{ background: isApproved ? "#fafafa" : "#f8f8f8", border: `2px solid ${isApproved ? "#ebebeb" : "#e8e8e8"}`, borderRadius: 12, padding: 20, marginBottom: 16, opacity: isApproved ? 1 : 0.65 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <span style={styles.reqNum}>#{i + 1}</span>
              <span style={{ flex: 1, fontSize: 14, color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif" }}>{r.text}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: sc.bg, color: sc.text, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
                {sc.label}
              </span>
              <button
                onClick={() => analyze(r)}
                disabled={!isApproved || loading[r.id]}
                title={!isApproved ? "Solo los requerimientos aprobados pueden analizarse" : ""}
                style={{ ...styles.btnSecondary, opacity: !isApproved || loading[r.id] ? 0.35 : 1, whiteSpace: "nowrap", cursor: !isApproved ? "not-allowed" : "pointer" }}
              >
                {loading[r.id] ? "..." : results[r.id] ? "↺ Re-analizar" : "Analizar"}
              </button>
            </div>
            {r.derivedFrom && (
              <div style={{ fontSize: 11, color: "#888", fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>
                ↳ Derivado de #{requirements.findIndex((x) => x.id === r.derivedFrom) + 1}
              </div>
            )}
            {loading[r.id] && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0" }}>
                <div style={styles.spinner} />
                <span style={{ fontSize: 13, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>Generando análisis...</span>
              </div>
            )}
            {results[r.id] && !loading[r.id] && (
              <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: 16, fontSize: 13, color: "#333", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
                <ReactMarkdown>{results[r.id]}</ReactMarkdown>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  sectionTitle: { fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginTop: 0, marginBottom: 8 },
  hint: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#666", marginBottom: 24, lineHeight: 1.6 },
  label: { display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 6, letterSpacing: "0.03em" },
  textarea: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "2px solid #e0e0e0", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1a1a2e", resize: "vertical", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box", lineHeight: 1.6 },
  btnPrimary: { background: "#1a1a2e", color: "#c8f135", border: "none", borderRadius: 8, padding: "10px 22px", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.2s" },
  btnSecondary: { background: "#fff", color: "#1a1a2e", border: "2px solid #1a1a2e", borderRadius: 8, padding: "8px 18px", fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.03em" },
  btnGhost: { background: "transparent", color: "#888", border: "2px solid #e0e0e0", borderRadius: 8, padding: "10px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer" },
  btnRemove: { background: "transparent", border: "none", color: "#ccc", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px" },
  btnAction: (color, bg) => ({ background: bg, color: color, border: `1.5px solid ${color}33`, borderRadius: 6, padding: "4px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }),
  reqCard: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, border: "2px solid #ebebeb", background: "#fafafa", marginBottom: 10, transition: "all 0.2s" },
  reqNum: { fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa", fontWeight: 700, minWidth: 28 },
  listHeader: { fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 },
  spinner: { width: 16, height: 16, border: "2px solid #e0e0e0", borderTopColor: "#1a1a2e", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [projectInfo, setProjectInfo] = useState({});
  const [requirements, setRequirements] = useState([]);

  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600&display=swap');
  
  * { box-sizing: border-box; }
  body { 
    margin: 0; 
    background: #f2f2f0;
    /* --- Agrega esto para centrar --- */
    display: flex;
    justify-content: center; /* Centrado horizontal */
    align-items: center;     /* Centrado vertical */
    min-height: 100vh;       /* Asegura que use todo el alto de la pantalla */
  }
  textarea:focus { border-color: #1a1a2e !important; }
  @keyframes spin { to { transform: rotate(360deg); } }
`}</style>
      <div style={{ minHeight: "100vh", background: "#f2f2f0", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 720 }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "inline-block", background: "#1a1a2e", color: "#c8f135", fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 4, marginBottom: 12 }}>
              Requirements Studio
            </div>
            <h1 style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 32, fontWeight: 700, color: "#1a1a2e", margin: 0, lineHeight: 1.2 }}>
              Generador de Historias de Usuario
            </h1>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 36, boxShadow: "0 2px 24px rgba(0,0,0,0.07)" }}>
            <Steps current={step} />
            {step === 0 && <StepProjectAndRequirements data={projectInfo} onChangeData={setProjectInfo} requirements={requirements} onChangeReqs={setRequirements} onNext={() => setStep(1)} />}
            {step === 1 && <StepIteration requirements={requirements} onChange={setRequirements} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
            {step === 2 && <StepAnalysis projectInfo={projectInfo} requirements={requirements} onBack={() => setStep(1)} />}
          </div>
        </div>
      </div>
    </>
  );
}