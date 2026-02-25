import { useState } from "react";

// ─── Mock generateContent (reemplaza con tu función real) ─────────────────────
async function generateContent(payload) {
  // const response = await fetch("https://api.anthropic.com/v1/messages", {
  const response = await fetch("http://localhost:3001/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: `Proyecto: ${payload.projectName}
Contexto: ${payload.projectContext}
Requerimiento: ${payload.requirement}
`
        }
      ]
    })
  });
  const data = await response.json();
  return data.content?.map(i => i.text || "").join("\n") || "Sin respuesta";
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconSplit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
    <path d="m15 9 6-6" />
  </svg>
);
const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconLoader = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS = {
  pending: { label: "Pendiente", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  approved: { label: "Aprobado", color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  modified: { label: "Modificado", color: "#fb923c", bg: "rgba(251,146,60,0.1)" },
  analyzed: { label: "Analizado", color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
};

let idCounter = 1;
const newReq = (text, parentId = null) => ({
  id: idCounter++,
  text,
  parentId,
  status: "pending",
  analysis: null,
  loading: false,
});

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("setup"); // setup | review | results
  const [project, setProject] = useState({ name: "", context: "" });
  const [rawReqs, setRawReqs] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [splitId, setSplitId] = useState(null);
  const [splitParts, setSplitParts] = useState(["", ""]);
  const [results, setResults] = useState([]);

  // ── SETUP ──────────────────────────────────────────────────────────────────
  function handleSetup() {
    if (!project.name.trim() || !rawReqs.trim()) return;
    const reqs = rawReqs
      .split("\n")
      .map(l => l.replace(/^[-*•\d+.]+\s*/, "").trim())
      .filter(Boolean)
      .map(t => newReq(t));
    setRequirements(reqs);
    setStep("review");
  }

  // ── SELECTION ──────────────────────────────────────────────────────────────
  function toggleSelect(id) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function selectAll() {
    setSelected(new Set(requirements.map(r => r.id)));
  }

  // ── APPROVE ────────────────────────────────────────────────────────────────
  function approveReq(id) {
    setRequirements(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
  }

  // ── EDIT ───────────────────────────────────────────────────────────────────
  function startEdit(req) {
    setEditingId(req.id);
    setEditText(req.text);
  }
  function saveEdit(id) {
    setRequirements(prev => prev.map(r =>
      r.id === id ? { ...r, text: editText, status: "modified" } : r
    ));
    setEditingId(null);
  }

  // ── SPLIT ──────────────────────────────────────────────────────────────────
  function startSplit(req) {
    setSplitId(req.id);
    setSplitParts([req.text, ""]);
  }
  function saveSplit() {
    const parts = splitParts.filter(p => p.trim());
    if (parts.length < 2) return;
    setRequirements(prev => {
      const idx = prev.findIndex(r => r.id === splitId);
      const newReqs = parts.map((p, i) =>
        i === 0 ? { ...prev[idx], text: p, status: "modified" } : newReq(p, splitId)
      );
      return [...prev.slice(0, idx), ...newReqs, ...prev.slice(idx + 1)];
    });
    setSplitId(null);
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────
  function deleteReq(id) {
    setRequirements(prev => prev.filter(r => r.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  // ── ANALYZE ────────────────────────────────────────────────────────────────
  async function analyzeOne(req) {
    setRequirements(prev => prev.map(r => r.id === req.id ? { ...r, loading: true } : r));
    try {
      const analysis = await generateContent({
        projectName: project.name,
        projectContext: project.context,
        requirement: req.text,
      });
      setRequirements(prev => prev.map(r =>
        r.id === req.id ? { ...r, loading: false, status: "analyzed", analysis } : r
      ));
      setResults(prev => {
        const existing = prev.findIndex(x => x.id === req.id);
        const entry = { id: req.id, text: req.text, analysis };
        return existing >= 0
          ? prev.map((x, i) => i === existing ? entry : x)
          : [...prev, entry];
      });
    } catch (e) {
      setRequirements(prev => prev.map(r => r.id === req.id ? { ...r, loading: false } : r));
    }
  }

  async function analyzeSelected() {
    const toAnalyze = requirements.filter(r => selected.has(r.id));
    for (const req of toAnalyze) await analyzeOne(req);
    if (toAnalyze.length > 0) setStep("results");
  }

  async function analyzeAll() {
    selectAll();
    const all = requirements;
    for (const req of all) await analyzeOne(req);
    setStep("results");
  }

  // ─── STYLES ──────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
    body{background:#0a0a0f;color:#e2e8f0;font-family:'Syne',sans-serif;min-height:100vh}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
    .app{max-width:860px;margin:0 auto;padding:40px 24px;animation:fadeIn .5s ease}
    .header{margin-bottom:48px}
    .header-badge{font-family:'JetBrains Mono',monospace;font-size:11px;color:#4f46e5;letter-spacing:.15em;text-transform:uppercase;margin-bottom:12px}
    .header h1{font-size:clamp(28px,5vw,44px);font-weight:800;line-height:1.1;color:#f8fafc}
    .header h1 span{color:#4f46e5}
    .steps{display:flex;gap:8px;margin-top:20px;align-items:center}
    .step-dot{width:8px;height:8px;border-radius:50%;background:#1e1e2e;border:2px solid #2d2d44;transition:all .3s}
    .step-dot.active{background:#4f46e5;border-color:#4f46e5;box-shadow:0 0 12px rgba(79,70,229,.5)}
    .step-dot.done{background:#1e293b;border-color:#4ade80}
    .step-label{font-family:'JetBrains Mono',monospace;font-size:11px;color:#475569;margin-left:8px}
    
    .card{background:#0f0f1a;border:1px solid #1e1e2e;border-radius:12px;padding:28px;margin-bottom:16px;animation:fadeIn .4s ease}
    .card-title{font-size:13px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:.1em;margin-bottom:20px;display:flex;align-items:center;gap:8px}
    .card-title::before{content:'';display:block;width:3px;height:14px;background:#4f46e5;border-radius:2px}
    
    label{display:block;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
    input,textarea{width:100%;background:#070710;border:1px solid #1e1e2e;border-radius:8px;padding:12px 14px;color:#e2e8f0;font-family:'Syne',sans-serif;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s;resize:vertical}
    input:focus,textarea:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.15)}
    textarea{min-height:140px;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.6}
    .hint{font-size:12px;color:#334155;margin-top:6px;font-family:'JetBrains Mono',monospace}
    
    .btn{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;border-radius:8px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;transition:all .2s;white-space:nowrap}
    .btn:disabled{opacity:.4;cursor:not-allowed}
    .btn-primary{background:#4f46e5;color:#fff}
    .btn-primary:hover:not(:disabled){background:#4338ca;box-shadow:0 0 20px rgba(79,70,229,.35)}
    .btn-ghost{background:transparent;color:#64748b;border:1px solid #1e1e2e}
    .btn-ghost:hover:not(:disabled){background:#111827;color:#94a3b8;border-color:#2d2d44}
    .btn-success{background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.2)}
    .btn-success:hover:not(:disabled){background:rgba(74,222,128,.2)}
    .btn-danger{background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.15)}
    .btn-danger:hover:not(:disabled){background:rgba(248,113,113,.2)}
    .btn-sm{padding:6px 12px;font-size:12px}
    
    .req-item{background:#070710;border:1px solid #1e1e2e;border-radius:10px;padding:16px;margin-bottom:10px;transition:all .2s;animation:slideIn .3s ease}
    .req-item:hover{border-color:#2d2d44}
    .req-item.selected{border-color:#4f46e5;background:rgba(79,70,229,.04)}
    .req-header{display:flex;align-items:flex-start;gap:12px}
    .req-checkbox{width:18px;height:18px;border-radius:4px;border:2px solid #2d2d44;background:transparent;cursor:pointer;flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .req-checkbox.checked{background:#4f46e5;border-color:#4f46e5}
    .req-num{font-family:'JetBrains Mono',monospace;font-size:11px;color:#334155;flex-shrink:0;margin-top:3px;min-width:24px}
    .req-text{flex:1;font-size:14px;line-height:1.6;color:#cbd5e1}
    .req-actions{display:flex;gap:6px;flex-shrink:0;margin-top:-2px}
    .req-meta{display:flex;align-items:center;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid #0f0f1a}
    .status-badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;font-family:'JetBrains Mono',monospace}
    .parent-badge{font-size:11px;color:#334155;font-family:'JetBrains Mono',monospace}
    
    .edit-area{margin-top:12px}
    .split-area{margin-top:12px;display:flex;flex-direction:column;gap:8px}
    .split-header{font-size:12px;color:#6366f1;font-family:'JetBrains Mono',monospace;margin-bottom:4px}
    
    .analysis-box{margin-top:12px;background:#0a0a14;border:1px solid #1a1a2e;border-radius:8px;padding:14px}
    .analysis-label{font-size:11px;color:#4f46e5;font-family:'JetBrains Mono',monospace;margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em}
    .analysis-text{font-size:13px;line-height:1.7;color:#94a3b8;white-space:pre-wrap;font-family:'JetBrains Mono',monospace}
    
    .toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #111827}
    .divider{width:1px;height:28px;background:#1e1e2e;margin:0 4px}
    
    .result-item{background:#070710;border:1px solid #1e1e2e;border-radius:10px;margin-bottom:12px;overflow:hidden;animation:slideIn .4s ease}
    .result-header{padding:14px 18px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:background .2s}
    .result-header:hover{background:#0f0f1a}
    .result-num{font-family:'JetBrains Mono',monospace;font-size:11px;color:#4f46e5;min-width:28px}
    .result-title{flex:1;font-size:14px;color:#e2e8f0;font-weight:600}
    .result-body{padding:0 18px 18px;border-top:1px solid #0f0f1a}
    .result-req{font-size:13px;color:#6366f1;font-family:'JetBrains Mono',monospace;padding:10px 0;border-bottom:1px solid #0f0f1a;margin-bottom:12px}
    
    .empty{text-align:center;padding:48px;color:#334155;font-family:'JetBrains Mono',monospace;font-size:13px}
    .flex{display:flex}.gap-8{gap:8px}.gap-16{gap:16px}.mb-16{margin-bottom:16px}.mb-24{margin-bottom:24px}.mt-8{margin-top:8px}.mt-16{margin-top:16px}
    .flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.justify-between{justify-content:space-between}.w-full{width:100%}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    @media(max-width:600px){.grid-2{grid-template-columns:1fr}.req-actions{flex-wrap:wrap}}
  `;

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-badge">Requirements Studio</div>
          <h1>Gestión de<br /><span>Requerimientos</span></h1>
          <div className="steps">
            {["setup", "review", "results"].map((s, i) => (
              <div key={s} className={`step-dot ${step === s ? "active" : (["setup", "review", "results"].indexOf(step) > i ? "done" : "")}`} />
            ))}
            <span className="step-label">
              {step === "setup" ? "01 · Configuración" : step === "review" ? "02 · Revisión" : "03 · Resultados"}
            </span>
          </div>
        </div>

        {/* ── STEP 1: SETUP ── */}
        {step === "setup" && (
          <>
            <div className="card">
              <div className="card-title">Información del Proyecto</div>
              <div className="grid-2">
                <div>
                  <label>Nombre del proyecto</label>
                  <input
                    placeholder="ej. Portal de pagos B2B"
                    value={project.name}
                    onChange={e => setProject(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label>Contexto general</label>
                  <input
                    placeholder="Descripción breve del sistema..."
                    value={project.context}
                    onChange={e => setProject(p => ({ ...p, context: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Requerimientos</div>
              <label>Lista de requerimientos</label>
              <textarea
                placeholder={"- El usuario debe poder iniciar sesión con email y contraseña\n- El sistema debe enviar notificaciones por correo\n- Se debe permitir exportar reportes en PDF\n..."}
                value={rawReqs}
                onChange={e => setRawReqs(e.target.value)}
                style={{ minHeight: 200 }}
              />
              <div className="hint">Un requerimiento por línea. Puedes usar guiones, números o texto libre.</div>
              <div className="mt-16">
                <button
                  className="btn btn-primary"
                  onClick={handleSetup}
                  disabled={!project.name.trim() || !rawReqs.trim()}
                >
                  Continuar a revisión <IconArrow />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: REVIEW ── */}
        {step === "review" && (
          <>
            <div className="card">
              <div className="card-title">Revisión de Requerimientos</div>
              <div style={{ fontSize: 13, color: "#475569", marginBottom: 20, fontFamily: "'JetBrains Mono',monospace" }}>
                Proyecto: <span style={{ color: "#818cf8" }}>{project.name}</span>
                {" · "}{requirements.length} requerimientos
              </div>

              {/* Toolbar */}
              <div className="toolbar">
                <button className="btn btn-ghost btn-sm" onClick={selectAll}>
                  Seleccionar todos
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
                  Limpiar selección
                </button>
                <div className="divider" />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={analyzeSelected}
                  disabled={selected.size === 0}
                >
                  <IconSend /> Analizar seleccionados ({selected.size})
                </button>
                <button className="btn btn-ghost btn-sm" onClick={analyzeAll}>
                  <IconSend /> Analizar todos
                </button>
              </div>

              {/* Requirements list */}
              {requirements.length === 0 && (
                <div className="empty">No hay requerimientos</div>
              )}

              {requirements.map((req, idx) => (
                <div key={req.id} className={`req-item ${selected.has(req.id) ? "selected" : ""}`}>
                  {/* Header row */}
                  <div className="req-header">
                    <div
                      className={`req-checkbox ${selected.has(req.id) ? "checked" : ""}`}
                      onClick={() => toggleSelect(req.id)}
                    >
                      {selected.has(req.id) && <IconCheck />}
                    </div>
                    <span className="req-num">#{idx + 1}</span>

                    {editingId === req.id ? (
                      <div className="edit-area" style={{ flex: 1 }}>
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          style={{ minHeight: 80, marginBottom: 8 }}
                        />
                        <div className="flex gap-8">
                          <button className="btn btn-success btn-sm" onClick={() => saveEdit(req.id)}>
                            <IconCheck /> Guardar
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="req-text">{req.text}</span>
                    )}

                    {editingId !== req.id && splitId !== req.id && (
                      <div className="req-actions">
                        <button className="btn btn-ghost btn-sm" title="Aprobar" onClick={() => approveReq(req.id)}>
                          <IconCheck />
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => startEdit(req)}>
                          <IconEdit />
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Dividir" onClick={() => startSplit(req)}>
                          <IconSplit />
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Analizar" onClick={() => analyzeOne(req)} disabled={req.loading}>
                          {req.loading ? <IconLoader /> : <IconSend />}
                        </button>
                        <button className="btn btn-danger btn-sm" title="Eliminar" onClick={() => deleteReq(req.id)}>
                          <IconTrash />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Split UI */}
                  {splitId === req.id && (
                    <div className="split-area">
                      <div className="split-header">Divide en partes (mínimo 2):</div>
                      {splitParts.map((part, i) => (
                        <div key={i} className="flex gap-8 items-center">
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#4f46e5", minWidth: 20 }}>
                            {i + 1}.
                          </span>
                          <input
                            value={part}
                            onChange={e => setSplitParts(prev => prev.map((p, j) => j === i ? e.target.value : p))}
                            placeholder={`Parte ${i + 1}...`}
                          />
                          {splitParts.length > 2 && (
                            <button className="btn btn-danger btn-sm" onClick={() =>
                              setSplitParts(prev => prev.filter((_, j) => j !== i))
                            }>
                              <IconTrash />
                            </button>
                          )}
                        </div>
                      ))}
                      <div className="flex gap-8 mt-8">
                        <button className="btn btn-ghost btn-sm" onClick={() => setSplitParts(p => [...p, ""])}>
                          <IconPlus /> Agregar parte
                        </button>
                        <button className="btn btn-success btn-sm" onClick={saveSplit}>
                          <IconCheck /> Confirmar división
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSplitId(null)}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Meta / Status */}
                  <div className="req-meta">
                    <span
                      className="status-badge"
                      style={{ color: STATUS[req.status].color, background: STATUS[req.status].bg }}
                    >
                      {STATUS[req.status].label}
                    </span>
                    {req.parentId && (
                      <span className="parent-badge">derivado de #{requirements.findIndex(r => r.id === req.parentId) + 1}</span>
                    )}
                    {req.loading && (
                      <span style={{ color: "#6366f1", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", display: "flex", alignItems: "center", gap: 6 }}>
                        <IconLoader /> Analizando...
                      </span>
                    )}
                  </div>

                  {/* Analysis result inline */}
                  {req.analysis && (
                    <div className="analysis-box">
                      <div className="analysis-label">Análisis generado</div>
                      <div className="analysis-text">{req.analysis}</div>
                    </div>
                  )}
                </div>
              ))}

              {results.length > 0 && (
                <div className="mt-16 flex gap-8">
                  <button className="btn btn-primary" onClick={() => setStep("results")}>
                    Ver resultados ({results.length}) <IconArrow />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── STEP 3: RESULTS ── */}
        {step === "results" && (
          <>
            <div className="flex justify-between items-center mb-24">
              <div>
                <div className="header-badge">Análisis completado</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
                  {results.length} requerimiento{results.length !== 1 ? "s" : ""} analizado{results.length !== 1 ? "s" : ""}
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setStep("review")}>
                ← Volver a revisión
              </button>
            </div>

            {results.length === 0 && (
              <div className="empty">No hay análisis generados aún. Vuelve a la revisión y analiza algunos requerimientos.</div>
            )}

            {results.map((result, idx) => {
              const [open, setOpen] = useState(true);
              return (
                <div key={result.id} className="result-item">
                  <div className="result-header" onClick={() => setOpen(o => !o)}>
                    <span className="result-num">#{idx + 1}</span>
                    <span className="result-title">{result.text.slice(0, 80)}{result.text.length > 80 ? "…" : ""}</span>
                    <span style={{ color: "#334155", transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}>
                      <IconArrow />
                    </span>
                  </div>
                  {open && (
                    <div className="result-body">
                      <div className="result-req">{result.text}</div>
                      <div className="analysis-text">{result.analysis}</div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mt-16 flex gap-8 flex-wrap">
              <button className="btn btn-ghost" onClick={() => { setStep("setup"); setRequirements([]); setResults([]); setProject({ name: "", context: "" }); setRawReqs(""); }}>
                Nuevo proyecto
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
