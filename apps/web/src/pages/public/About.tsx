import React from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import ScrollReveal from '../../components/common/ScrollReveal';
import { Target, Compass } from 'lucide-react';
import './About.css';

const About: React.FC = () => {
    return (
        <div className="about-page">
            {/* Hero */}
            <div className="about-hero">
                <div className="container">
                    <ScrollReveal>
                        <h1>Shaping Future Generations</h1>
                        <p>Since 2008, Brinda Publications has been a beacon of quality education, dedicated to simplifying learning for students across Telangana.</p>
                    </ScrollReveal>
                </div>
            </div>

            {/* Mission & Vision */}
            <section className="mission-section">
                <div className="container">
                    <SectionHeader
                        title="Our Purpose"
                        subtitle="We are driven by a single goal: to make high-quality education accessible and understandable for every student."
                    />

                    <div className="mission-grid">
                        <ScrollReveal>
                            <div className="mission-card">
                                <Target size={48} className="mission-icon" />
                                <h3>Our Mission</h3>
                                <p>
                                    To provide comprehensive, curriculum-aligned study materials that bridge the gap between classroom teaching and student understanding. We strive to simplify complex concepts, ensuring that learning is not just about memorization but about mastery.
                                </p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={200}>
                            <div className="mission-card">
                                <Compass size={48} className="mission-icon" />
                                <h3>Our Vision</h3>
                                <p>
                                    To be the most trusted educational partner for schools and students, empowering a generation of learners with the knowledge, confidence, and skills to excel in their academic and future professional endeavors.
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="story-section">
                <div className="container">
                    <div className="story-content">
                        <ScrollReveal>
                            <SectionHeader title="Our Story" />
                            <div className="story-text">
                                <p>
                                    Founded by a team of passionate educators and academic experts, Brinda Publications began with a simple observation: students were struggling to grasp the core concepts of their syllabus due to a lack of simplified, student-friendly resources.
                                </p>
                                <p>
                                    What started as a small initiative to create supplementary notes for a few local schools has now grown into a premier publishing house serving thousands of institutions. Our "Back to Basics" philosophy combined with rigorous adherence to SCERT guidelines has made us a household name in the Telangana education sector.
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="values-section">
                <div className="container">
                    <SectionHeader title="Core Values" subtitle="The principles that guide everything we create." />

                    <div className="values-list">
                        {[
                            { title: "Student-Centricity", desc: "Every book, every chapter, and every diagram is designed with the student's perspective in mind." },
                            { title: "Academic Integrity", desc: "We maintain the highest standards of accuracy and relevance, ensuring our content is always up-to-date with the latest curriculum." },
                            { title: "Continuous Innovation", desc: "We constantly evolve our methods, integrating digital tools and new pedagogical techniques to enhance learning." }
                        ].map((val, idx) => (
                            <ScrollReveal key={idx} delay={idx * 150}>
                                <div className="value-item">
                                    <div className="value-number">0{idx + 1}</div>
                                    <div className="value-content">
                                        <h4>{val.title}</h4>
                                        <p>{val.desc}</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
