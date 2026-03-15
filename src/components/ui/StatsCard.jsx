import React, { memo } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const ICON_VARIANT = {
    primary: 'bg-blue-50   border-blue-100  text-blue-600',
    success: 'bg-green-50  border-green-100 text-green-600',
    warning: 'bg-amber-50  border-amber-100 text-amber-600',
    danger:  'bg-red-50    border-red-100   text-red-600',
};

const StatsCard = memo(({ label, value, change, trend, isPositiveChange, icon: IconComponent, color }) => {
    const iconStyle  = ICON_VARIANT[color] ?? ICON_VARIANT.primary;
    const badgeClass = isPositiveChange ? 'badge-success' : 'badge-error';
    const TrendIcon  = trend === 'up' ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="bg-white p-3 rounded-sm border border-[var(--vp-border)] hover:border-[var(--vp-primary)] transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className={`p-1.5 rounded-sm border ${iconStyle}`}>
                    <IconComponent className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className={`badge-tech ${badgeClass} flex items-center gap-0.5`} aria-label={`${isPositiveChange ? 'Variação positiva' : 'Variação negativa'} de ${change}`}>
                    <TrendIcon className="w-2.5 h-2.5" aria-hidden="true" />
                    {change}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-bold text-[var(--vp-text-label)] uppercase tracking-widest mb-0.5">{label}</p>
                <h2 className="text-lg font-black text-black leading-tight tracking-tight">{value}</h2>
            </div>
        </div>
    );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
