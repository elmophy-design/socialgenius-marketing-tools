import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, createUserWithEmailAndPassword, updateProfile, googleProvider, signInWithPopup } from '../../firebase';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update user profile with name
            await updateProfile(userCredential.user, { 
                displayName: name 
            });

            // In a real app, you would save 'company' to Firestore here.

            alert("Account created successfully! Redirecting to Dashboard.");
            navigate('/social-media'); // Redirect to dashboard/premium tool
        } catch (err) {
            console.error("Signup Error:", err.message);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
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
    
    // Simplified strength check for UI only
    const checkPasswordStrength = (p) => {
        if (p.length < 8) return { text: "Weak", class: "weak" };
        let score = 0;
        if (/[a-z]/.test(p)) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/\d/.test(p)) score++;
        if (/[^a-zA-Z0-9]/.test(p)) score++;
        
        if (score === 4) return { text: "Strong", class: "strong" };
        if (score >= 2 && p.length >= 8) return { text: "Good", class: "good" };
        return { text: "Fair", class: "fair" };
    };
    
    const strength = checkPasswordStrength(password);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span>🚀</span><span>Meritlives Tools</span>
                    </div>
                    <h1 className="auth-title">Create Your Account</h1>
                    <p className="auth-subtitle">Join thousands of marketers using our free tools</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSignup}>
                    {/* Name */}
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input type="text" id="name" className="form-control" placeholder="Enter your full name" required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input type="email" id="email" className="form-control" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    {/* Company (Optional) */}
                    <div className="form-group">
                        <label htmlFor="company" className="form-label">Company (Optional)</label>
                        <input type="text" id="company" className="form-control" placeholder="Where do you work?" value={company} onChange={(e) => setCompany(e.target.value)} />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" id="password" className="form-control" placeholder="Create a strong password" required minLength="8" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <div className="password-strength">
                            <div id="password-strength-text">Strength: {strength.text}</div>
                            <div className="strength-bar">
                                <div id="password-strength-bar" className={`strength-fill strength-${strength.class}`}></div>
                            </div>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
                        <input type="password" id="confirm-password" className="form-control" placeholder="Confirm your password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>

                    <button type="submit" className={`btn-primary ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                        <span id="signup-text">{isLoading ? '' : 'Create Account'}</span>
                    </button>
                </form>

                <div className="divider"><span>Or continue with</span></div>

                <button className={`btn-google ${isLoading ? 'loading' : ''}`} onClick={handleGoogleSignup} disabled={isLoading}>
                    <svg width="18" height="18" viewBox="0 0 24 24">{/* ... SVG Path ... */}</svg>
                    Sign up with Google
                </button>

                <div className="terms">
                    By creating an account, you agree to our <Link to="/terms" className="auth-link">Terms of Service</Link> and <Link to="/privacy" className="auth-link">Privacy Policy</Link>.
                </div>

                <div className="auth-footer">
                    Already have an account? <Link to="/auth/login" className="auth-link">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;