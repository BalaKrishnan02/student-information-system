import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import TeacherDashboard from '../components/dashboards/TeacherDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, QrCode, LogOut, GraduationCap, BookOpen, Shield, Menu, X } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) setIsMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!user) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading...</div>;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const themeColors = {
        student: { gradient: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)', accent: '#3b82f6', label: 'Student Portal', icon: <GraduationCap size={18} /> },
        teacher: { gradient: 'linear-gradient(180deg, #065f46 0%, #047857 50%, #059669 100%)', accent: '#10b981', label: 'Faculty Portal', icon: <BookOpen size={18} /> },
        admin: { gradient: 'linear-gradient(180deg, #581c87 0%, #6d28d9 50%, #7c3aed 100%)', accent: '#8b5cf6', label: 'Admin Console', icon: <Shield size={18} /> },
    };

    const theme = themeColors[user.role] || themeColors.student;

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden', background: 'var(--bg-main)' }}>
            
            {/* ── Mobile Header ── */}
            {isMobile && (
                <header style={{
                    height: '60px',
                    background: theme.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1rem',
                    color: 'white',
                    zIndex: 100,
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '800'
                        }}>A</div>
                        <span style={{ fontWeight: '700', letterSpacing: '0.02em' }}>ACADEX</span>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>
            )}

            {/* ── Sidebar ── */}
            <aside style={{
                width: isMobile ? '100%' : '230px',
                height: isMobile ? (isMobileMenuOpen ? 'calc(100vh - 60px)' : '0') : '100%',
                background: theme.gradient,
                display: (isMobile && !isMobileMenuOpen) ? 'none' : 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                position: isMobile ? 'absolute' : 'relative',
                top: isMobile ? '60px' : '0',
                left: '0',
                zIndex: 99,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out'
            }}>
                {!isMobile && (
                    <>
                        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ position: 'absolute', bottom: '-40px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                    </>
                )}

                {/* Logo Section (Desktop Only) */}
                {!isMobile && (
                    <div style={{ padding: '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: '800', fontSize: '1.1rem',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>A</div>
                        <div>
                            <div style={{ color: 'white', fontWeight: '700', fontSize: '1.05rem', letterSpacing: '0.02em' }}>ACADEX</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.68rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{theme.label}</div>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <div style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <SidebarBtn 
                        icon={<LayoutDashboard size={18} />} 
                        label="Dashboard" 
                        active 
                        onClick={() => { if(isMobile) setIsMobileMenuOpen(false); }}
                    />
                    {user.role === 'admin' && (
                        <SidebarBtn 
                            icon={<QrCode size={18} />} 
                            label="QR Gallery" 
                            onClick={() => { navigate('/qr-codes'); if(isMobile) setIsMobileMenuOpen(false); }} 
                        />
                    )}
                </div>

                {/* User + Logout */}
                <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: isMobile ? '2rem' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '8px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', color: 'white', fontWeight: '600',
                            border: '1.5px solid rgba(255,255,255,0.25)'
                        }}>
                            {user.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: 'white', fontWeight: '600', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{user.role}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '9px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
                        cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500',
                        transition: 'all 0.2s', width: '100%'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}>
                        <LogOut size={15} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                height: isMobile ? 'calc(100vh - 60px)' : '100vh', 
                overflowY: 'auto', 
                background: 'var(--bg-main)',
                width: '100%'
            }}>
                <div style={{ padding: isMobile ? '1rem' : '0', width: '100%' }}>
                    {user.role === 'student' && <StudentDashboard />}
                    {user.role === 'teacher' && <TeacherDashboard />}
                    {user.role === 'admin' && <AdminDashboard />}
                </div>
            </main>
        </div>
    );
};

const SidebarBtn = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', borderRadius: '10px', border: 'none',
        background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
        color: active ? 'white' : 'rgba(255,255,255,0.7)',
        cursor: 'pointer', fontSize: '0.88rem', fontWeight: active ? '600' : '500',
        transition: 'all 0.2s', width: '100%', textAlign: 'left'
    }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; } }}>
        {icon} <span>{label}</span>
    </button>
);

export default Dashboard;
