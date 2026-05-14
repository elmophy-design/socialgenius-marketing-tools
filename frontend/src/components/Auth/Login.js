import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, googleProvider, signInWithPopup } from '../../firebase';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login successful! Redirecting to Dashboard.");
            navigate('/social-media'); // Redirect on success
        } catch (err) {
            console.error("Login Error:", err.message);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/social-media');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span>🚀</span><span>Meritlives Tools</span>
                    </div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to access your marketing tools</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin}>
                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input type="email" id="email" className="form-control" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" id="password" className="form-control" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <div className="forgot-password">
                        <Link to="/auth/forgot-password" className="auth-link">Forgot password?</Link>
                    </div>

                    <button type="submit" className={`btn-primary ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                        <span id="login-text">{isLoading ? '' : 'Sign In'}</span>
                    </button>
                </form>

                <div className="divider"><span>Or continue with</span></div>

                <button className={`btn-google ${isLoading ? 'loading' : ''}`} onClick={handleGoogleLogin} disabled={isLoading}>
                    <svg width="18" height="18" viewBox="0 0 24 24">{/* ... SVG Path ... */}</svg>
                    Sign in with Google
                </button>

                <div className="auth-footer">
                    Don't have an account? <Link to="/auth/signup" className="auth-link">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;