import React, { useState } from 'react';
import toast from 'react-hot-toast';
import ScrollReveal from '../../components/common/ScrollReveal';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Contact.css';

import { submitContactForm } from '../../services/api';

const Contact: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await submitContactForm(formData);
            toast.success('Thank you for your message! We will get back to you soon.');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="contact-page">
            <div className="contact-hero">
                <div className="container">
                    <ScrollReveal>
                        <h1>Get in Touch</h1>
                        <p>Have a question or want to place a bulk order? We'd love to hear from you.</p>
                    </ScrollReveal>
                </div>
            </div>

            <div className="contact-container">
                <ScrollReveal delay={100}>
                    <div className="contact-wrapper">
                        {/* Info Side */}
                        <div className="contact-info-col">
                            <h3>Contact Information</h3>
                            <div className="contact-details-list">
                                <div className="c-detail-item">
                                    <Phone className="c-icon" size={24} />
                                    <div>
                                        <div className="c-label">Call Us</div>
                                        <div className="c-value">+91 94400 57086</div>
                                        <div className="c-value">+91 94900 67360</div>
                                    </div>
                                </div>

                                <div className="contact-item-card">
                                    <div className="c-icon-box">
                                        <Mail size={24} />
                                    </div>
                                    <div className="c-info">
                                        <div className="c-label">Email Us</div>
                                        <div className="c-value">brindapublications@gmail.com</div>
                                    </div>
                                </div>

                                <div className="contact-item-card">
                                    <div className="c-icon-box">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="c-info">
                                        <div className="c-label">Visit Us</div>
                                        <div className="c-value">
                                            Plot No. 169, 170, Road No 6,<br />
                                            Chanakyapuri Colony, Sai Nagar,<br />
                                            Nagole, Hyderabad 500068
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="contact-form-col">
                            <h3>Send us a Message</h3>
                            <p>Fill out the form below and our team will get back to you within 24 hours.</p>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        className="form-input"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Inquiry about Class 10 Books"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Message</label>
                                    <textarea
                                        name="message"
                                        className="form-textarea"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            <Send size={18} /> Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
};

export default Contact;
