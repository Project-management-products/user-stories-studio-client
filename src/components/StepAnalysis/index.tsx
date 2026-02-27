import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { AlertCircle, Zap, RotateCcw, ArrowLeft, Loader2 } from "lucide-react";
import { useProject } from "../../context/ProjectContext";
import { Requirement } from "../../types";
import { generateContent } from "../../services/api";

export function StepAnalysis() {
    const { projectInfo, requirements, results, setResults, loading, setLoading } = useProject();
    const navigate = useNavigate();

    const analyze = async (req: Requirement) => {
        setLoading((l) => ({ ...l, [req.id]: true }));
        try {
            const result = await generateContent(projectInfo, req);
            setResults((r) => ({ ...r, [req.id]: result }));
        } catch (e: any) {
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
        <div className="animate-in fade-in duration-500">
            <h2 className="font-sans text-[22px] font-bold text-[#1a1a2e] mt-0 mb-2">Análisis & Historias de Usuario</h2>
            <p className="font-sans text-sm text-[#666] mb-6 leading-relaxed">
                Genera un análisis detallado e historias de usuario a partir de tus requerimientos.
                Solo los requerimientos <strong className="text-green-700">aprobados</strong> pueden ser procesados.
            </p>

            {approvedReqs.length === 0 && (
                <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-7 animate-in bounce-in">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm font-sans text-amber-900 leading-relaxed">
                        <strong>Atención:</strong> No hay requerimientos aprobados. Regresa al paso de <strong>Iteración</strong> y aprueba al menos uno antes de continuar.
                    </div>
                </div>
            )}

            <div className="flex gap-3 mb-8">
                <button
                    onClick={() => navigate("/iteration")}
                    className="flex items-center gap-2 bg-transparent text-[#888] border-2 border-[#e0e0e0] rounded-lg px-4.5 py-2 font-sans text-[13px] hover:bg-gray-50 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                    onClick={analyzeAll}
                    disabled={anyLoading || approvedReqs.length === 0}
                    className="flex items-center gap-2 bg-[#1a1a2e] text-[#c8f135] border-none rounded-lg px-5.5 py-2.5 font-mono text-[13px] font-semibold tracking-wider hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                    {anyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {anyLoading ? "Analizando..." : "⚡ Analizar Todos los Aprobados"}
                </button>
            </div>

            <div className="space-y-4">
                {requirements.map((r, i) => {
                    const isApproved = r.status === "approved";
                    const statusColors: Record<Requirement['status'], { bg: string, text: string, label: string }> = {
                        pending: { bg: "bg-gray-100", text: "text-gray-400", label: "Pendiente" },
                        edited: { bg: "bg-amber-100", text: "text-amber-700", label: "Editado" },
                        approved: { bg: "bg-green-100", text: "text-green-700", label: "Aprobado" },
                        derived: { bg: "bg-blue-100", text: "text-blue-700", label: "Derivado" },
                    };
                    const sc = statusColors[r.status] || statusColors.pending;
                    const isLoading = loading[r.id];
                    const hasResult = results[r.id];

                    return (
                        <div
                            key={r.id}
                            className={`rounded-xl p-5 border-2 transition-all ${isApproved ? 'bg-[#fafafa] border-[#ebebeb]' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <span className="font-mono text-[11px] text-[#aaa] font-bold min-w-[28px] mt-1">#{i + 1}</span>
                                <span className="flex-1 text-sm text-[#1a1a2e] font-sans leading-relaxed">{r.text}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${sc.bg} ${sc.text} whitespace-nowrap mt-0.5`}>
                                    {sc.label}
                                </span>
                                <button
                                    onClick={() => analyze(r)}
                                    disabled={!isApproved || isLoading}
                                    title={!isApproved ? "Solo los requerimientos aprobados pueden analizarse" : ""}
                                    className={`flex items-center gap-1.5 bg-white text-[#1a1a2e] border-2 border-[#1a1a2e] rounded-md px-3 py-1 font-mono text-[11px] font-bold tracking-tight hover:bg-[#1a1a2e] hover:text-[#c8f135] transition-all disabled:opacity-30 disabled:pointer-events-none whitespace-nowrap`}
                                >
                                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : hasResult ? <RotateCcw className="w-3 h-3" /> : null}
                                    {isLoading ? "..." : hasResult ? "Re-analizar" : "Analizar"}
                                </button>
                            </div>

                            {r.derivedFrom && (
                                <div className="text-[11px] text-[#888] font-sans ml-10 mb-3">
                                    ↳ Derivado de #{requirements.findIndex((x) => x.id === r.derivedFrom) + 1}
                                </div>
                            )}

                            {isLoading && (
                                <div className="flex items-center gap-2.5 ml-10 py-3 text-sm text-gray-500 font-sans italic border-t border-dashed border-gray-200">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#1a1a2e]" />
                                    Generando análisis detallado...
                                </div>
                            )}

                            {hasResult && !isLoading && (
                                <div className="ml-10 mt-2 bg-white border border-gray-100 rounded-lg p-6 shadow-sm overflow-hidden">
                                    <div className="prose prose-sm max-w-none text-[#333]">
                                        <ReactMarkdown>{hasResult}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
