import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Navigation items based on role
    const getNavigationItems = () => {
        const baseItems = [
            { id: 'dashboard', label: 'Dashboard', icon: '📊', path: `/${user?.role?.toLowerCase()}` },
            { id: 'requests', label: 'Requests', icon: '📝', path: `/${user?.role?.toLowerCase()}/requests` },
            { id: 'products', label: 'Products', icon: '📦', path: '/products' },
            { id: 'quotations', label: 'Quotations', icon: '💰', path: '/quotations' },
            { id: 'emails', label: 'Emails', icon: '📧', path: '/emails' },
            { id: 'analytics', label: 'Analytics', icon: '📈', path: `/${user?.role?.toLowerCase()}/analytics` },
        ];

        // Admin gets additional items
        if (user?.role === 'Admin') {
            baseItems.push({ id: 'users', label: 'Users', icon: '👥', path: '/admin/users' });
            baseItems.push({ id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings' });
        }

        return baseItems;
    };

    const navigationItems = getNavigationItems();

    const isActive = (path) => location.pathname === path;

    const handleNavigation = (path) => {
        navigate(path);
    };

    const getRoleBadgeClass = () => {
        switch (user?.role) {
            case 'Admin': return 'role-badge-admin';
            case 'Sales': return 'role-badge-sales';
            case 'Operations': return 'role-badge-operations';
            default: return '';
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">
                            <img src="/logo.png" alt="" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        {!sidebarCollapsed && <span className="logo-text">CludoBits</span>}
                    </div>
                    <button
                        className="collapse-btn"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        aria-label="Toggle Sidebar"
                    >
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navigationItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => handleNavigation(item.path)}
                            title={sidebarCollapsed ? item.label : ''}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {!sidebarCollapsed && (
                        <div className="sidebar-user">
                            <div className="user-avatar">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="user-info">
                                <p className="user-name">{user?.email?.split('@')[0]}</p>
                                <p className="user-email">{user?.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Top Bar */}
                <header className="top-bar">
                    <div className="top-bar-left">
                        <h1 className="page-title">
                            {navigationItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="top-bar-right">
                        <div className="user-section">
                            <span className={`role-badge ${getRoleBadgeClass()}`}>
                                {user?.role}
                            </span>

                            <div className="user-menu-wrapper">
                                <button
                                    className="user-button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <div className="user-avatar-small">
                                        {user?.email?.[0].toUpperCase()}
                                    </div>
                                    <span className="user-name-small">{user?.email?.split('@')[0]}</span>
                                    <span className="dropdown-arrow">▼</span>
                                </button>

                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        <div className="dropdown-header">
                                            <p className="dropdown-name">{user?.email?.split('@')[0]}</p>
                                            <p className="dropdown-email">{user?.email}</p>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                            <span>👤</span> Profile
                                        </button>
                                        <button className="dropdown-item" onClick={() => navigate('/settings')}>
                                            <span>⚙️</span> Settings
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item logout" onClick={logout}>
                                            <span>🚪</span> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
