'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ShippingPolicyPage() {
    return (
        <>
            <Header />
            <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
                <h1 className="section-title" style={{ marginBottom: '2rem' }}>Shipping and Delivery Policy</h1>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Last updated: {new Date().toLocaleDateString()}</p>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Digital Delivery</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            OTT4YOU deals exclusively in digital goods. <strong>No physical products are shipped.</strong> All subscriptions and services are delivered electronically via email or directly to your user dashboard on our website.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Delivery Timelines</h2>
                        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '0.5rem' }}><strong>Instant Delivery:</strong> For most automated products, you will receive credentials immediately after successful payment.</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong>Manual Processing:</strong> In some cases, delivery may take between 10 minutes to 2 hours depending on server load and verification processes.</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong>Maximum Time:</strong> In rare cases, delivery may take up to 24 hours. If you do not receive your product by then, please contact support.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Non-Delivery</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            If you have successfully paid but haven't received an email or dashboard update, please:
                        </p>
                        <ol style={{ listStyle: 'decimal', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Check your email's Spam/Junk folder.</li>
                            <li style={{ marginBottom: '0.5rem' }}>Verify your order status in the "My Orders" section of your dashboard.</li>
                            <li style={{ marginBottom: '0.5rem' }}>Contact us at <a href="mailto:batmanisaliveebro@gmail.com" style={{ color: 'var(--primary-start)' }}>batmanisaliveebro@gmail.com</a> with your transaction details.</li>
                        </ol>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
