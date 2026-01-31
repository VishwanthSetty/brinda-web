import React from 'react';
import ScrollReveal from '../../components/common/ScrollReveal';
import './Legal.css';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <ScrollReveal>
                    <h1 className="legal-title">Privacy Policy</h1>
                    <p className="last-updated">Last Updated: January 31, 2026</p>

                    <div className="legal-section">
                        <p>
                            At Brinda Publications ("we," "our," or "us"), we are committed to protecting the privacy and security of our users ("you," "your," "students," "educators"). This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our educational resources.
                        </p>
                    </div>

                    <div className="legal-section">
                        <h2>1. Information We Collect</h2>
                        <p>We collect information to provide better services to all our users. The types of information we collect include:</p>
                        <ul>
                            <li><strong>Personal Information:</strong> Name, email address, phone number, and school details when you contact us, register for updates, or place institutional orders.</li>
                            <li><strong>Usage Data:</strong> Information on how you interact with our website, such as pages visited, time spent, and resources accessed (e.g., sample PDFs, digital modules).</li>
                            <li><strong>Device Information:</strong> We may collect information about the device you use to access our services, including IP address, browser type, and operating system.</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>2. How We Use Information</h2>
                        <p>We use the collected information for the following educational and administrative purposes:</p>
                        <ul>
                            <li>To provide and improve our study materials and digital resources.</li>
                            <li>To communicate with you regarding updates, new releases, and educational news.</li>
                            <li>To process institutional orders and support requests.</li>
                            <li>To analyze usage patterns and improve the user experience on our platform.</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>3. Data Protection</h2>
                        <p>
                            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We do not sell, trade, or rent your personal identification information to others.
                        </p>
                    </div>

                    <div className="legal-section">
                        <h2>4. Third-Party Services</h2>
                        <p>Our website may use third-party services to enhance your experience:</p>
                        <ul>
                            <li><strong>YouTube:</strong> We use YouTube API Services to display educational video content. By using these features, you agree to be bound by the YouTube Terms of Service.</li>
                            <li><strong>Google Drive:</strong> We use Google Drive to host and share sample documents. Accessing these files is subject to Google's Privacy Policy.</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>5. Children's Privacy</h2>
                        <p>
                            Protecting the privacy of young learners is especially important. We do not knowingly collect personal information from children under the age of 13 without verifiable parental consent. If we learn that we have collected personal information from a child under 13 without consent, we will take steps to delete that information.
                        </p>
                    </div>

                    <div className="legal-section">
                        <h2>6. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <p>
                            <strong>Brinda Publications</strong><br />
                            Plot No. 169, 170, Road No 6, Chanakyapuri Colony,<br />
                            Sai Nagar, Nagole, Hyderabad 500068<br />
                            Email: brindapublications@gmail.com
                        </p>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
