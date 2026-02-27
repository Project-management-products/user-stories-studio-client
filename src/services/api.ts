import { ProjectData, Requirement } from "../types";

export async function generateContent(projectInfo: ProjectData, requirement: Requirement): Promise<string> {
    const apiUrl = (import.meta as any).env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/api/generate`, {
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

    if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content?.map((c: any) => c.text).join("") || "Sin respuesta";
}
