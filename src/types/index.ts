export interface Requirement {
    id: number;
    text: string;
    status: 'pending' | 'edited' | 'approved' | 'derived';
    derivedFrom?: number;
}

export interface ProjectData {
    name: string;
    objective: string;
    audience: string;
    context: string;
    [key: string]: string;
}

export interface StepProps {
    onNext?: () => void;
    onBack?: () => void;
}
