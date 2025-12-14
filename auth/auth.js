class AuthManager {
    constructor() {
        this.API_BASE = 'http://localhost:4000/api/auth';
        this.token = localStorage.getItem('meritlives_token');
        this.user = JSON.parse(localStorage.getItem('meritlives_user') || 'null');
        
        this.initializeEventListeners();
        this.checkAuthentication();
    }

    initializeEventListeners() {
        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
            
            // Password strength indicator
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
            }
        }

        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Google auth buttons
        const googleSignup = document.getElementById('google-signup');
        const googleLogin = document.getElementById('google-login');
        
        if (googleSignup || googleLogin) {
            this.loadGoogleAuth();
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const company = document.getElementById('company').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validation
        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            this.showError('Password must be at least 8 characters long');
            return;
        }

        this.showLoading('signup');

        try {
            const response = await fetch(`${this.API_BASE}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    company,
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess(data.message);
                this.storeAuthData(data.data);
                
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 2000);
            } else {
                throw new Error(data.error);
            }

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading('signup');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        this.showLoading('login');

        try {
            const response = await fetch(`${this.API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess(data.message);
                this.storeAuthData(data.data);
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            } else {
                throw new Error(data.error);
            }

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading('login');
        }
    }

    loadGoogleAuth() {
        // Load Google Sign-In API
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        // Initialize Google Auth when loaded
        script.onload = () => {
            this.initializeGoogleAuth();
        };
    }

    initializeGoogleAuth() {
        const googleSignup = document.getElementById('google-signup');
        const googleLogin = document.getElementById('google-login');

        const handleGoogleAuth = () => {
            google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
                callback: this.handleGoogleResponse.bind(this)
            });

            google.accounts.id.prompt();
        };

        if (googleSignup) {
            googleSignup.addEventListener('click', handleGoogleAuth);
        }

        if (googleLogin) {
            googleLogin.addEventListener('click', handleGoogleAuth);
        }
    }

    async handleGoogleResponse(response) {
        try {
            const authResponse = await fetch(`${this.API_BASE}/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: response.credential
                })
            });

            const data = await authResponse.json();

            if (data.success) {
                this.storeAuthData(data.data);
                window.location.href = '../index.html';
            } else {
                throw new Error(data.error);
            }

        } catch (error) {
            this.showError('Google authentication failed');
        }
    }

    storeAuthData(authData) {
        localStorage.setItem('meritlives_token', authData.token);
        localStorage.setItem('meritlives_user', JSON.stringify(authData.user));
        this.token = authData.token;
        this.user = authData.user;
    }

    checkAuthentication() {
        if (this.token && this.user) {
            // User is logged in
            if (window.location.pathname.includes('auth/')) {
                window.location.href = '../index.html';
            }
        } else {
            // User is not logged in
            if (!window.location.pathname.includes('auth/') && window.location.pathname !== '/') {
                window.location.href = 'auth/login.html';
            }
        }
    }

    logout() {
        localStorage.removeItem('meritlives_token');
        localStorage.removeItem('meritlives_user');
        this.token = null;
        this.user = null;
        window.location.href = 'auth/login.html';
    }

    updatePasswordStrength(password) {
        const strengthText = document.getElementById('password-strength-text');
        const strengthBar = document.getElementById('password-strength-bar');

        if (!strengthText || !strengthBar) return;

        let strength = 0;
        let text = 'Password strength';
        let className = '';

        if (password.length >= 8) strength += 25;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
        if (password.match(/\d/)) strength += 25;
        if (password.match(/[^a-zA-Z\d]/)) strength += 25;

        if (strength === 0) {
            text = 'Enter a password';
            className = '';
        } else if (strength <= 25) {
            text = 'Weak';
            className = 'strength-weak';
        } else if (strength <= 50) {
            text = 'Fair';
            className = 'strength-fair';
        } else if (strength <= 75) {
            text = 'Good';
            className = 'strength-good';
        } else {
            text = 'Strong';
            className = 'strength-strong';
        }

        strengthText.textContent = text;
        strengthBar.className = 'strength-fill ' + className;
    }

    showError(message) {
        this.hideMessages();
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }

    showSuccess(message) {
        this.hideMessages();
        const successDiv = document.getElementById('success-message');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.classList.remove('hidden');
        }
    }

    hideMessages() {
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        
        if (errorDiv) errorDiv.classList.add('hidden');
        if (successDiv) successDiv.classList.add('hidden');
    }

    showLoading(type) {
        const textElement = document.getElementById(`${type}-text`);
        const loadingElement = document.getElementById(`${type}-loading`);
        const button = document.getElementById(`${type}-btn`);

        if (textElement && loadingElement && button) {
            textElement.classList.add('hidden');
            loadingElement.classList.remove('hidden');
            button.disabled = true;
        }
    }

    hideLoading(type) {
        const textElement = document.getElementById(`${type}-text`);
        const loadingElement = document.getElementById(`${type}-loading`);
        const button = document.getElementById(`${type}-btn`);

        if (textElement && loadingElement && button) {
            textElement.classList.remove('hidden');
            loadingElement.classList.add('hidden');
            button.disabled = false;
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for global access
window.authManager = authManager;