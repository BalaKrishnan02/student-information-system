import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GraduationCap, Users, Shield, Download, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';

const QRGallery = () => {
    const [qrcodes, setQrcodes] = useState({ student: [], teacher: [], admin: [] });
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => { fetchQRList(); }, []);

    const fetchQRList = async () => {
        try {
            const [sRes, tRes, aRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/students/all`),
                axios.get(`${API_BASE_URL}/api/teachers/all`),
                axios.get(`${API_BASE_URL}/api/auth/admins`)
            ]);
            const timestamp = Date.now();
            setQrcodes({
                student: sRes.data.map(s => ({ id: s.studentId, name: s.name, url: `${API_BASE_URL}/qrcode/student/${s.studentId}_qr.png?t=${timestamp}` })),
                teacher: tRes.data.map(t => ({ id: t.teacherId, name: t.name, dept: t.department, url: `${API_BASE_URL}/qrcode/teacher/${t.teacherId}_qr.png?t=${timestamp}` })),
                admin:   aRes.data.map(a => ({ id: a.username,  name: a.username, url: `${API_BASE_URL}/qrcode/admin/${a.username}_qr.png?t=${timestamp}` }))
            });
        } catch (err) { console.error(err); }
    };

    // Fetch a cross-origin image as base64 blob (no CORS canvas taint)
    const fetchImageAsDataURL = (url) => new Promise((resolve, reject) => {
        fetch(url)
            .then(r => r.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            })
            .catch(reject);
    });

    const loadScript = (src) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
    });

    // Draw the full ID card on a canvas and return a PNG data URL
    const drawIDCard = async (qr, role) => {
        const themeColor = role === 'student' ? '#3b82f6' : role === 'teacher' ? '#10b981' : '#8b5cf6';
        const themeRGB   = role === 'student' ? '59,130,246' : role === 'teacher' ? '16,185,129' : '139,92,246';

        // Matches on-screen card: ~240px wide, compact aspect ratio
        const W = 250, H = 400, scale = 4;
        const canvas = document.createElement('canvas');
        canvas.width  = W * scale;
        canvas.height = H * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        // Helper: rounded rectangle path
        const rr = (x, y, w, h, r) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        };

        // ── Dark background ──────────────────────────────────────────
        ctx.fillStyle = '#070b19';
        rr(0, 0, W, H, 16);
        ctx.fill();

        // ── Border ──────────────────────────────────────────────────
        ctx.strokeStyle = `rgba(${themeRGB},0.3)`;
        ctx.lineWidth = 1;
        rr(0, 0, W, H, 16);
        ctx.stroke();

        // ── Bottom dot-grid pattern ──────────────────────────────────
        ctx.save();
        for (let dy = H * 0.58; dy < H - 2; dy += 8) {
            for (let dx = 4; dx < W; dx += 8) {
                const p = (dy - H * 0.58) / (H * 0.42);
                ctx.globalAlpha = p * 0.25;
                ctx.fillStyle = `rgba(${themeRGB},1)`;
                ctx.beginPath();
                ctx.arc(dx, dy, 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        // ── ACADEX Logo (matches on-screen 1.8rem ≈ 24px at card scale) ─
        const FSLOGO = 24;
        ctx.font = `800 ${FSLOGO}px Arial`;
        const acadW = ctx.measureText('ACAD').width;
        const exW   = ctx.measureText('EX').width;
        const icoW  = 16, gap = 4;
        const logoLeft = (W - (icoW + gap + acadW + exW)) / 2;
        const logoBase = 42;

        // Triangle icon
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.lineCap  = 'round';
        ctx.beginPath();
        ctx.moveTo(logoLeft + icoW / 2, logoBase - icoW + 2);
        ctx.lineTo(logoLeft,            logoBase + 2);
        ctx.lineTo(logoLeft + icoW,     logoBase + 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(logoLeft + icoW / 2, logoBase - icoW * 0.45 + 2);
        ctx.lineTo(logoLeft + icoW * 0.3, logoBase + 2);
        ctx.stroke();

        // Text
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
        ctx.fillText('ACAD', logoLeft + icoW + gap, logoBase);
        ctx.fillStyle = themeColor;
        ctx.fillText('EX', logoLeft + icoW + gap + acadW, logoBase);

        // ── Glowing separator line ───────────────────────────────────
        const g1 = ctx.createLinearGradient(20, 0, W - 20, 0);
        g1.addColorStop(0, 'transparent');
        g1.addColorStop(0.5, themeColor);
        g1.addColorStop(1, 'transparent');
        ctx.strokeStyle = g1;
        ctx.lineWidth  = 1;
        ctx.shadowColor = themeColor;
        ctx.shadowBlur  = 6;
        ctx.beginPath();
        ctx.moveTo(20, logoBase + 14);
        ctx.lineTo(W - 20, logoBase + 14);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // ── White QR box ─────────────────────────────────────────────
        const qrTop = logoBase + 26;
        const boxX  = 22, boxW = W - 44, boxH = boxW, qrPad = 10;

        ctx.shadowColor   = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur    = 14;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = 'white';
        rr(boxX, qrTop, boxW, boxH, 12);
        ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

        // QR image (fetched as blob — zero CORS issues)
        try {
            const qrDataUrl = await fetchImageAsDataURL(qr.url);
            const qrImg = await new Promise((res, rej) => {
                const img = new Image();
                img.onload = () => res(img);
                img.onerror = rej;
                img.src = qrDataUrl;
            });
            ctx.drawImage(qrImg, boxX + qrPad, qrTop + qrPad, boxW - qrPad * 2, boxH - qrPad * 2);
        } catch (e) {
            ctx.fillStyle = '#aaa';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('QR not available', W / 2, qrTop + boxH / 2);
        }

        // ── Name ─────────────────────────────────────────────────────
        const nameY = qrTop + boxH + 28;
        ctx.font = '800 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText((qr.name || qr.id).toUpperCase(), W / 2, nameY);

        // Thin separator below name
        const g2 = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
        g2.addColorStop(0, 'transparent');
        g2.addColorStop(0.5, 'rgba(255,255,255,0.2)');
        g2.addColorStop(1, 'transparent');
        ctx.strokeStyle = g2;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W * 0.2, nameY + 10);
        ctx.lineTo(W * 0.8, nameY + 10);
        ctx.stroke();

        // ── Roll No. ─────────────────────────────────────────────────
        ctx.font = '700 18px Arial';
        ctx.fillStyle = themeColor;
        ctx.fillText(
            qr.id !== qr.name ? qr.id : (role === 'admin' ? 'ADMIN' : 'ID'),
            W / 2, nameY + 30
        );

        return canvas.toDataURL('image/png');
    };

    // ── Download helpers ─────────────────────────────────────────────
    const generateAndDownloadZip = async (rolesToDownload, zipName) => {
        setIsDownloading(true);
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
            const zip = new window.JSZip();
            for (const role of rolesToDownload) {
                const folder = zip.folder(role + 's');
                for (const qr of qrcodes[role]) {
                    const dataUrl = await drawIDCard(qr, role);
                    const safeName = (qr.name || qr.id).replace(/[^a-zA-Z0-9 -]/g, '');
                    folder.file(`${safeName}_ID_Card.png`, dataUrl.split(',')[1], { base64: true });
                }
            }
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(content);
            link.download = zipName;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('ZIP error:', err);
            alert('Failed to generate ZIP. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadQRZip  = (role) => generateAndDownloadZip([role], `${role}_id_cards.zip`);
    const downloadAllQRs = ()     => generateAndDownloadZip(['student', 'teacher', 'admin'], 'all_id_cards.zip');

    const downloadSingleQR = async (role, qr) => {
        setIsDownloading(true);
        try {
            const dataUrl  = await drawIDCard(qr, role);
            const safeName = (qr.name || qr.id).replace(/[^a-zA-Z0-9 -]/g, '');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${safeName}_ID_Card.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download image. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // ── UI config ────────────────────────────────────────────────────
    const roleConfig = {
        student: { color: '#1e3a8a', pillClass: 'pill-primary', icon: <GraduationCap size={18} color="white" />, headerGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' },
        teacher: { color: '#065f46', pillClass: 'pill-success', icon: <Users size={18} color="white" />,         headerGradient: 'linear-gradient(135deg, #065f46 0%, #059669 100%)' },
        admin:   { color: '#581c87', pillClass: 'pill-accent',  icon: <Shield size={18} color="white" />,        headerGradient: 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)' }
    };

    const downloadBtns = {
        student: { bg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
        teacher: { bg: 'linear-gradient(135deg, #065f46, #059669)' },
        admin:   { bg: 'linear-gradient(135deg, #581c87, #7c3aed)' }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative' }}>
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0,
                background: 'radial-gradient(ellipse at 20% 0%, rgba(74,108,247,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(124,58,237,0.04) 0%, transparent 50%)'
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
                                <button key={role} onClick={() => downloadQRZip(role)} disabled={isDownloading}
                                    style={{ background: isDownloading ? '#475569' : downloadBtns[role].bg, color: 'white', padding: '9px 18px', borderRadius: '100px', border: 'none', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: isDownloading ? 'not-allowed' : 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                    onMouseEnter={e => { if (!isDownloading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)'; } }}
                                    onMouseLeave={e => { if (!isDownloading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}>
                                    <Download size={14} /> {isDownloading ? '...' : `${role.charAt(0).toUpperCase() + role.slice(1)}s`}
                                </button>
                            ))}
                            <button onClick={downloadAllQRs} disabled={isDownloading}
                                style={{ background: isDownloading ? '#475569' : 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white', padding: '9px 18px', borderRadius: '100px', border: 'none', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', cursor: isDownloading ? 'not-allowed' : 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: isDownloading ? 'none' : '0 4px 12px rgba(236,72,153,0.25)' }}
                                onMouseEnter={e => { if (!isDownloading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(236,72,153,0.35)'; } }}
                                onMouseLeave={e => { if (!isDownloading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(236,72,153,0.25)'; } }}>
                                <Download size={14} /> {isDownloading ? 'Downloading...' : 'Download All'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Role Sections */}
                {['student', 'teacher', 'admin'].map(role => (
                    <div key={role} style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: roleConfig[role].headerGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ filter: 'brightness(10)' }}>{roleConfig[role].icon}</span>
                            </div>
                            <div>
                                <h2 style={{ textTransform: 'capitalize', fontWeight: '700', fontSize: '1.2rem', margin: 0, color: roleConfig[role].color }}>{role}s</h2>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{qrcodes[role].length} {role === 'admin' ? 'account' : 'registered'}{qrcodes[role].length !== 1 ? 's' : ''}</p>
                            </div>
                            <span className={`pill ${roleConfig[role].pillClass}`} style={{ marginLeft: '4px', fontWeight: '600' }}>{qrcodes[role].length}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
                            {qrcodes[role].map(qr => {
                                const themeColor = role === 'student' ? '#3b82f6' : role === 'teacher' ? '#10b981' : '#8b5cf6';
                                return (
                                    <div id={`qr-card-${role}-${qr.id}`} key={qr.id} style={{
                                        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        textAlign: 'center', padding: '2rem 1.5rem',
                                        background: '#070b19', borderRadius: '16px',
                                        border: `1px solid rgba(${role === 'student' ? '59,130,246' : role === 'teacher' ? '16,185,129' : '139,92,246'},0.3)`,
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)', transition: 'all 0.3s ease',
                                        overflow: 'hidden', minHeight: '380px', justifyContent: 'space-between'
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${themeColor}33`; e.currentTarget.style.borderColor = themeColor; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = `${themeColor}4D`; }}>

                                        {/* Single-card download button */}
                                        <button
                                            data-html2canvas-ignore="true"
                                            onClick={() => downloadSingleQR(role, qr)}
                                            title="Download this ID Card"
                                            disabled={isDownloading}
                                            style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isDownloading ? 'not-allowed' : 'pointer', color: 'white', zIndex: 10, transition: 'all 0.2s', opacity: 0.6 }}
                                            onMouseEnter={e => { if (!isDownloading) { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1.1)'; } }}
                                            onMouseLeave={e => { if (!isDownloading) { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; } }}>
                                            <Download size={16} />
                                        </button>

                                        {/* Dot pattern */}
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: `radial-gradient(circle at 50% 150%, ${themeColor}26 0%, transparent 70%)`, zIndex: 0, pointerEvents: 'none' }}>
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', backgroundImage: `radial-gradient(${themeColor}4D 1px, transparent 1px)`, backgroundSize: '8px 8px', opacity: 0.5, maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)' }}></div>
                                        </div>

                                        <div style={{ zIndex: 1, width: '100%' }}>
                                            {/* ACADEX Logo */}
                                            <div style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '2px', marginBottom: '1rem', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <span style={{ position: 'relative', display: 'inline-block', marginRight: '4px' }}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginTop: '-4px' }}>
                                                        <path d="M12 2L2 20H22L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M12 10L8 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </span>
                                                ACAD<span style={{ color: themeColor }}>EX</span>
                                            </div>

                                            {/* Glowing separator */}
                                            <div style={{ width: '100%', height: '1px', background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`, marginBottom: '1.5rem', boxShadow: `0 0 10px ${themeColor}` }}></div>

                                            {/* QR image */}
                                            <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', marginBottom: '1.5rem' }}>
                                                <img src={qr.url} alt={qr.id} crossOrigin="anonymous"
                                                    style={{ width: '100%', maxWidth: '160px', height: 'auto', aspectRatio: '1/1', display: 'block', objectFit: 'contain' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }} />
                                            </div>
                                        </div>

                                        {/* Name & ID */}
                                        <div style={{ zIndex: 1, width: '100%', paddingBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: '800', color: 'white', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 5px' }}>
                                                {qr.name || qr.id}
                                            </div>
                                            <div style={{ width: '60%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', margin: '0 auto 0.5rem auto' }}></div>
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
