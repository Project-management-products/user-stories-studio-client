import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Edit3, PlusSquare, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { useProject } from "../../context/ProjectContext";
import { Requirement } from "../../types";

export function StepIteration() {
    const { requirements, setRequirements: onChange } = useProject();
    const [selected, setSelected] = useState<Requirement | null>(null);
    const [editText, setEditText] = useState("");
    const [splitText, setSplitText] = useState("");
    const [mode, setMode] = useState<'edit' | 'split' | null>(null);
    const navigate = useNavigate();

    const openEdit = (req: Requirement) => { setSelected(req); setEditText(req.text); setSplitText(""); setMode("edit"); };
    const openSplit = (req: Requirement) => { setSelected(req); setEditText(req.text); setSplitText(""); setMode("split"); };

    const saveEdit = () => {
        if (!selected) return;
        onChange(requirements.map((r) => r.id === selected.id ? { ...r, text: editText, status: "edited" as const } : r));
        setSelected(null); setMode(null);
    };

    const saveSplit = () => {
        if (!selected) return;
        const lines = splitText.split("\n").map((l) => l.trim()).filter(Boolean);
        if (!lines.length) return;
        const newReqs: Requirement[] = lines.map((text, i) => ({
            id: Date.now() + i + 1,
            text,
            status: "derived" as const,
            derivedFrom: selected.id
        }));
        onChange([...requirements.map((r) => r.id === selected.id ? { ...r, text: editText, status: "edited" as const } : r), ...newReqs]);
        setSelected(null); setMode(null); setSplitText("");
    };

    const markApproved = (id: number) => onChange(requirements.map((r) => r.id === id ? { ...r, status: "approved" as const } : r));
    const removeReq = (id: number) => onChange(requirements.filter((r) => r.id !== id));

    const statusColors: Record<Requirement['status'], { bg: string, text: string, label: string }> = {
        pending: { bg: "bg-gray-100", text: "text-gray-400", label: "Pendiente" },
        edited: { bg: "bg-amber-100", text: "text-amber-700", label: "Editado" },
        approved: { bg: "bg-green-100", text: "text-green-700", label: "Aprobado" },
        derived: { bg: "bg-blue-100", text: "text-blue-700", label: "Derivado" },
    };

    return (
        <div className="animate-in fade-in duration-500">
            <h2 className="font-sans text-[22px] font-bold text-[#1a1a2e] mt-0 mb-2">Iterar Requerimientos</h2>
            <p className="font-sans text-sm text-[#666] mb-6 leading-relaxed">
                Revisa cada requerimiento. Puedes aprobarlo, editarlo, dividirlo en varios, o eliminarlo.
            </p>

            <div className="space-y-4 mb-8">
                {requirements.map((r, i) => {
                    const sc = statusColors[r.status] || statusColors.pending;
                    const isSelected = selected?.id === r.id;
                    return (
                        <div
                            key={r.id}
                            className={`flex flex-col gap-3 p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-[#1a1a2e] bg-[#f0f4ff]' : 'border-[#ebebeb] bg-[#fafafa]'}`}
                        >
                            <div className="flex w-full items-center gap-3">
                                <span className="font-mono text-[11px] text-[#aaa] font-bold min-w-[28px]">#{i + 1}</span>
                                <span className="flex-1 text-sm text-[#1a1a2e] font-sans leading-relaxed">{r.text}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${sc.bg} ${sc.text} whitespace-nowrap`}>
                                    {sc.label}
                                </span>
                            </div>

                            {r.derivedFrom && (
                                <div className="text-[11px] text-[#888] font-sans ml-10">
                                    ↳ Derivado de #{requirements.findIndex((x) => x.id === r.derivedFrom) + 1}
                                </div>
                            )}

                            <div className="flex gap-2 flex-wrap ml-10 mt-1">
                                <button onClick={() => markApproved(r.id)} className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-green-200 bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors">
                                    <Check className="w-3.5 h-3.5" /> Aprobar
                                </button>
                                <button onClick={() => openEdit(r)} className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors">
                                    <Edit3 className="w-3.5 h-3.5" /> Editar
                                </button>
                                <button onClick={() => openSplit(r)} className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors">
                                    <PlusSquare className="w-3.5 h-3.5" /> Separar
                                </button>
                                <button onClick={() => removeReq(r.id)} className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selected && (
                <div className="bg-white border-2 border-[#1a1a2e] rounded-xl p-6 mb-7 shadow-lg animate-in slide-in-from-bottom-4">
                    <h3 className="mt-0 font-sans text-base font-bold text-[#1a1a2e] mb-4">
                        {mode === "edit" ? "Editar Requerimiento" : "Separar Requerimiento"}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-sans text-[13px] font-semibold text-[#1a1a2e] mb-1.5 tracking-wide">
                                {mode === "edit" ? "Texto del requerimiento" : "Requerimiento base (puedes modificarlo)"}
                            </label>
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={3}
                                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#e0e0e0] font-sans text-sm text-[#1a1a2e] resize-none outline-none focus:border-[#1a1a2e] transition-colors"
                            />
                        </div>

                        {mode === "split" && (
                            <div>
                                <label className="block font-sans text-[13px] font-semibold text-[#1a1a2e] mb-1.5 tracking-wide">
                                    Nuevos requerimientos derivados (uno por línea)
                                </label>
                                <textarea
                                    value={splitText}
                                    onChange={(e) => setSplitText(e.target.value)}
                                    placeholder={"Sub-requerimiento A\nSub-requerimiento B\n..."}
                                    rows={4}
                                    className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#e0e0e0] font-sans text-sm text-[#1a1a2e] resize-none outline-none focus:border-[#1a1a2e] transition-colors"
                                />
                            </div>
                        )}

                        <div className="flex gap-2.5 pt-2">
                            <button
                                onClick={mode === "edit" ? saveEdit : saveSplit}
                                disabled={mode === "split" && !splitText.trim()}
                                className="bg-[#1a1a2e] text-[#c8f135] border-none rounded-lg px-5 py-2 font-mono text-xs font-bold tracking-wider hover:opacity-90 disabled:opacity-40"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={() => { setSelected(null); setMode(null); }}
                                className="bg-transparent text-[#888] border-2 border-[#e0e0e0] rounded-lg px-4 py-2 font-sans text-xs hover:bg-gray-50 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={() => navigate("/project")}
                    className="flex items-center gap-2 bg-transparent text-[#888] border-2 border-[#e0e0e0] rounded-lg px-4.5 py-2 font-sans text-[13px] hover:bg-gray-50 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                    onClick={() => navigate("/analysis")}
                    className="flex items-center gap-2 bg-[#1a1a2e] text-[#c8f135] border-none rounded-lg px-5.5 py-2.5 font-mono text-[13px] font-semibold tracking-wider hover:scale-105 active:scale-95 transition-all"
                >
                    Generar Análisis <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
