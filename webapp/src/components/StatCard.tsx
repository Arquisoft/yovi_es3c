import React from "react";
type StatType = "neutral" | "partidas" | "win" | "loss";

interface StatCardProps {
    label: string;
    value: string | number;
    type?: StatType;
}

function getIcon(type: StatType): JSX.Element {
    switch (type) {
        case "neutral": // Usuario
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="#A7F3D0" />
                    <path d="M4 20c0-4 8-4 8-4s8 0 8 4" stroke="#4B5563" strokeWidth="2" fill="#F3F4F6" />
                </svg>
            );
        case "partidas": // Clock icon for temporality
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" fill="#FBBF24" stroke="#4F46E5" strokeWidth="2" />
                    <line x1="12" y1="12" x2="12" y2="7" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="12" x2="16" y2="12" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
                </svg>
            );
        case "win": // Trofeo
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="8" y="18" width="8" height="2" rx="1" fill="#FBBF24" />
                    <path d="M12 18v-6" stroke="#FBBF24" strokeWidth="2" />
                    <ellipse cx="12" cy="8" rx="6" ry="4" fill="#FDE68A" stroke="#FBBF24" strokeWidth="2" />
                    <path d="M6 8c0 4 12 4 12 0" stroke="#FBBF24" strokeWidth="2" />
                </svg>
            );
        case "loss": // Cara triste
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" />
                    <ellipse cx="9" cy="10" rx="1" ry="1.5" fill="#EF4444" />
                    <ellipse cx="15" cy="10" rx="1" ry="1.5" fill="#EF4444" />
                    <path d="M9 16c1.5-2 4.5-2 6 0" stroke="#EF4444" strokeWidth="2" />
                </svg>
            );
        default:
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="#A7F3D0" />
                    <path d="M4 20c0-4 8-4 8-4s8 0 8 4" stroke="#4B5563" strokeWidth="2" fill="#F3F4F6" />
                </svg>
            );
    }
}

const StatCard: React.FC<StatCardProps> = ({ label, value, type = "neutral" }) => {
    const icon = getIcon(type);
    return (
        <div className={`stat-card ${type}`}>
            <div className="stat-icon">{icon}</div>
            <div className={`stat-value ${type}`}>{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
};

export default StatCard;