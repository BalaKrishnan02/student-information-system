import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { ClipboardEdit, CalendarCheck, Loader, BookOpen, Users, Upload, Save, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../../config';


const TeacherDashboard = () => {
    const isMobile = window.innerWidth <= 768;
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('grading');
    const [examType, setExamType] = useState('CAT-1');
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [marksData, setMarksData] = useState({});
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [attendanceStats, setAttendanceStats] = useState({});
    const [teacherProfile, setTeacherProfile] = useState(null);

    useEffect(() => { fetchCourses(); }, []);

    useEffect(() => {
        if (selectedCourse) fetchCourseData(selectedCourse);
    }, [selectedCourse, activeTab, attendanceDate, examType]);

    useEffect(() => {
        if (selectedCourse && activeTab === 'attendance') fetchAttendanceStats(selectedCourse);
    }, [selectedCourse, activeTab]);

    const fetchCourses = async () => {
        try {
            const teacherRes = await axios.get(`${API_BASE_URL}/api/teachers/${user.username}`);
            setTeacherProfile(teacherRes.data);
            const teacherName = teacherRes.data.name;
            const res = await axios.get(`${API_BASE_URL}/api/courses/all?instructor=${teacherName}`);
            setCourses(res.data);
            if (res.data.length > 0) setSelectedCourse(res.data[0].courseId);
        } catch (err) { console.error("Failed to fetch assigned courses", err); }
    };

    const fetchCourseData = async (courseId) => {
        setLoading(true);
        try {
            const studentsRes = await axios.get(`${API_BASE_URL}/api/enrollments/course/${courseId}`);
            setStudents(studentsRes.data);
            if (activeTab === 'grading') {
                const marksRes = await axios.get(`${API_BASE_URL}/api/marks/course/${courseId}`);
                const marksMap = {};
                marksRes.data.forEach(m => { if (m.examType === examType) marksMap[m.studentId] = { marks: m.marks, grade: m.grade }; });
                setMarksData(marksMap);
            } else {
                const attendRes = await axios.get(`${API_BASE_URL}/api/attendance/course/${courseId}/date/${attendanceDate}`);
                const attendMap = {};
                studentsRes.data.forEach(s => attendMap[s.studentId] = 'Present');
                attendRes.data.forEach(a => { attendMap[a.studentId] = a.status; });
                setAttendanceData(attendMap);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchAttendanceStats = async (courseId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/attendance/course-stats/${courseId}`);
            setAttendanceStats(res.data);
        } catch (err) { console.error("Error fetching stats:", err); }
    };

    const handleMarkChange = (studentId, value) => {
        const grade = calculateGrade(value);
        const gradePoints = getGradePoints(value);
        setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], marks: value, grade, gradePoints } }));
    };

    // AICTE Grading Scale
    const calculateGrade = (marks) => {
        if (!marks && marks !== 0) return '';
        const m = parseInt(marks);
        if (isNaN(m)) return '';
        if (m >= 91) return 'A+';
        if (m >= 81) return 'A';
        if (m >= 71) return 'B+';
        if (m >= 61) return 'B';
        if (m >= 51) return 'C+';
        if (m >= 46) return 'C';
        if (m >= 40) return 'D';
        return 'F';
    };

    const getGradePoints = (marks) => {
        if (!marks && marks !== 0) return 0;
        const m = parseInt(marks);
        if (isNaN(m)) return 0;
        if (m >= 91) return 10;
        if (m >= 81) return 9;
        if (m >= 71) return 8;
        if (m >= 61) return 7;
        if (m >= 51) return 6;
        if (m >= 46) return 5;
        if (m >= 40) return 4;
        return 0;
    };

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A+': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#065f46' };
            case 'A': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#166534' };
            case 'B+': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#1e40af' };
            case 'B': return { bg: 'rgba(99, 102, 241, 0.15)', color: '#3730a3' };
            case 'C+': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#92400e' };
            case 'C': return { bg: 'rgba(251, 191, 36, 0.15)', color: '#78350f' };
            case 'D': return { bg: 'rgba(249, 115, 22, 0.15)', color: '#9a3412' };
            case 'F': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#991b1b' };
            case 'FR': return { bg: 'rgba(107, 114, 128, 0.15)', color: '#374151' };
            default: return { bg: 'rgba(5, 150, 105, 0.1)', color: '#065f46' };
        }
    };

    const saveGrades = async () => {
        setSaveStatus('Saving...');
        try {
            const updates = students.map(async (student) => {
                const data = marksData[student.studentId];
                if (data && data.marks) {
                    return axios.post(`${API_BASE_URL}/api/marks/update`, {
                        studentId: student.studentId, courseId: selectedCourse,
                        examType, marks: data.marks, grade: data.grade, gradePoints: data.gradePoints || 0
                    });
                }
                return Promise.resolve();
            });
            await Promise.all(updates);
            setSaveStatus('Saved ✓');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (err) { console.error(err); setSaveStatus('Error!'); }
    };

    const toggleAttendance = (studentId) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present' }));
    };

    const saveAttendance = async () => {
        setSaveStatus('Saving...');
        try {
            const records = students.map(s => ({ studentId: s.studentId, status: attendanceData[s.studentId] || 'Present' }));
            await axios.post(`${API_BASE_URL}/api/attendance/bulk-mark`, { courseId: selectedCourse, date: attendanceDate, records });
            fetchAttendanceStats(selectedCourse);
            setSaveStatus('Saved ✓');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (err) { console.error(err); setSaveStatus('Error!'); }
    };

    const tabs = [
        { id: 'grading', label: 'Grading & Assessment', icon: <ClipboardEdit size={15} /> },
        { id: 'attendance', label: 'Daily Attendance', icon: <CalendarCheck size={15} /> },
    ];

    const presentToday = Object.values(attendanceData).filter(s => s === 'Present').length;
    const absentToday = Object.values(attendanceData).filter(s => s === 'Absent').length;

    return (
        <div className="teacher-dashboard">
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: isMobile ? '1rem 0.5rem' : '1.5rem 2rem', gap: '1.25rem' }}>

                {/* ── Hero Banner ── */}
                <div className="teacher-hero animate-fadeInUp">
                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: isMobile ? '100%' : 'auto' }}>
                            <div style={{
                                width: isMobile ? '48px' : '56px', height: isMobile ? '48px' : '56px', borderRadius: '16px',
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: '700', color: 'white',
                                border: '2px solid rgba(255,255,255,0.3)'
                            }}>
                                {teacherProfile?.name?.[0] || 'T'}
                            </div>
                            <div>
                                <h1 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '700', margin: 0 }}>
                                    Welcome, <span className="teacher-gradient-text" style={{ WebkitTextFillColor: '#a7f3d0' }}>{teacherProfile?.name?.split(' ')[0] || 'Instructor'}</span>
                                </h1>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                    <span style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '500' }}>
                                        {teacherProfile?.department || 'Dept'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick stats & Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: isMobile ? '100%' : 'auto', overflowX: 'auto', paddingBottom: '4px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '8px 14px', borderRadius: '12px', textAlign: 'center', flex: 1, minWidth: '70px' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{courses.length}</div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.85 }}>Classes</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '8px 14px', borderRadius: '12px', textAlign: 'center', flex: 1, minWidth: '70px' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{students.length}</div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.85 }}>Students</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Course Selector + Tabs ── */}
                <div className="animate-fadeInUp stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-light)', width: isMobile ? '100%' : 'fit-content', overflowX: 'auto' }}>
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                style={{
                                    background: activeTab === tab.id ? 'white' : 'transparent',
                                    border: 'none', color: activeTab === tab.id ? '#065f46' : 'var(--text-muted)',
                                    padding: isMobile ? '8px 12px' : '10px 20px', cursor: 'pointer', fontSize: isMobile ? '0.75rem' : '0.88rem', fontWeight: activeTab === tab.id ? '600' : '500',
                                    borderRadius: '10px', transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: '6px',
                                    boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                                    whiteSpace: 'nowrap'
                                }}>
                                <span style={{ fontSize: '0.95rem' }}>{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Course Selector */}
                    <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '14px', border: '1px solid var(--border-light)', width: isMobile ? '100%' : 'fit-content' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#065f46', letterSpacing: '0.04em' }}>Class:</span>
                        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '8px', border: 'none', fontWeight: '500', background: 'transparent', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}>
                            {courses.length > 0 ? courses.map(c => (
                                <option key={c.courseId} value={c.courseId}>{c.courseId} - {c.courseName}</option>
                            )) : <option value="">No Classes Assigned</option>}
                        </select>
                    </div>
                </div>

                {/* ── Content Area ── */}
                <div className="animate-fadeInUp stagger-2" style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <div style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}><Loader size={32} className="animate-spin" /></div>
                            <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Loading class data...</p>
                        </div>
                    ) : activeTab === 'grading' ? (
                        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Toolbar */}
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.15)', gap: '1rem' }}>
                                <div style={{ width: isMobile ? '100%' : 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <select value={examType} onChange={e => setExamType(e.target.value)}
                                            style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid rgba(16, 185, 129, 0.3)', fontWeight: '600', color: '#065f46', background: 'white', fontSize: '0.95rem', cursor: 'pointer', outline: 'none', width: '100%' }}>
                                            <option value="CAT-1">CAT-1 Assessment</option>
                                            <option value="CAT-2">CAT-2 Assessment</option>
                                            <option value="MODEL">MODEL Assessment</option>
                                        </select>
                                    </div>
                                    {!isMobile && <p style={{ margin: '8px 0 0', color: '#065f46', fontSize: '0.82rem', opacity: 0.7 }}>Record marks and auto-calculate grades</p>}
                                </div>
                                <button onClick={saveGrades}
                                    style={{
                                        background: saveStatus === 'Saved ✓' ? '#059669' : 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
                                        color: 'white', border: 'none', padding: '10px 24px', borderRadius: '100px',
                                        fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.25s',
                                        boxShadow: '0 2px 10px rgba(5, 150, 105, 0.2)', width: isMobile ? '100%' : 'auto'
                                    }}>
                                    {saveStatus || <><Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />Publish Grades</>}
                                </button>
                            </div>

                            {/* Grades Table */}
                            <div className="table-responsive" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                <table>
                                    <thead><tr><th>Student</th><th>Semester</th><th>Score</th><th>Grade</th><th>Grade Points</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {students.length > 0 ? students.map(s => {
                                            const mark = marksData[s.studentId] || { marks: '', grade: '-', gradePoints: 0 };
                                            const gradeStyle = getGradeColor(mark.grade);
                                            return (
                                                <tr key={s._id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#065f46', fontSize: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                                {s.studentName?.[0] || 'S'}
                                                            </div>
                                                            <div>
                                                                 <div style={{ fontWeight: '500', fontSize: '0.93rem' }}>{s.studentName}</div>
                                                                 <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{s.studentId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: 'var(--text-muted)' }}>{s.semester}</td>
                                                    <td>
                                                        <input type="number" min="0" max="100" value={mark.marks} onChange={(e) => handleMarkChange(s.studentId, e.target.value)}
                                                            style={{ width: '76px', padding: '8px', borderRadius: '10px', border: '1.5px solid var(--border)', fontWeight: '500', background: 'var(--bg-surface)', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s' }}
                                                            onFocus={(e) => e.target.style.borderColor = '#059669'}
                                                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                                                    </td>
                                                    <td><span style={{ background: gradeStyle.bg, color: gradeStyle.color, padding: '4px 14px', borderRadius: '100px', fontWeight: '700', fontSize: '0.88rem' }}>{mark.grade}</span></td>
                                                    <td style={{ textAlign: 'center' }}><span style={{ fontWeight: '700', fontSize: '1rem', color: gradeStyle.color }}>{mark.marks ? (mark.gradePoints !== undefined ? mark.gradePoints : getGradePoints(mark.marks)) : '-'}</span></td>
                                                    <td>
                                                        {mark.marks
                                                            ? <span className="pill pill-success">✓ Done</span>
                                                            : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pending</span>}
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students enrolled in this course.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Attendance Toolbar */}
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.15)', gap: '1rem' }}>
                                <div style={{ width: isMobile ? '100%' : 'auto' }}>
                                    <h3 style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem', color: '#065f46' }}>📋 Daily Attendance Log</h3>
                                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: isMobile ? '100%' : 'auto' }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: '500', color: '#065f46' }}>Date:</span>
                                            <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)}
                                                style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid rgba(16, 185, 129, 0.3)', fontWeight: '500', background: 'white', color: 'var(--text-main)', outline: 'none', width: isMobile ? '100%' : 'auto' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#166534', padding: '4px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: '600' }}>P: {presentToday}</span>
                                            <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#991b1b', padding: '4px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: '600' }}>A: {absentToday}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={saveAttendance}
                                    style={{
                                        background: saveStatus === 'Saved ✓' ? '#059669' : 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
                                        color: 'white', border: 'none', padding: '10px 24px', borderRadius: '100px',
                                        fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.25s',
                                        boxShadow: '0 2px 10px rgba(5, 150, 105, 0.2)', width: isMobile ? '100%' : 'auto'
                                    }}>
                                    {saveStatus || <><Save size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />Save Log</>}
                                </button>
                            </div>

                            {/* Attendance Table */}
                            <div className="table-responsive" style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                <table>
                                    <thead><tr><th>Student</th><th style={{ textAlign: 'center' }}>Present</th><th style={{ textAlign: 'center' }}>Absent</th><th>Status</th><th style={{ textAlign: 'center' }}>Action</th></tr></thead>
                                    <tbody>
                                        {students.length > 0 ? students.map(s => {
                                            const status = attendanceData[s.studentId] || 'Present';
                                            const stats = attendanceStats[s.studentId] || { present: 0, absent: 0 };
                                            return (
                                                <tr key={s._id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#065f46', fontSize: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                                {s.studentName?.[0] || 'S'}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '500', fontSize: '0.93rem' }}>{s.studentName}</div>
                                                                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{s.studentId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}><span className="pill pill-success">{stats.present}</span></td>
                                                    <td style={{ textAlign: 'center' }}><span className="pill pill-danger">{stats.absent}</span></td>
                                                    <td>
                                                        <span className={`pill ${status === 'Present' ? 'pill-success' : 'pill-danger'}`}>{status}</span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button onClick={() => toggleAttendance(s.studentId)}
                                                            style={{
                                                                background: status === 'Present' ? 'transparent' : 'linear-gradient(135deg, #065f46, #059669)',
                                                                color: status === 'Present' ? '#065f46' : 'white',
                                                                border: status === 'Present' ? '1.5px solid rgba(16, 185, 129, 0.3)' : 'none',
                                                                fontSize: '0.8rem', padding: '6px 16px', minWidth: '120px',
                                                                borderRadius: '100px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s'
                                                            }}>
                                                            Mark {status === 'Present' ? 'Absent' : 'Present'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students enrolled in this course.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
