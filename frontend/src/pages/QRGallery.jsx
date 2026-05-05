import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GraduationCap, Users, Shield, Download, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';

const QRGallery = () => {
    const [qrcodes, setQrcodes] = useState({ student: [], teacher: [], admin: [] });

    useEffect(() => { fetchQRList(); }, []);

    const fetchQRList = async () => {
        try {
            const [sRes, tRes, aRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/students/all`),
                axios.get(`${API_BASE_URL}/api/teachers/all`),
                axios.get(`${API_BASE_URL}/api/auth/admins`)
            ]);
            setQrcodes({
                student: sRes.data.map(s => ({ id: s.studentId, name: s.name, url: `${API_BASE_URL}/qrcode/student/${s.studentId}_qr.png` })),
                teacher: tRes.data.map(t => ({ id: t.teacherId, name: t.name, dept: t.department, url: `${API_BASE_URL}/qrcode/teacher/${t.teacherId}_qr.png` })),
                admin: aRes.data.map(a => ({ id: a.username, name: a.username, url: `${API_BASE_URL}/qrcode/admin/${a.username}_qr.png` }))
            });
        } catch (err) { console.error(err); }
    };

    const downloadQRZip = async (role) => {
        const endpoints = [
            `${API_BASE_URL}/api/qrcode-download/${role}`,
            `http://localhost:5000/api/qrcode-download/${role}`,
            `${API_BASE_URL}/qrcode/${role}_qrcodes.zip`,
            `http://localhost:5000/qrcode/${role}_qrcodes.zip`,
            `${API_BASE_URL}/qrcode-zip/${role}`,
            `http://localhost:5000/qrcode-zip/${role}`
        ];

        let success = false;
        for (const url of endpoints) {
            try {
                const response = await axios.get(url, { responseType: 'blob' });
                const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = blobUrl;
                link.setAttribute('download', `${role}_qrcodes.zip`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                success = true;
                break;
            } catch (err) {
                console.warn(`Failed to download from ${url}, trying fallback if available.`);
            }
        }

        if (!success) {
            alert('Failed to download the QR code zip file. Please try again.');
        }
    };

    const downloadAllQRs = async () => {
        const endpoints = [
            `${API_BASE_URL}/api/qrcode-download-all`,
            `http://localhost:5000/api/qrcode-download-all`
        ];

        let success = false;
        for (const url of endpoints) {
            try {
                const response = await axios.get(url, { responseType: 'blob' });
                const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = blobUrl;
                link.setAttribute('download', 'all_qrcodes.zip');
                document.body.appendChild(link);
                link.click();
                link.remove();
                success = true;
                break;
            } catch (err) {
                console.warn(`Failed to download all from ${url}, trying fallback.`);
            }
        }

        if (!success) {
            alert('Failed to download all QR codes zip file. Please try again.');
        }
    };

    const roleConfig = {
        student: { color: '#1e3a8a', gradient: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: 'rgba(59, 130, 246, 0.12)', pillClass: 'pill-primary', icon: <GraduationCap size={18} color="white" />, headerGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' },
        teacher: { color: '#065f46', gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: 'rgba(16, 185, 129, 0.12)', pillClass: 'pill-success', icon: <Users size={18} color="white" />, headerGradient: 'linear-gradient(135deg, #065f46 0%, #059669 100%)' },
        admin: { color: '#581c87', gradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: 'rgba(124, 58, 237, 0.12)', pillClass: 'pill-accent', icon: <Shield size={18} color="white" />, headerGradient: 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)' }
    };

    const downloadBtns = {
        student: { bg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
        teacher: { bg: 'linear-gradient(135deg, #065f46, #059669)' },
        admin: { bg: 'linear-gradient(135deg, #581c87, #7c3aed)' }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative' }}>
            {/* Background decoration */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0,
                background: 'radial-gradient(ellipse at 20% 0%, rgba(74, 108, 247, 0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(124, 58, 237, 0.04) 0%, transparent 50%)'
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                                QR Code <span className="gradient-text">Gallery</span>
                            </h1>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.95rem' }}>Scan any code for instant login • All users</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {['student', 'teacher', 'admin'].map(role => (
                                <button key={role} onClick={() => downloadQRZip(role)}
                                    style={{
                                        background: downloadBtns[role].bg, color: 'white', padding: '9px 18px', borderRadius: '100px', border: 'none',
                                        fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                    <Download size={14} /> {role.charAt(0).toUpperCase() + role.slice(1)}s
                                </button>
                            ))}
                            <button onClick={downloadAllQRs}
                                style={{
                                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white', padding: '9px 18px', borderRadius: '100px', border: 'none',
                                    fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.35)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.25)'; }}>
                                <Download size={14} /> Download All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Role Sections */}
                {['student', 'teacher', 'admin'].map(role => (
                    <div key={role} style={{ marginBottom: '3rem' }}>
                        {/* Section Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px', background: roleConfig[role].headerGradient,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem'
                            }}>
                                <span style={{ filter: 'brightness(10)' }}>{roleConfig[role].icon}</span>
                            </div>
                            <div>
                                <h2 style={{ textTransform: 'capitalize', fontWeight: '700', fontSize: '1.2rem', margin: 0, color: roleConfig[role].color }}>{role}s</h2>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{qrcodes[role].length} {role === 'admin' ? 'account' : 'registered'}{qrcodes[role].length !== 1 ? 's' : ''}</p>
                            </div>
                            <span className={`pill ${roleConfig[role].pillClass}`} style={{ marginLeft: '4px', fontWeight: '600' }}>{qrcodes[role].length}</span>
                        </div>

                        {/* QR Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
                            {qrcodes[role].map(qr => {
                                const themeColor = role === 'student' ? '#3b82f6' : role === 'teacher' ? '#10b981' : '#8b5cf6';
                                return (
                                    <div key={qr.id} style={{
                                        position: 'relative',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        textAlign: 'center', padding: '2rem 1.5rem',
                                        background: '#070b19', // Dark background for ID card
                                        borderRadius: '16px',
                                        border: `1px solid rgba(${role === 'student' ? '59, 130, 246' : role === 'teacher' ? '16, 185, 129' : '139, 92, 246'}, 0.3)`,
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                        transition: 'all 0.3s ease',
                                        overflow: 'hidden',
                                        minHeight: '380px',
                                        justifyContent: 'space-between'
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${themeColor}33`; e.currentTarget.style.borderColor = themeColor; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = `${themeColor}4D`; }}>
                                        
                                        {/* Abstract background waves/dots at bottom */}
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                                            background: `radial-gradient(circle at 50% 150%, ${themeColor}26 0%, transparent 70%)`,
                                            zIndex: 0, pointerEvents: 'none'
                                        }}>
                                            <div style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%',
                                                backgroundImage: `radial-gradient(${themeColor}4D 1px, transparent 1px)`,
                                                backgroundSize: '8px 8px',
                                                opacity: 0.5,
                                                maskImage: 'linear-gradient(to top, black, transparent)',
                                                WebkitMaskImage: 'linear-gradient(to top, black, transparent)'
                                            }}></div>
                                        </div>

                                        <div style={{ zIndex: 1, width: '100%' }}>
                                            {/* ACADEX Logo Header */}
                                            <div style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '2px', marginBottom: '1rem', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <span style={{ position: 'relative', display: 'inline-block', marginRight: '4px' }}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginTop: '-4px' }}>
                                                        <path d="M12 2L2 20H22L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M12 10L8 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </span>
                                                ACAD<span style={{ color: themeColor }}>EX</span>
                                            </div>
                                            
                                            {/* Glowing separator line */}
                                            <div style={{ 
                                                width: '100%', height: '1px', background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`,
                                                marginBottom: '1.5rem', boxShadow: `0 0 10px ${themeColor}`
                                            }}></div>

                                            {/* QR Code */}
                                            <div style={{
                                                background: 'white', padding: '12px', borderRadius: '12px', display: 'inline-block',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.3)', marginBottom: '1.5rem'
                                            }}>
                                                <img src={qr.url} alt={qr.id}
                                                    style={{ width: '100%', maxWidth: '160px', height: 'auto', aspectRatio: '1/1', display: 'block', objectFit: 'contain' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }} />
                                            </div>
                                        </div>

                                        {/* User Details */}
                                        <div style={{ zIndex: 1, width: '100%', paddingBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: '800', color: 'white', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                                                {qr.name || qr.id}
                                            </div>
                                            {/* Subtle separator below name */}
                                            <div style={{ 
                                                width: '60%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                                margin: '0 auto 0.5rem auto'
                                            }}></div>
                                            <div style={{ fontSize: '1.05rem', color: themeColor, fontWeight: '700', letterSpacing: '1px' }}>
                                                {qr.id !== qr.name ? qr.id : (role === 'admin' ? 'ADMIN' : 'ID')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
                    <button className="btn btn-secondary" onClick={() => window.history.back()}
                        style={{ padding: '10px 28px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRGallery;
