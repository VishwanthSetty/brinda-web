import { useNavigate } from 'react-router-dom';
import SectionHeader from '../../components/common/SectionHeader';
import ScrollReveal from '../../components/common/ScrollReveal';
import { Users, Award, Handshake } from 'lucide-react';
import './SchoolsPublic.css';

const SchoolsPublic: React.FC = () => {
    const navigate = useNavigate();

    const handleRequestVisit = () => {
        navigate('/contact', {
            state: {
                subject: 'Request for School Visit',
                message: 'We are interested in your publications and would like to schedule a visit from your academic representative.'
            }
        });
    };

    return (
        <div className="schools-public-page">
            <div className="school-hero">
                <div className="container">
                    <ScrollReveal>
                        <h1>Partner With Excellence</h1>
                        <p>Join over 1000+ schools that trust Brinda Publications to shape their academic curriculum.</p>
                    </ScrollReveal>
                </div>
            </div>

            <div className="partners-section">
                <div className="container">
                    <SectionHeader title="Why Schools Choose Us" />

                    <div className="partners-grid" style={{ marginTop: '4rem' }}>
                        {[
                            { icon: <Award size={32} />, title: "Improved Results", desc: "Schools using our materials have seen a consistent improvement in SSC board exam results." },
                            { icon: <Users size={32} />, title: "Teacher Support", desc: "We provide teacher manuals and workshops to help your staff get the most out of our books." },
                            { icon: <Handshake size={32} />, title: "Custom Solutions", desc: "We work closely with school management to provide tailored packages that fit your needs." }
                        ].map((item, idx) => (
                            <ScrollReveal key={idx} delay={idx * 150}>
                                <div className="partner-card">
                                    <div className="p-icon-box">
                                        {item.icon}
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p>{item.desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </div>

            <div className="visit-cta">
                <div className="container">
                    <ScrollReveal>
                        <div className="cta-flex">
                            <div>
                                <h2>Schedule a Campus Visit</h2>
                                <p style={{ color: '#9ca3af', maxWidth: '36rem' }}>
                                    Our academic representatives are traveling across Telangana. Book a slot for them to visit your school and showcase our complete range of publications.
                                </p>
                            </div>
                            <button className="btn-visit" onClick={handleRequestVisit}>
                                Request School Visit
                            </button>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    );
};

export default SchoolsPublic;
