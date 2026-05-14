// ... imports
import { useAuth } from '../../context/AuthContext'; // <-- NEW IMPORT

// ... ToolCardComponent and other components ...

function ToolDashboard() {
    // Replace mock state with real context hook
    const { currentUser, isLoggedIn, isPremium, logout } = useAuth();
    const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Marketer';
    
    // ... rest of state (activeCategory, etc.)
    
    // ... filtering logic ...

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            
            {/* --- Header (Auth-driven) --- */}
            <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <div className="logo">{/* ... */}</div>
                    
                    <div className="nav-actions">
                        {isLoggedIn ? (
                            <div className="user-menu">
                                <div className="user-info">
                                    <div className="user-avatar">{userName.charAt(0)}</div>
                                    <span className="user-name">{userName}</span>
                                </div>
                                <Link to="/social-media" className="nav-btn primary">Dashboard</Link>
                                <button className="nav-btn" onClick={logout}>Logout</button> {/* Use real logout function */}
                            </div>
                        ) : (
                            <div id="auth-buttons" className="flex space-x-2">
                                <Link to="/auth/login" className="nav-btn">Sign In</Link>
                                <Link to="/auth/signup" className="nav-btn primary">Sign Up Free</Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            {/* Welcome Message (Uses real name) */}
            {isLoggedIn && (
                <div className="welcome-message mt-6">
                    <h2>Welcome back, <span id="welcome-name">{userName}</span>! 👋</h2>
                    <p>Your plan: {isPremium ? "Premium" : "Trial/Basic"}.</p>
                </div>
            )}

            {/* --- Tool Grid (Uses real auth state to lock/unlock) --- */}
            <section id="tools" className="tools-section">
                <div className="tools-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.map(tool => (
                        <ToolCardComponent 
                            key={tool.name} 
                            tool={tool} 
                            isLoggedIn={isLoggedIn} 
                            isPremium={isPremium} // Passed from context
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default ToolDashboard;