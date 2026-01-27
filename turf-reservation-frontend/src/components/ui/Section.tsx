import type { ReactNode } from "react";

interface SectionProps {
    title: string;
    description?: string;
    children?: ReactNode;
}

export default function Section({ title, description, children }: SectionProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {children ? (
                children
            ) : (
                <div className="bg-white p-6 rounded-2xl shadow border text-gray-500 text-sm">
                    {description || "Feature implementation pending – API integration coming soon"}
                </div>
            )}
        </div>
    );
}
