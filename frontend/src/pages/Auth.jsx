import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { LogIn, UserPlus, KeyRound, QrCode, User, Lock, ChevronDown, AlertCircle, ScanLine, ExternalLink, GraduationCap, BookOpen, Shield } from 'lucide-react';
import { API_BASE_URL } from '../config';


const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loginMode, setLoginMode] = useState('password');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'student'
    });
    const { login, qrLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [scannerActive, setScannerActive] = useState(false);

    useEffect(() => {
        let html5QrCode = null;

        const startScanner = async () => {
            try {
                html5QrCode = new Html5Qrcode("reader");
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                await html5QrCode.start(
                    { facingMode: "user" },
                    config,
                    onScanSuccess
                );
            } catch (err) {
                console.error("Camera access failed", err);
                setError("Camera access denied or not found. Please check permissions.");
            }
        };

        if (loginMode === 'qr' && scannerActive) {
            startScanner();
        }

        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(err => console.error("Failed to stop scanner", err));
            }
        };
    }, [loginMode, scannerActive]);

    async function onScanSuccess(decodedText) {
        try {
            const data = JSON.parse(decodedText);
            if (data.type === 'SIS_LOGIN_QR') {
                const res = await qrLogin(data.username, data.role);
                if (res.success) {
                    setScannerActive(false);
                    navigate('/dashboard');
                } else {
                    setError(res.message);
                }
            } else {
                setError("Invalid QR Code for this system.");
            }
        } catch (e) {
            setError("Invalid QR Code format.");
        }
    }

    function onScanFailure(error) { }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (isLogin) {
            const res = await login(formData.username, formData.password, null);
            if (res.success) {
                navigate('/dashboard');
            } else {
                setError(res.message);
            }
        } else {
            try {
                await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
                setIsLogin(true);
                alert('Registration successful! Please login.');
            } catch (err) {
                setError(err.response?.data?.message || 'Registration failed');
            }
        }
    };

    const roleIcons = {
        student: <GraduationCap size={16} />,
        teacher: <BookOpen size={16} />,
        admin: <Shield size={16} />
    };

    return (
        <div style={{
            display: 'flex', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif"
        }}>
            {/* ── Left Panel — Branding ── */}
            <div style={{
                flex: '0 0 45%', position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                padding: '3rem', color: 'white'
            }}>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: '-80px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', right: '-40px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', filter: 'blur(50px)' }} />
                <div style={{ position: 'absolute', top: '40%', right: '10%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', filter: 'blur(40px)' }} />

                {/* Grid pattern */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                }} />

                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '380px' }}>
                    {/* Logo */}
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: '800', color: 'white',
                        margin: '0 auto 2rem', border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                    }}>
                        A
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.75rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                        ACADEX
                    </h1>
                    <p style={{ fontSize: '1.05rem', opacity: 0.75, lineHeight: 1.6, marginBottom: '2.5rem', fontWeight: '400' }}>
                        Student Information System
                    </p>

                    {/* Feature list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                        {[
                            { icon: <GraduationCap size={18} />, text: 'Student Management & Profiles' },
                            { icon: <BookOpen size={18} />, text: 'Course & Grade Tracking' },
                            { icon: <QrCode size={18} />, text: 'QR Code Authentication' },
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                background: 'rgba(255,255,255,0.07)', padding: '12px 16px',
                                borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.12)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    {item.icon}
                                </div>
                                <span style={{ fontSize: '0.88rem', opacity: 0.85, fontWeight: '500' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div style={{ position: 'absolute', bottom: '1.5rem', opacity: 0.4, fontSize: '0.75rem', fontWeight: '500' }}>
                    © 2026 Acadex • College Project
                </div>
            </div>

            {/* ── Right Panel — Form ── */}
            <div style={{
                flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
                padding: '2rem', background: '#f8fafc',
                position: 'relative'
            }}>
                {/* Subtle background pattern */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.4,
                    background: 'radial-gradient(ellipse at 70% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 50%)'
                }} />

                <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
                            {isLogin ? 'Welcome back' : 'Get started'}
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                            {isLogin
                                ? (loginMode === 'password' ? 'Sign in to access your dashboard' : 'Scan your QR code to sign in')
                                : 'Create a new account to get started'
                            }
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: '#fef2f2', color: '#dc2626', padding: '12px 16px',
                            borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: '500',
                            border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* Login Mode Toggle */}
                    {isLogin && (
                        <div style={{
                            display: 'flex', background: '#e2e8f0', padding: '4px',
                            borderRadius: '12px', marginBottom: '1.75rem'
                        }}>
                            <button
                                onClick={() => { setLoginMode('password'); setScannerActive(false); setError(''); }}
                                style={{
                                    flex: 1, padding: '11px', border: 'none', borderRadius: '9px', cursor: 'pointer',
                                    fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.25s',
                                    background: loginMode === 'password' ? 'white' : 'transparent',
                                    color: loginMode === 'password' ? '#4338ca' : '#64748b',
                                    boxShadow: loginMode === 'password' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                            ><KeyRound size={15} /> Password</button>
                            <button
                                onClick={() => { setLoginMode('qr'); setScannerActive(true); setError(''); }}
                                style={{
                                    flex: 1, padding: '11px', border: 'none', borderRadius: '9px', cursor: 'pointer',
                                    fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.25s',
                                    background: loginMode === 'qr' ? 'white' : 'transparent',
                                    color: loginMode === 'qr' ? '#4338ca' : '#64748b',
                                    boxShadow: loginMode === 'qr' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                            ><QrCode size={15} /> QR Scan</button>
                        </div>
                    )}

                    {/* QR Scanner */}
                    {isLogin && loginMode === 'qr' ? (
                        <div style={{ textAlign: 'center' }}>
                            <div id="reader" style={{
                                width: '100%', minHeight: '300px', borderRadius: '16px',
                                overflow: 'hidden', border: '2px solid #e2e8f0',
                                background: '#f1f5f9'
                            }}></div>
                            <div style={{
                                marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '8px', color: '#64748b', fontSize: '0.85rem'
                            }}>
                                <ScanLine size={16} style={{ color: '#4338ca' }} />
                                <span><strong style={{ color: '#4338ca' }}>Camera Active</strong> — Align QR code within the frame</span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Username */}
                            <div>
                                <label style={{
                                    display: 'block', marginBottom: '6px', fontWeight: '600',
                                    fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase',
                                    letterSpacing: '0.04em'
                                }}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                        color: '#94a3b8', display: 'flex'
                                    }}><User size={17} /></div>
                                    <input
                                        name="username" placeholder="Enter your ID (e.g. 23TH0201)"
                                        value={formData.username} onChange={handleChange} required
                                        style={{
                                            width: '100%', padding: '13px 14px 13px 42px', borderRadius: '12px',
                                            border: '1.5px solid #e2e8f0', fontSize: '0.92rem', color: '#1e293b',
                                            background: 'white', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label style={{
                                    display: 'block', marginBottom: '6px', fontWeight: '600',
                                    fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase',
                                    letterSpacing: '0.04em'
                                }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                        color: '#94a3b8', display: 'flex'
                                    }}><Lock size={17} /></div>
                                    <input
                                        name="password" type="password" placeholder="••••••••"
                                        value={formData.password} onChange={handleChange} required={isLogin}
                                        style={{
                                            width: '100%', padding: '13px 14px 13px 42px', borderRadius: '12px',
                                            border: '1.5px solid #e2e8f0', fontSize: '0.92rem', color: '#1e293b',
                                            background: 'white', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Role Selector */}
                            {!isLogin && (
                                <div>
                                    <label style={{
                                        display: 'block', marginBottom: '6px', fontWeight: '600',
                                        fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase',
                                        letterSpacing: '0.04em'
                                    }}>Register As</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[
                                            { value: 'student', label: 'Student', icon: <GraduationCap size={16} />, color: '#3b82f6', bg: '#eff6ff' },
                                            { value: 'teacher', label: 'Teacher', icon: <BookOpen size={16} />, color: '#059669', bg: '#ecfdf5' },
                                            { value: 'admin', label: 'Admin', icon: <Shield size={16} />, color: '#7c3aed', bg: '#f5f3ff' }
                                        ].map(role => (
                                            <button key={role.value} type="button"
                                                onClick={() => setFormData({ ...formData, role: role.value })}
                                                style={{
                                                    flex: 1, padding: '11px 8px', borderRadius: '10px', cursor: 'pointer',
                                                    fontSize: '0.82rem', fontWeight: '600',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                    transition: 'all 0.25s',
                                                    background: formData.role === role.value ? role.bg : '#f8fafc',
                                                    color: formData.role === role.value ? role.color : '#94a3b8',
                                                    border: formData.role === role.value ? `2px solid ${role.color}` : '2px solid #e2e8f0',
                                                    boxShadow: formData.role === role.value ? `0 2px 8px ${role.color}18` : 'none'
                                                }}>
                                                {role.icon} {role.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button type="submit" style={{
                                width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: '600',
                                marginTop: '0.5rem', border: 'none', cursor: 'pointer',
                                borderRadius: '12px', color: 'white',
                                background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.25s', letterSpacing: '0.01em'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.35)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)'; }}>
                                {isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div style={{
                        marginTop: '2rem', display: 'flex', flexDirection: 'column',
                        gap: '0.75rem', alignItems: 'center'
                    }}>
                        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <span
                                style={{
                                    color: '#4338ca', fontWeight: '600', cursor: 'pointer', marginLeft: '6px',
                                    transition: 'color 0.2s'
                                }}
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                onMouseEnter={e => e.target.style.color = '#3730a3'}
                                onMouseLeave={e => e.target.style.color = '#4338ca'}
                            >
                                {isLogin ? "Register" : "Sign In"}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
