import { Fragment } from "react";

interface StepsProps {
    current: number;
}

export function Steps({ current }: StepsProps) {
    const steps = ["Proyecto y Requerimientos", "Iteración", "Análisis"];

    return (
        <div className="flex items-center relative max-w-[600px] mx-auto mb-[60px]">
            {steps.map((s, i) => (
                <Fragment key={i}>
                    {/* Círculo y Etiqueta */}
                    <div className="flex flex-col items-center w-10 z-10 relative">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-sm font-bold transition-all duration-500 shadow-[0_0_0_4px_#fff] ${i <= current
                                    ? "bg-[#1a1a2e] text-[#c8f135]"
                                    : "bg-[#e8e8e8] text-[#999]"
                                }`}
                        >
                            {i + 1}
                        </div>
                        <div
                            className={`absolute top-[42px] w-[120px] text-center font-sans text-[10px] tracking-widest uppercase transition-all duration-500 ${i === current
                                    ? "text-[#1a1a2e] font-bold"
                                    : "text-[#999] font-normal"
                                }`}
                        >
                            {s}
                        </div>
                    </div>

                    {/* Barra de conexión */}
                    {i < steps.length - 1 && (
                        <div className="flex-1 h-1 mx-[-2px] relative overflow-hidden bg-[#e8e8e8]">
                            <div
                                className="absolute inset-x-0 h-full bg-[#1a1a2e] transition-all duration-700 ease-in-out"
                                style={{
                                    transform: i < current ? "translateX(0)" : "translateX(-100%)"
                                }}
                            />
                        </div>
                    )}
                </Fragment>
            ))}
        </div>
    );
}
