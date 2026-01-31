import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Youtube } from 'lucide-react';
import './PublicFooter.css';

export default function PublicFooter() {
    return (
        <footer className="public-footer">
            <div className="footer-container">
                <div className="footer-grid">

                    <div className="footer-col brand-col">
                        <h3 className="footer-title serif">Brinda Series</h3>
                        <p className="footer-desc">
                            Making learning simplified for students of Telangana. Our "Back to Basics" approach ensures every student builds a strong foundation.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link"><Facebook size={20} /></a>
                            <a href="#" className="social-link"><Twitter size={20} /></a>
                            <a href="#" className="social-link"><Youtube size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/books" className="footer-link">Study Material</Link></li>
                            <li><Link to="/papers" className="footer-link">Model Papers</Link></li>
                            <li><Link to="/digital" className="footer-link">Bridge Course (Digital)</Link></li>
                            <li><Link to="/schools" className="footer-link">Institutional Orders</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">Support</h4>
                        <ul className="footer-links">
                            <li><Link to="/about" className="footer-link">About Us</Link></li>
                            <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
                            <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">Contact</h4>
                        <ul className="contact-list">
                            <li className="contact-item">
                                <MapPin size={18} className="contact-icon" />
                                <span>Plot No. 169, 170, Road No 6,<br />Chanakyapuri Colony, Sai Nagar,<br />Nagole, Hyderabad 500068</span>
                            </li>
                            <li className="contact-item">
                                <Phone size={18} className="contact-icon center-icon" />
                                <span>+91 94400 57086<br />+91 94900 67360</span>
                            </li>
                            <li className="contact-item">
                                <Mail size={18} className="contact-icon center-icon" />
                                <span>brindapublications@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                </div>
                <div className="footer-copyright">
                    <p>&copy; {new Date().getFullYear()} Brinda Publications. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
