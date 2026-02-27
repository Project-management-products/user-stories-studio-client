import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Users, Lightbulb, Puzzle, Plus, X } from "lucide-react";
import { useProject } from "../../context/ProjectContext";
import { Requirement } from "../../types";

export function StepProjectAndRequirements() {
    const { projectInfo: data, setProjectInfo: onChangeData, requirements, setRequirements: onChangeReqs } = useProject();
    const [input, setInput] = useState("");
    const navigate = useNavigate();

    const addReq = () => {
        const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
        if (!lines.length) return;
        const newReqs: Requirement[] = lines.map((text, i) => ({
            id: Date.now() + i,
            text,
            status: "pending" as const
        }));
        onChangeReqs([...requirements, ...newReqs]);
        setInput("");
    };

    const remove = (id: number) => onChangeReqs(requirements.filter((r) => r.id !== id));

    const canContinue = data.name && data.objective && requirements.length > 0;

    return (
        <div className="animate-in fade-in duration-500">
            <h2 className="font-sans text-[22px] font-bold text-[#1a1a2e] mt-0 mb-2">Información del Proyecto</h2>
            <p className="font-sans text-sm text-[#666] mb-6 leading-relaxed">
                Describe el contexto general. Esto se usará como base para analizar cada requerimiento.
            </p>

            <div className="space-y-5">
                {[
                    { key: "name", label: "Nombre del Proyecto", placeholder: "ej. Sistema de Gestión de Inventarios", icon: FileText },
                    { key: "objective", label: "Objetivo Principal", placeholder: "¿Qué problema resuelve este proyecto?", icon: Lightbulb },
                    { key: "audience", label: "Usuarios / Audiencia", placeholder: "¿Quiénes usarán el sistema?", icon: Users },
                    { key: "context", label: "Contexto Adicional", placeholder: "Tecnologías, restricciones, integraciones...", icon: Puzzle },
                ].map(({ key, label, placeholder, icon: Icon }) => (
                    <div key={key}>
                        <label className="block font-sans text-[13px] font-semibold text-[#1a1a2e] mb-1.5 tracking-wide flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 opacity-70" />
                            {label}
                        </label>
                        <textarea
                            value={data[key] || ""}
                            onChange={(e) => onChangeData({ ...data, [key]: e.target.value })}
                            placeholder={placeholder}
                            rows={key === "context" ? 4 : 2}
                            className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#e0e0e0] font-sans text-sm text-[#1a1a2e] resize-none outline-none focus:border-[#1a1a2e] transition-colors leading-relaxed"
                        />
                    </div>
                ))}
            </div>

            <div className="border-t-2 border-[#ebebeb] my-7" />

            <h2 className="font-sans text-[22px] font-bold text-[#1a1a2e] mt-0 mb-2">Requerimientos</h2>
            <p className="font-sans text-sm text-[#666] mb-6 leading-relaxed">
                Ingresa uno o varios requerimientos (uno por línea). Puedes agregar en múltiples rondas.
            </p>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"El sistema debe permitir login con Google\nEl usuario puede exportar reportes en PDF\n..."}
                rows={5}
                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#e0e0e0] font-sans text-sm text-[#1a1a2e] resize-vertical outline-none focus:border-[#1a1a2e] transition-colors leading-relaxed mb-6"
            />

            <button
                onClick={addReq}
                disabled={!input.trim()}
                className="flex items-center gap-2 bg-white text-[#1a1a2e] border-2 border-[#1a1a2e] rounded-lg px-4.5 py-2 font-mono text-xs font-semibold tracking-wide hover:bg-[#1a1a2e] hover:text-[#c8f135] transition-all disabled:opacity-40 disabled:pointer-events-none mb-7"
            >
                <Plus className="w-4 h-4" />
                Agregar Requerimiento(s)
            </button>

            {requirements.length > 0 && (
                <div className="mb-7">
                    <div className="font-mono text-[11px] text-[#888] font-semibold tracking-widest uppercase mb-3">
                        {requirements.length} requerimiento{requirements.length !== 1 ? "s" : ""} cargado{requirements.length !== 1 ? "s" : ""}
                    </div>
                    <div className="space-y-2.5">
                        {requirements.map((r, i) => (
                            <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#ebebeb] bg-[#fafafa] hover:border-[#1a1a2e] transition-all group">
                                <span className="font-mono text-[11px] text-[#aaa] font-bold min-w-[28px]">#{i + 1}</span>
                                <span className="flex-1 text-sm text-[#1a1a2e] font-sans leading-relaxed">{r.text}</span>
                                <button
                                    onClick={() => remove(r.id)}
                                    className="p-1 text-[#ccc] hover:text-red-500 transition-colors"
                                    title="Eliminar"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={() => navigate("/iteration")}
                disabled={!canContinue}
                className="bg-[#1a1a2e] text-[#c8f135] border-none rounded-lg px-5.5 py-2.5 font-mono text-[13px] font-semibold tracking-wider hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
            >
                Iterar Requerimientos →
            </button>
        </div>
    );
}
