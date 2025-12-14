import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            {/* Trust Badges Section */}
            <div className="trust-section">
                <div className="container">
                    <div className="trust-badges">
                        <div className="trust-badge">
                            <div className="trust-icon">🔒</div>
                            <div className="trust-text">
                                <strong>100% Secure</strong>
                                <span>Encrypted Payments</span>
                            </div>
                        </div>
                        <div className="trust-badge">
                            <div className="trust-icon">⚡</div>
                            <div className="trust-text">
                                <strong>Instant Delivery</strong>
                                <span>Activated in Minutes</span>
                            </div>
                        </div>
                        <div className="trust-badge">
                            <div className="trust-icon">✅</div>
                            <div className="trust-text">
                                <strong>100% Trusted</strong>
                                <span>Verified Sellers</span>
                            </div>
                        </div>
                        <div className="trust-badge">
                            <div className="trust-icon">💯</div>
                            <div className="trust-text">
                                <strong>Best Prices</strong>
                                <span>Guaranteed Savings</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h3 className="text-gradient">OTT4YOU</h3>
                        <p>Your one-stop destination for premium OTT subscriptions at the best prices.</p>
                        <div className="social-links">
                            <a href="#" className="social-link">📧</a>
                            <a href="#" className="social-link">📱</a>
                            <a href="#" className="social-link">💬</a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/#products">Products</Link></li>
                            <li><Link href="/dashboard">My Orders</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Platforms</h4>
                        <ul>
                            <li>Prime Video</li>
                            <li>Spotify Premium</li>
                            <li>YouTube Premium</li>
                            <li>JioHotstar</li>
                            <li>Jio Saavn</li>
                            <li>SonyLIV</li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="mailto:batmanisaliveebro@gmail.com">Contact Us</a></li>
                            <li><Link href="/terms">Terms & Conditions</Link></li>
                            <li><Link href="/refund-policy">Refund Policy</Link></li>
                            <li><Link href="/shipping-policy">Shipping Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} OTT4YOU. All rights reserved.</p>
                    <p className="footer-tagline">Made with ❤️ in India</p>
                </div>
            </div>
        </footer>
    );
}
