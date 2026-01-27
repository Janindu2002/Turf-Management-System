import { type ReactNode } from 'react';

interface CardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    color?: 'emerald' | 'blue' | 'purple' | 'orange';
}

export default function Card({ title, value, icon, color = 'emerald' }: CardProps) {
    const colorClasses = {
        emerald: 'bg-emerald-100 text-emerald-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow border flex justify-between items-center">
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    );
}
