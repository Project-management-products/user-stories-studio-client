import React, { createContext, useContext, useState, ReactNode } from "react";
import { ProjectData, Requirement } from "../types";

interface ProjectContextType {
    step: number;
    setStep: (step: number) => void;
    projectInfo: ProjectData;
    setProjectInfo: (info: ProjectData) => void;
    requirements: Requirement[];
    setRequirements: (reqs: Requirement[]) => void;
    results: Record<number, string>;
    setResults: (results: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => void;
    loading: Record<number, boolean>;
    setLoading: (loading: Record<number, boolean> | ((prev: Record<number, boolean>) => Record<number, boolean>)) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [step, setStep] = useState(0);
    const [projectInfo, setProjectInfo] = useState<ProjectData>({
        name: "",
        objective: "",
        audience: "",
        context: ""
    });
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [results, setResults] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState<Record<number, boolean>>({});

    return (
        <ProjectContext.Provider value={{
            step, setStep,
            projectInfo, setProjectInfo,
            requirements, setRequirements,
            results, setResults,
            loading, setLoading
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
}
