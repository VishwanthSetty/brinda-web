import React from 'react';
import './SectionHeader.css';

interface Props {
    title: string;
    subtitle?: string;
    align?: 'left' | 'center';
}

const SectionHeader: React.FC<Props> = ({ title, subtitle, align = 'center' }) => {
    return (
        <div className={`section-header ${align === 'center' ? 'text-center' : 'text-left'}`}>
            <h2 className="section-title">
                {title}
            </h2>
            {subtitle && (
                <p className="section-subtitle">
                    {subtitle}
                </p>
            )}
            <div className={`section-underline ${align === 'center' ? 'mx-auto' : ''}`}></div>
        </div>
    );
};

export default SectionHeader;
