import React from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import ScrollReveal from '../../components/common/ScrollReveal';
import { PAPER_TYPES } from '../../data/constants';
import { RefreshCw, ClipboardList, FileCheck, Check } from 'lucide-react';
import PdfViewer from '../../components/common/PdfViewer';
import './Papers.css';

const Papers: React.FC = () => {
    const [selectedPaper, setSelectedPaper] = React.useState<typeof PAPER_TYPES[0] | null>(null);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'RefreshCw': return <RefreshCw size={28} />;
            case 'ClipboardList': return <ClipboardList size={28} />;
            case 'FileCheck': return <FileCheck size={28} />;
            default: return null;
        }
    };

    const handleViewSample = (paper: typeof PAPER_TYPES[0]) => {
        if (paper.samplePdf) {
            setSelectedPaper(paper);
        } else {
            // Optional: toast warning if no PDF
            console.warn("No PDF available for this paper type.");
        }
    };

    return (
        <div className="papers-page">
            <div className="papers-hero">
                <div className="container">
                    <ScrollReveal>
                        <SectionHeader title="Assessment & Practice" />
                        <p className="papers-intro">
                            We believe that practice is the key to perfection. Our carefully crafted question banks and model papers help students test their knowledge and build exam confidence.
                        </p>
                    </ScrollReveal>
                </div>
            </div>

            <div className="container">
                {/* Paper Types */}
                <div className="paper-types-grid">
                    {PAPER_TYPES.map((type, idx) => (
                        <ScrollReveal key={idx} delay={idx * 150}>
                            <div className="paper-card">
                                <div className="paper-icon-wrapper">
                                    {getIcon(type.icon)}
                                </div>
                                <h3>{type.title}</h3>
                                <p>{type.description}</p>
                                <button
                                    className="btn-view-sample"
                                    onClick={() => handleViewSample(type)}
                                >
                                    View Sample
                                </button>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                {/* Benefits */}
                <ScrollReveal>
                    <div className="paper-benefits">
                        <div className="benefits-container" style={{ padding: '0 3rem' }}>
                            <div className="benefits-grid">
                                <div>
                                    <h2 className="section-title text-left">Why Use Our Question Banks?</h2>
                                    <ul className="benefit-list">
                                        <li className="benefit-item">
                                            <div className="benefit-check"><Check size={16} /></div>
                                            <div>
                                                <span className="benefit-title">Pattern Proficiency</span>
                                                <span className="benefit-desc">Familiarizes students with the exact format and weightage of the public exams.</span>
                                            </div>
                                        </li>
                                        <li className="benefit-item">
                                            <div className="benefit-check"><Check size={16} /></div>
                                            <div>
                                                <span className="benefit-title">Time Management</span>
                                                <span className="benefit-desc">Helping students learn how to allocate time efficiently across different sections.</span>
                                            </div>
                                        </li>
                                        <li className="benefit-item">
                                            <div className="benefit-check"><Check size={16} /></div>
                                            <div>
                                                <span className="benefit-title">Self-Evaluation</span>
                                                <span className="benefit-desc">Enabling students to identify their weak areas and focus on improvement.</span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <img src="https://picsum.photos/seed/exam_prep/600/400" alt="Students preparing for exam" className="benefits-img" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* PDF Viewer */}
                {selectedPaper && selectedPaper.samplePdf && (
                    <PdfViewer
                        pdfUrl={selectedPaper.samplePdf}
                        title={`${selectedPaper.title} - Sample`}
                        onClose={() => setSelectedPaper(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default Papers;
