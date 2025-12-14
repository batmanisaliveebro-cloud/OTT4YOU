'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RefundPolicyPage() {
    return (
        <>
            <Header />
            <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
                <h1 className="section-title" style={{ marginBottom: '2rem' }}>Refund and Cancellation Policy</h1>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Last updated: {new Date().toLocaleDateString()}</p>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Cancellations</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            Since we provide instant digital access to subscription accounts, <strong>orders cannot be cancelled once the credentials have been delivered</strong> to your dashboard or email.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Refunds</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            We generally do not offer refunds for digital products. However, a refund may be considered under the following specific circumstances:
                        </p>
                        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '0.5rem' }}>The provided credentials are invalid and we are unable to provide a replacement within 24 hours.</li>
                            <li style={{ marginBottom: '0.5rem' }}>The service is completely non-functional due to issues on our end for a continuous period of 72 hours.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Refund Process</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            To request a refund, please contact our support team at <a href="mailto:batmanisaliveebro@gmail.com" style={{ color: 'var(--primary-start)' }}>batmanisaliveebro@gmail.com</a> with your Order ID and a description of the issue. Approved refunds will be processed to the original payment method within 5-7 business days.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Replacements</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            If you face any issues with your account (e.g., password change, login error), we prioritize providing a <strong>replacement account</strong> over a refund. Please reach out to support immediately for assistance.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
