import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={{
            background: 'var(--white)',
            borderBottom: '1px solid var(--border)',
            padding: '0 2rem',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'var(--primary)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                }}>A</div>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>ACADEX</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right', display: 'none', flexDirection: 'column', '@media(min-width: 600px)': { display: 'flex' } }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.username}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role.toUpperCase()}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn"
                    style={{
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        padding: '8px 16px',
                        fontSize: '0.85rem'
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
