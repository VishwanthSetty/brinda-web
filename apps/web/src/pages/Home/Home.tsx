import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Video, CheckCircle, ArrowRight, Star, Quote, Target, Layout, PenTool, Users, Clock } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';
import './Home.css';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen overflow-hidden">

            {/* --- HERO SECTION --- */}
            <section className="hero-section">
                {/* Background Decor */}
                <div className="hero-bg-decor">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                </div>

                <div className="hero-container">
                    <ScrollReveal>
                        <div className="hero-card">
                            <div className="hero-grid">

                                {/* Content Side (7 cols) */}
                                <div className="hero-content-col">
                                    {/* Background pattern */}
                                    <div className="quote-bg">
                                        <Quote size={100} />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="hero-badge">
                                            <Star size={12} fill="currentColor" /> Premier Study Material
                                        </div>

                                        <h1 className="hero-title">
                                            Master Your <br />
                                            <span className="gradient-text-blue">Syllabus.</span> Ace Your <br />
                                            <span className="gradient-text-orange">Exams.</span>
                                        </h1>

                                        <p className="hero-desc">
                                            We simplify the Telangana State Board curriculum (Class 6-10) into easy-to-understand concepts, ensuring you build a rock-solid foundation.
                                        </p>

                                        <div className="hero-actions">
                                            <NavLink to="/books" className="btn-hero-primary">
                                                Explore Books <ArrowRight size={18} />
                                            </NavLink>
                                            <NavLink to="/digital" className="btn-hero-secondary">
                                                <Video size={18} /> Digital Course
                                            </NavLink>
                                        </div>

                                        {/* Trust Indicators */}
                                        <div className="trust-indicators">
                                            <div className="flex -space-x-3 avatar-group">
                                                {[1, 2, 3, 4].map(i => (
                                                    <img key={i} src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" className="avatar" />
                                                ))}
                                                <div className="avatar-more">+2k</div>
                                            </div>
                                            <div className="trust-text">
                                                <p className="trust-title">Trusted by Schools</p>
                                                <p className="trust-subtitle">Across Telangana</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Side (5 cols) */}
                                <div className="hero-visual-col">
                                    <img
                                        src="https://picsum.photos/seed/student_studying_hard/800/1200"
                                        alt="Student Success"
                                        className="hero-img"
                                    />
                                    <div className="hero-overlay"></div>

                                    {/* Floating Elements */}
                                    <div className="float-card-1">
                                        <div className="glass-card">
                                            <div className="text-white font-bold text-2xl">A+</div>
                                            <div className="text-blue-100 text-xs">Top Grades</div>
                                        </div>
                                    </div>

                                    <div className="float-card-2">
                                        <div className="progress-card">
                                            <div className="progress-header">
                                                <div className="check-icon-bg">
                                                    <CheckCircle size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm">Concept Cleared!</h4>
                                                    <p className="text-xs text-gray-500">Geometry Basics • Class 9</p>
                                                </div>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div className="progress-bar-fill"></div>
                                            </div>
                                            <div className="progress-stats">
                                                <span>Progress</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* --- OVERVIEW SECTION --- */}
            <section className="overview-section">
                <div className="container">
                    <div className="overview-flex">
                        <div className="lg:w-1/2">
                            <ScrollReveal>
                                <div className="overview-img-wrapper">
                                    <div className="overview-bg-shape"></div>
                                    <img src="https://picsum.photos/seed/library_study/800/600" alt="Students studying" className="overview-img" />
                                </div>
                            </ScrollReveal>
                        </div>
                        <div className="lg:w-1/2">
                            <ScrollReveal delay={200}>
                                <span className="section-tag">Who We Are</span>
                                <h2 className="overview-title">Trusted Educational Partner</h2>
                                <p className="overview-text">
                                    Brinda Publications is a premier educational publishing house committed to transforming the learning landscape for middle and high school students. We specialize in crafting high-quality, well-structured study materials specifically tailored for students from <strong>Class 6 to Class 10</strong>.
                                </p>
                                <p className="overview-text">
                                    By strictly adhering to <strong>SCERT guidelines</strong>, we ensure that our content is not only academically rigorous but also perfectly aligned with the official curriculum. Our primary goal is to bridge the gap between complex textbook theories and practical, exam-oriented understanding.
                                </p>

                                <div className="stats-row">
                                    <div className="stat-item">
                                        <div className="stat-icon-bg"><Clock size={24} /></div>
                                        <div>
                                            <div className="stat-value">25+ Years</div>
                                            <div className="stat-label">Of Excellence</div>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon-bg"><Users size={24} /></div>
                                        <div>
                                            <div className="stat-value">10,000+</div>
                                            <div className="stat-label">Students in Telangana</div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CORE PHILOSOPHY --- */}
            <section className="philosophy-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="philosophy-header">
                            <span className="section-tag">Our Values</span>
                            <h2 className="overview-title">Our Core Philosophy</h2>
                            <p className="philosophy-desc">
                                At Brinda Publications, we believe that education should be clear, simple, and accessible, fostering a genuine love for learning.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="philosophy-grid">
                        {[
                            {
                                icon: <Target size={32} />,
                                title: "Clarity",
                                desc: "Breaking down complex concepts into digestible segments that students can easily grasp.",
                                colorClass: "icon-blue"
                            },
                            {
                                icon: <Layout size={32} />,
                                title: "Simplicity",
                                desc: "Using language and layouts that are intuitive and easy for students to navigate without stress.",
                                colorClass: "icon-orange"
                            },
                            {
                                icon: <CheckCircle size={32} />,
                                title: "Precision",
                                desc: "Ensuring every piece of content is relevant and strictly aligned to the SCERT framework.",
                                colorClass: "icon-green"
                            }
                        ].map((item, index) => (
                            <ScrollReveal key={index} delay={index * 200}>
                                <div className="philosophy-card">
                                    <div className={`icon-wrapper ${item.colorClass}`}>
                                        {item.icon}
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p>
                                        {item.desc}
                                    </p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- KEY FEATURES & OFFERINGS --- */}
            <section className="features-container">
                <div className="container">
                    <ScrollReveal>
                        <div className="features-header">
                            <h2 className="overview-title">Key Features & Offerings</h2>
                        </div>
                    </ScrollReveal>

                    <div className="features-list">
                        {/* Feature 1 */}
                        <ScrollReveal>
                            <div className="feature-item">
                                <div className="feature-icon-box bg-blue-100">
                                    <BookOpen size={40} />
                                </div>
                                <div className="feature-content">
                                    <h3>1. Curriculum-Aligned Study Materials</h3>
                                    <p>
                                        Our books and guides cover every subject for <strong>Classes 6 through 10</strong>. Each chapter is meticulously researched and prepared by academic experts to ensure that students receive the most accurate information.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Feature 2 */}
                        <ScrollReveal delay={100}>
                            <div className="feature-item">
                                <div className="feature-icon-box bg-orange-100">
                                    <Video size={40} />
                                </div>
                                <div className="feature-content">
                                    <h3>2. Lesson-Wise Digital Content</h3>
                                    <p className="feature-intro">
                                        We understand that the modern student learns differently. To complement our printed materials, we provide comprehensive digital support for every lesson. This includes:
                                    </p>
                                    <ul className="feature-list-check">
                                        <li><div className="dot-orange"></div> Visual aids and interactive modules</li>
                                        <li><div className="dot-orange"></div> Subject-specific digital deep-dives</li>
                                        <li><div className="dot-orange"></div> Supplementary resources beyond the printed page</li>
                                    </ul>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Feature 3 */}
                        <ScrollReveal delay={200}>
                            <div className="feature-item">
                                <div className="feature-icon-box bg-green-100">
                                    <PenTool size={40} />
                                </div>
                                <div className="feature-content">
                                    <h3>3. Exam-Oriented Approach</h3>
                                    <p>
                                        Our content is structured to help students excel in assessments. We include practice questions, model answers, and strategic summaries that highlight the most important topics likely to appear in examinations.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* --- BRIDGING THE GAP SECTION --- */}
            <section className="bridging-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <h2 className="overview-title">Bridging the Gap: Classroom & Self-Study</h2>
                            <p className="bridging-intro">
                                Brinda Publications serves as a versatile tool for various educational environments:
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="bridging-grid">
                        <ScrollReveal delay={100}>
                            <div className="bridging-card">
                                <div className="bridging-icon">
                                    <Users size={32} />
                                </div>
                                <div>
                                    <h3>For Classrooms</h3>
                                    <p>
                                        Our materials provide teachers with a reliable framework to deliver lessons effectively, ensuring all students are on the same page.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={200}>
                            <div className="bridging-card">
                                <div className="bridging-icon">
                                    <BookOpen size={32} />
                                </div>
                                <div>
                                    <h3>For Self-Study</h3>
                                    <p>
                                        With our clear explanations and easy-to-access digital content, students can confidently navigate their syllabus at home without external assistance.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* --- CONCLUSION / CTA --- */}
            <section className="cta-section-home">
                <div className="container">
                    <ScrollReveal>
                        <div className="cta-content">
                            <div className="cta-quote-wrapper">
                                <Quote size={48} className="cta-quote-icon" />
                            </div>
                            <h2 className="cta-heading">Building a Brighter Future</h2>
                            <p className="cta-text">
                                By combining a strong academic foundation with modern digital tools and the timeless wisdom of the <strong>Adi Path</strong>, Brinda Publications ensures that effective learning is a reality for every student. We are more than just a publisher; we are a dedicated partner in the academic journey of students, helping them build a brighter future through better understanding.
                            </p>

                            <div className="cta-buttons">
                                <NavLink to="/books" className="btn-cta-primary">
                                    View Our Books
                                </NavLink>
                                <NavLink to="/digital" className="btn-cta-secondary">
                                    Explore Digital Tools
                                </NavLink>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

        </div>
    );
};

export default Home;
