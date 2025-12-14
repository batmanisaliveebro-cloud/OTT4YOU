'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
    return (
        <>
            <Header />
            <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
                <h1 className="section-title" style={{ marginBottom: '2rem' }}>Terms and Conditions</h1>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Last updated: {new Date().toLocaleDateString()}</p>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Introduction</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            Welcome to <strong>OTT4YOU</strong>. By accessing our website and purchasing our services, you agree to be bound by these Terms and Conditions. Please read them carefully before making a purchase.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Services</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            OTT4YOU provides digital subscription services for various OTT platforms. We act as a reseller and are not directly affiliated with the streaming services provided unless explicitly stated.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>3. User Accounts</h2>
                        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '0.5rem' }}>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li style={{ marginBottom: '0.5rem' }}>You agree to provide accurate and complete information when registering.</li>
                            <li style={{ marginBottom: '0.5rem' }}>We reserve the right to terminate accounts that violate our terms or engage in fraudulent activity.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Payments</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            All payments are processed securely through our payment partners (e.g., Razorpay). We accept major credit/debit cards and UPI. Prices are subject to change without notice, but will not affect active subscriptions.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>5. Limitation of Liability</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            OTT4YOU shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our maximum liability is limited to the amount paid for the specific service.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>6. Contact Information</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            If you have any questions about these Terms, please contact us at <a href="mailto:batmanisaliveebro@gmail.com" style={{ color: 'var(--primary-start)' }}>batmanisaliveebro@gmail.com</a>.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
