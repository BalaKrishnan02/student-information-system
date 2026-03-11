import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { User, BookOpen, BarChart3, BookMarked, Calendar, Award, Mail, MapPin, Building2, CalendarDays } from 'lucide-react';
import { API_BASE_URL } from '../../config';


const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [marks, setMarks] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (user?.username) fetchStudentData();
    }, [user]);

    const fetchStudentData = async () => {
        const studentId = user.username;
        try { const res = await axios.get(`${API_BASE_URL}/api/students/${studentId}`); setProfile(res.data); } catch (err) { console.error("Profile fetch failed", err); }
        try { const res = await axios.get(`${API_BASE_URL}/api/marks/student/${studentId}`); setMarks(res.data); } catch (err) { console.error("Marks fetch failed", err); }
        try { const res = await axios.get(`${API_BASE_URL}/api/attendance/student/${studentId}`); setAttendance(res.data); } catch (err) { console.error("Attendance fetch failed", err); }
        try { const res = await axios.get(`${API_BASE_URL}/api/enrollments/student/${studentId}`); setEnrollments(res.data); } catch (err) { console.error("Enrollments fetch failed", err); }
    };

    const attendancePercent = attendance.length > 0
        ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100)
        : 0;

    const avgMarks = marks.length > 0
        ? Math.round(marks.reduce((sum, m) => sum + (m.marks || 0), 0) / marks.length)
        : 0;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={15} /> },
        { id: 'courses', label: 'Courses', icon: <BookOpen size={15} /> },
        { id: 'results', label: 'Results & Attendance', icon: <BarChart3 size={15} /> },
    ];

    return (
        <div className="student-dashboard">
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem 2rem', gap: '1.25rem' }}>

                {/* ── Hero Banner ── */}
                <div className="student-hero animate-fadeInUp">
                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {profile?.photo ? (
                                <img src={`${API_BASE_URL}/profile/${profile.photo}`} alt={profile.name}
                                    style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }} />
                            ) : (
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', fontWeight: '700', color: 'white',
                                    border: '2px solid rgba(255,255,255,0.3)'
                                }}>
                                    {profile?.name?.[0] || '?'}
                                </div>
                            )}
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                                    Welcome back, {profile?.name?.split(' ').find(n => n.length > 2) || profile?.name?.split(' ')[0] || 'Student'}
                                </h1>
                                <p style={{ opacity: 0.8, fontSize: '0.88rem', marginTop: '2px' }}>
                                    {profile?.department || 'Department'} • {profile?.semester || 'Semester'} • {profile?.studentId || ''}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '10px 18px', borderRadius: '12px', textAlign: 'center', minWidth: '80px' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>{enrollments.length}</div>
                                <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '2px' }}>Courses</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '10px 18px', borderRadius: '12px', textAlign: 'center', minWidth: '80px' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>{attendancePercent}%</div>
                                <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '2px' }}>Attendance</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '10px 18px', borderRadius: '12px', textAlign: 'center', minWidth: '80px' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>{avgMarks}</div>
                                <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '2px' }}>Avg Score</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Tab Switcher ── */}
                <div className="animate-fadeInUp stagger-1" style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', padding: '4px', borderRadius: '14px', width: 'fit-content', border: '1px solid var(--border-light)' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{
                                background: activeTab === tab.id ? 'white' : 'transparent',
                                border: 'none', color: activeTab === tab.id ? '#1e3a8a' : 'var(--text-muted)',
                                padding: '10px 20px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: activeTab === tab.id ? '600' : '500',
                                borderRadius: '10px', transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: '6px',
                                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none'
                            }}>
                            <span style={{ fontSize: '0.95rem' }}>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Content Area ── */}
                <div className="animate-fadeInUp stagger-2" style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && profile && (
                        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: '2rem' }}>
                                {/* Left: Avatar Card */}
                                <div style={{ textAlign: 'center', padding: '2rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                    {profile.photo ? (
                                        <img src={`${API_BASE_URL}/profile/${profile.photo}`} alt={profile.name}
                                            style={{ width: '200px', height: '200px', borderRadius: '16px', margin: '0 auto 1.25rem', objectFit: 'cover', border: '4px solid white', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)' }} />
                                    ) : (
                                        <div style={{ width: '200px', height: '200px', borderRadius: '16px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'white', fontWeight: '600', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.25)' }}>
                                            {profile.name[0]}
                                        </div>
                                    )}
                                    <h3 style={{ marginBottom: '0.25rem', fontSize: '1.2rem', fontWeight: '600', color: '#1e3a8a' }}>{profile.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>{profile.studentId}</p>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#1e3a8a', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' }}>{profile.department}</span>
                                </div>

                                {/* Right: Details */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <h3 style={{ color: '#1e3a8a', fontWeight: '600', fontSize: '1.1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #dbeafe' }}>Personal Information</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                        {[
                                            { label: 'Full Name', value: profile.name, icon: '👤' },
                                            { label: 'Email', value: profile.email, icon: '📧' },
                                            { label: 'Gender', value: profile.gender, icon: '⚧' },
                                            { label: 'Date of Birth', value: new Date(profile.dob).toLocaleDateString(), icon: '🎂' },
                                            { label: 'Department', value: profile.department, icon: '🏛️' },
                                            { label: 'Semester', value: profile.semester, icon: '📅' },
                                        ].map((item, idx) => (
                                            <div key={idx} style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ fontSize: '0.75rem' }}>{item.icon}</span> {item.label}
                                                </label>
                                                <p style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '0.95rem', marginTop: '4px' }}>{item.value}</p>
                                            </div>
                                        ))}
                                        <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ fontSize: '0.75rem' }}>📍</span> Address
                                            </label>
                                            <p style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '0.95rem', marginTop: '4px' }}>{profile.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Courses Tab */}
                    {activeTab === 'courses' && (
                        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1e3a8a' }}>📚 Enrolled Courses</h3>
                                <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#1e3a8a', padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' }}>{enrollments.length} courses</span>
                            </div>
                            <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                <table>
                                    <thead><tr><th>Code</th><th>Name</th><th>Credits</th><th>Instructor</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {enrollments.length > 0 ? enrollments.map(e => (
                                            <tr key={e._id}>
                                                <td style={{ fontWeight: '600', color: '#1e3a8a' }}>{e.courseId}</td>
                                                <td style={{ fontWeight: '500' }}>{e.courseName}</td>
                                                <td>{e.credits}</td>
                                                <td>{e.instructor}</td>
                                                <td><span className="pill pill-success">{e.status}</span></td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No courses enrolled yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Results & Attendance Tab */}
                    {activeTab === 'results' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1e3a8a' }}>🏆 Academic Performance</h3>
                                    {marks.length > 0 && (
                                        <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', padding: '6px 14px', borderRadius: '100px', color: 'white', fontSize: '0.8rem', fontWeight: '600' }}>
                                            Avg: {avgMarks}
                                        </div>
                                    )}
                                </div>
                                <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                    <table>
                                        <thead><tr><th>Course</th><th>Type</th><th>Marks</th><th>Grade</th></tr></thead>
                                        <tbody>
                                            {marks.length > 0 ? marks.map(m => (
                                                <tr key={m._id}>
                                                    <td style={{ fontWeight: '500' }}>{m.courseId}</td>
                                                    <td><span className="pill pill-accent">{m.examType}</span></td>
                                                    <td style={{ fontWeight: '600' }}>{m.marks}</td>
                                                    <td><span style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '1.05rem' }}>{m.grade}</span></td>
                                                </tr>
                                            )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No marks found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1e3a8a' }}>📅 Attendance</h3>
                                    <div style={{
                                        fontSize: '1.4rem', fontWeight: '700',
                                        background: attendancePercent >= 75 ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)' : 'linear-gradient(135deg, #ef4444, #f97316)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                    }}>
                                        {attendancePercent}%
                                    </div>
                                </div>

                                {/* Attendance Bar */}
                                <div style={{ background: '#e2e8f0', borderRadius: '100px', height: '8px', marginBottom: '1.25rem', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${attendancePercent}%`,
                                        height: '100%',
                                        background: attendancePercent >= 75 ? 'linear-gradient(90deg, #1e3a8a, #3b82f6)' : 'linear-gradient(90deg, #ef4444, #f97316)',
                                        borderRadius: '100px',
                                        transition: 'width 0.8s ease'
                                    }} />
                                </div>

                                <div style={{ flex: 1, maxHeight: '400px', overflowY: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                                    <table>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr><th>Date</th><th>Course</th><th>Status</th></tr></thead>
                                        <tbody>
                                            {attendance.length > 0 ? attendance.map(a => (
                                                <tr key={a._id}>
                                                    <td>{new Date(a.date).toLocaleDateString()}</td>
                                                    <td>{a.courseId}</td>
                                                    <td><span className={`pill ${a.status === 'Present' ? 'pill-success' : 'pill-danger'}`}>{a.status}</span></td>
                                                </tr>
                                            )) : <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No records.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
