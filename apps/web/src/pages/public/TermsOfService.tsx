import React from 'react';
import ScrollReveal from '../../components/common/ScrollReveal';
import './Legal.css';

const TermsOfService: React.FC = () => {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <ScrollReveal>
                    <h1 className="legal-title">Terms of Service</h1>
                    <p className="last-updated">Last Updated: January 31, 2026</p>

                    <div className="legal-section">
                        <p>
                            Welcome to Brinda Publications. By accessing or using our website and educational resources, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </div>

                    <div className="legal-section">
                        <h2>1. Use of Educational Materials</h2>
                        <p>All content provided on this website, including but not limited to text, graphics, logos, PDFs, and video modules, is the property of Brinda Publications or its content suppliers and is protected by copyright laws.</p>
                        <ul>
                            <li><strong>Permitted Use:</strong> You may view, download, and print sample materials for personal, non-commercial educational use only.</li>
                            <li><strong>Restrictions:</strong> You may not modify, reproduce, distribute, display, or sell any content without prior written permission from Brinda Publications.</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>2. User Conduct</h2>
                        <p>You agree to use our website only for lawful purposes. You are prohibited from:</p>
                        <ul>
                            <li>Using the website in any way that violates any applicable local, national, or international law.</li>
                            <li>Attempting to gain unauthorized access to any portion of the website or our systems.</li>
                            <li>Engaging in any conduct that restricts or inhibits anyone's use or enjoyment of the website.</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>3. Intellectual Property</h2>
                        <p>
                            "Brinda Publications," "Brinda Series," and our logo are trademarks of Brinda Publications. Nothing in these Terms gives you a right to use the Brinda Publications name or any of the Brinda Publications trademarks, logos, domain names, and other distinctive brand features.
                        </p>
                    </div>

                    <div className="legal-section">
                        <h2>4. Digital Content</h2>
                        <p>
                            Our digital bridge courses and video modules are provided for educational purposes. We strive for accuracy but make no warranties regarding the completeness or accuracy of the information. External links (e.g., to YouTube) are provided for convenience, and we are not responsible for the content of external sites.
                        </p>
                    </div>

                    <div className="legal-section">
                        <h2>5. Limitation of Liability</h2>
                        <p>
                            Brinda Publications shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or materials, even if we have been advised of the possibility of such damages.
                        </p>
                    </div>

                    <div className="legal-section">
                        <h2>6. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms of Service at any time. Your continued use of the website following any changes indicates your acceptance of the new Terms.
                        </p>
                    </div>

                    <div className="legal-section">
                        <h2>7. Contact Information</h2>
                        <p>
                            Questions about the Terms of Service should be sent to us at brindapublications@gmail.com.
                        </p>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
};

export default TermsOfService;
