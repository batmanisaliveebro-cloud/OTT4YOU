'use client';

import { useState, useEffect } from 'react';

export default function SupportWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            bottom: isMobile ? '1rem' : '2rem',
            right: isMobile ? '1rem' : '2rem',
            zIndex: 9990,
        }}>
            {/* Chat Menu */}
            {isOpen && (
                <div style={{
                    marginBottom: '0.75rem',
                    background: 'rgba(30, 30, 30, 0.98)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: isMobile ? '1rem' : '1.5rem',
                    width: isMobile ? '260px' : '300px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    animation: 'slideUp 0.3s ease-out',
                }}>
                    <div style={{ marginBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Customer Support</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#4ade80' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                            Responds in 10-15 mins
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* Telegram Button */}
                        <a
                            href="https://t.me/akhilescrow"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.625rem',
                                background: '#0088cc',
                                color: 'white',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                            }}
                        >
                            <span style={{ fontSize: '1.25rem' }}>✈️</span>
                            <span>Chat on Telegram</span>
                        </a>

                        {/* Gmail Button */}
                        <a
                            href="mailto:batmanisaliveebro@gmail.com"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.625rem',
                                background: '#ea4335',
                                color: 'white',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                            }}
                        >
                            <span style={{ fontSize: '1.25rem' }}>📧</span>
                            <span>Email Support</span>
                        </a>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: isMobile ? '50px' : '60px',
                    height: isMobile ? '50px' : '60px',
                    borderRadius: '50%',
                    background: 'var(--primary-start)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '1.5rem' : '1.75rem',
                }}
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
}

