import React, { useState } from 'react';
import toast from 'react-hot-toast';
import SectionHeader from '../../components/common/SectionHeader';
import { DIGITAL_MODULES } from '../../data/constants';
import ScrollReveal from '../../components/common/ScrollReveal';
import VideoModal from '../../components/common/VideoModal';
import { Play, Laptop, Zap, Layers } from 'lucide-react';
import './Digital.css';

const Digital: React.FC = () => {
    const [selectedModule, setSelectedModule] = useState<typeof DIGITAL_MODULES[0] | null>(null);
    return (
        <div className="digital-page">
            {/* Hero
            <div className="digital-hero">
                <div className="container">
                    <ScrollReveal>
                        <h1>Digital Bridge Course</h1>
                        <p>Seamlessly connecting previous knowledge with new concepts through interactive digital lessons.</p>
                        <button className="btn-digital-cta">
                            <Play fill="currentColor" size={20} /> Watch Demo
                        </button>
                    </ScrollReveal>
                </div>
            </div> */}

            {/* Features */}
            <div className="digital-features">
                <div className="container">
                    <div className="digital-grid">
                        <div>
                            <ScrollReveal>
                                <SectionHeader title="The Digital Edge" align="left" />
                                <div className="digital-feature-list">
                                    <div className="d-feature">
                                        <div className="d-icon-box icon-purple"><Laptop size={24} /></div>
                                        <div className="d-content">
                                            <h3>Interactive Learning</h3>
                                            <p>Engaging video lessons and animations that make difficult concepts easy to visualize and understand.</p>
                                        </div>
                                    </div>
                                    <div className="d-feature">
                                        <div className="d-icon-box icon-blue"><Zap size={24} /></div>
                                        <div className="d-content">
                                            <h3>Instant Recall</h3>
                                            <p>Quick revision modules designed to help students recall basics from lower classes before starting new chapters.</p>
                                        </div>
                                    </div>
                                    <div className="d-feature">
                                        <div className="d-icon-box icon-pink"><Layers size={24} /></div>
                                        <div className="d-content">
                                            <h3>Structured Progression</h3>
                                            <p>A step-by-step approach that builds confidence and ensures no student is left behind.</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                        <div>
                            <ScrollReveal delay={200}>
                                <div className="video-container">
                                    <iframe
                                        width="560"
                                        height="315"
                                        src="https://www.youtube-nocookie.com/embed/xm8gR0ZPWUw?si=brinda-web"
                                        title="Brinda Publications Digital Bridge Course"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules */}
            <div className="modules-section">
                <div className="container">
                    <SectionHeader title="Popular Modules" subtitle="Explore some of our most effective bridge course content." />

                    <div className="modules-grid">
                        {DIGITAL_MODULES.map((mod, idx) => (
                            <ScrollReveal key={idx} delay={idx * 100}>
                                <div
                                    className="module-card"
                                    onClick={() => {
                                        if (mod.url && mod.url !== "") {
                                            setSelectedModule(mod);
                                        } else {
                                            toast('Video coming soon!', {
                                                icon: '🚧',
                                                style: {
                                                    borderRadius: '10px',
                                                    background: '#333',
                                                    color: '#fff',
                                                },
                                            });
                                        }
                                    }}
                                >
                                    <div className="module-info">
                                        <span className="module-tag">{mod.tag}</span>
                                        <h4>{mod.title}</h4>
                                        <p>{mod.desc}</p>
                                    </div>
                                    <div className="module-thumbnail">
                                        <img src={mod.thumbnail} alt={mod.title} />
                                        <div className="play-overlay">
                                            <Play size={20} fill="currentColor" />
                                        </div>
                                        {mod.duration && <span className="thumbnail-duration">{mod.duration}</span>}
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            {selectedModule && selectedModule.url && (
                <VideoModal
                    videoUrl={selectedModule.url}
                    title={selectedModule.title}
                    onClose={() => setSelectedModule(null)}
                />
            )}
        </div>
    );
};

export default Digital;
