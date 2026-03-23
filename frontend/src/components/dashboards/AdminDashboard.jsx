import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, GraduationCap, Users, BookOpen, RefreshCw, UserPlus, UserCog, BookPlus, Zap, ChevronRight, Plus } from 'lucide-react';
import { API_BASE_URL } from '../../config';


const AdminDashboard = () => {
    const isMobile = window.innerWidth <= 768;
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0 });
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);

    const [studentForm, setStudentForm] = useState({
        studentId: '', firstName: '', lastName: '', dob: '2005-01-01', gender: 'Male',
        email: '', phone: '', address: '', city: '', state: '',
        grade: '', school: '', department: 'CS', semester: 'Sem 1', course: 'B.Tech', photo: ''
    });
    const [teacherForm, setTeacherForm] = useState({
        teacherId: '', firstName: '', lastName: '', gender: 'Male',
        address: '', city: '', state: '', phone: '',
        department: 'CS', designation: 'Lecturer', qualification: '', specialization: '',
        email: '', photoUrl: ''
    });
    const [courseForm, setCourseForm] = useState({
        courseId: '', courseName: '', department: 'CS', credits: 3,
        semester: 'Sem 1', courseLevel: 'Undergraduate', duration: '',
        instructor: '', capacity: 60, description: '', status: 'Active'
    });

    const [studentPhoto, setStudentPhoto] = useState(null);
    const [studentPhotoPreview, setStudentPhotoPreview] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const resetForms = () => {
        setStudentForm({ studentId: '', firstName: '', lastName: '', dob: '2005-01-01', gender: 'Male', email: '', phone: '', address: '', city: '', state: '', grade: '', school: '', department: 'CS', semester: 'Sem 1', course: 'B.Tech', photo: '' });
        setTeacherForm({ teacherId: '', firstName: '', lastName: '', gender: 'Male', address: '', city: '', state: '', phone: '', department: 'CS', designation: 'Lecturer', qualification: '', specialization: '', email: '', photoUrl: '' });
        setCourseForm({ courseId: '', courseName: '', department: 'CS', credits: 3, semester: 'Sem 1', courseLevel: 'Undergraduate', duration: '', instructor: '', capacity: 60, description: '', status: 'Active' });
        setStudentPhoto(null); setStudentPhotoPreview(null);
    };

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        try {
            const [sRes, tRes, cRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/students/all`),
                axios.get(`${API_BASE_URL}/api/teachers/all`),
                axios.get(`${API_BASE_URL}/api/courses/all`)
            ]);
            setStudents(sRes.data); setTeachers(tRes.data); setCourses(cRes.data);
            setStats({ students: sRes.data.length, teachers: tRes.data.length, courses: cRes.data.length });
        } catch (err) { console.error(err); }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(studentForm).forEach(key => formData.append(key, studentForm[key]));
        if (studentPhoto) formData.append('photo', studentPhoto);
        try {
            if (isEditing) {
                await axios.put(`${API_BASE_URL}/api/students/update/${studentForm.studentId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                alert('Student Updated Successfully!');
            } else {
                await axios.post(`${API_BASE_URL}/api/students/add`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                alert('Student Added Successfully!');
            }
            await fetchAllData();
            setStudentForm({ studentId: '', firstName: '', lastName: '', dob: '2005-01-01', gender: 'Male', email: '', phone: '', address: '', city: '', state: '', grade: '', school: '', department: 'CS', semester: 'Sem 1', course: 'B.Tech', photo: '' });
            setStudentPhoto(null); setStudentPhotoPreview(null); setActiveTab('students'); setIsEditing(false);
        } catch (err) { alert('Error saving student: ' + (err.response?.data?.error || err.message)); }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) { setStudentPhoto(file); setStudentPhotoPreview(URL.createObjectURL(file)); }
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${API_BASE_URL}/api/teachers/update/${teacherForm.teacherId}`, teacherForm);
                alert('Teacher Updated!');
            } else {
                await axios.post(`${API_BASE_URL}/api/teachers/add`, teacherForm);
                alert('Teacher Added!');
            }
            await fetchAllData();
            setTeacherForm({ teacherId: '', firstName: '', lastName: '', gender: 'Male', address: '', city: '', state: '', phone: '', department: 'CS', designation: 'Lecturer', qualification: '', specialization: '', email: '', photoUrl: '' });
            setActiveTab('teachers'); setIsEditing(false);
        } catch (err) { alert('Error saving teacher'); }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${API_BASE_URL}/api/courses/update/${courseForm.courseId}`, courseForm);
                alert('Course Updated!');
            } else {
                await axios.post(`${API_BASE_URL}/api/courses/add`, courseForm);
                alert('Course Added!');
            }
            await fetchAllData();
            setCourseForm({ courseId: '', courseName: '', department: 'CS', credits: 3, semester: 'Sem 1', courseLevel: 'Undergraduate', duration: '', instructor: '', capacity: 60, description: '', status: 'Active' });
            setActiveTab('courses'); setIsEditing(false);
        } catch (err) { alert('Error saving course'); }
    };

    const handleEdit = (type, data) => {
        setIsEditing(true);
        if (type === 'student') {
            // Split name into firstName and lastName if present
            const nameParts = data.name ? data.name.split(' ') : [];
            const firstName = nameParts.length > 0 ? nameParts[0] : '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            setStudentForm({ ...data, firstName, lastName });
            setStudentPhoto(null);
            setStudentPhotoPreview(data.photo ? `${API_BASE_URL}/profile/${data.photo}` : null);
            setActiveTab('make-student');
        } else if (type === 'teacher') {
            const nameParts = data.name ? data.name.split(' ') : [];
            const firstName = nameParts.length > 0 ? nameParts[0] : '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            setTeacherForm({ ...data, firstName, lastName });
            setActiveTab('make-teacher');
        } else if (type === 'course') {
            setCourseForm(data);
            setActiveTab('make-course');
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/${type}s/delete/${id}`);
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} Deleted successfully`);
            await fetchAllData();
        } catch (err) {
            alert(`Error deleting ${type}: ` + (err.response?.data?.error || err.response?.data?.message || err.message));
        }
    };

    const inputStyle = {
        padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border)',
        width: '100%', fontSize: '0.93rem', background: 'var(--bg-surface)', color: 'var(--text-main)',
        outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s'
    };
    const labelStyle = {
        display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.75rem',
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'
    };
    const sectionTitleStyle = {
        borderBottom: '2px solid #7c3aed', display: 'inline-block',
        paddingBottom: '4px', marginBottom: '1.5rem', fontSize: '1rem',
        fontWeight: '600', color: '#581c87'
    };

    const mainTabs = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
        { id: 'students', label: 'Students', icon: <GraduationCap size={16} /> },
        { id: 'teachers', label: 'Teachers', icon: <Users size={16} /> },
        { id: 'courses', label: 'Courses', icon: <BookOpen size={16} /> },
    ];

    const isFormTab = ['make-student', 'make-teacher', 'make-course'].includes(activeTab);

    return (
        <div className="admin-dashboard">
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: isMobile ? '1rem 0.5rem' : '1.5rem 2rem', gap: '1.25rem' }}>

                {/* ── Hero Banner ── */}
                <div className="admin-hero animate-fadeInUp">
                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: '700', color: 'white',
                                border: '2px solid rgba(255,255,255,0.3)'
                            }}>
                                <Zap size={24} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                                    Admin <span style={{ color: '#e9d5ff' }}>Console</span>
                                </h1>
                                <p style={{ opacity: 0.8, fontSize: '0.88rem', marginTop: '2px' }}>Manage your institution • Full control panel</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button onClick={async () => {
                                setIsRefreshing(true);
                                await fetchAllData();
                                resetForms();
                                setIsEditing(false);
                                setTimeout(() => setIsRefreshing(false), 500);
                            }}
                                aria-label="Refresh Data"
                                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '100px', cursor: 'pointer', fontWeight: '500', fontSize: '0.82rem', transition: 'all 0.2s', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <RefreshCw size={14} style={{ transform: isRefreshing ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.5s ease' }} /> {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <button onClick={window.print}
                                aria-label="Print Report"
                                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '100px', cursor: 'pointer', fontWeight: '500', fontSize: '0.82rem', transition: 'all 0.2s', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                🖨️ Print Report
                            </button>
                            {!isFormTab && (
                                <>
                                    <button onClick={() => { resetForms(); setIsEditing(false); setActiveTab('make-student'); }}
                                        style={{ background: 'rgba(59, 130, 246, 0.35)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '100px', cursor: 'pointer', fontWeight: '500', fontSize: '0.82rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <UserPlus size={14} /> Student
                                    </button>
                                    <button onClick={() => { resetForms(); setIsEditing(false); setActiveTab('make-teacher'); }}
                                        style={{ background: 'rgba(16, 185, 129, 0.35)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '100px', cursor: 'pointer', fontWeight: '500', fontSize: '0.82rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <UserCog size={14} /> Teacher
                                    </button>
                                    <button onClick={() => { resetForms(); setIsEditing(false); setActiveTab('make-course'); }}
                                        style={{ background: 'rgba(249, 115, 22, 0.35)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '100px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <BookPlus size={14} /> Course
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Tab Switcher ── */}
                <div className="animate-fadeInUp stagger-1" style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', padding: '4px', borderRadius: '14px', width: isMobile ? '100%' : 'fit-content', overflowX: 'auto', border: '1px solid var(--border-light)' }}>
                    {mainTabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{
                                background: activeTab === tab.id ? 'white' : 'transparent',
                                border: 'none', color: activeTab === tab.id ? '#581c87' : 'var(--text-muted)',
                                padding: isMobile ? '8px 12px' : '10px 18px', cursor: 'pointer', fontSize: isMobile ? '0.75rem' : '0.88rem', fontWeight: activeTab === tab.id ? '600' : '500',
                                borderRadius: '100px', transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: '7px',
                                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                                whiteSpace: 'nowrap'
                            }}>
                            <span style={{ fontSize: '0.95rem' }}>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                    {isFormTab && (
                        <button style={{
                            background: 'white', border: 'none', color: '#7c3aed',
                            padding: isMobile ? '8px 12px' : '10px 18px', fontSize: isMobile ? '0.75rem' : '0.88rem', fontWeight: '600',
                            borderRadius: '100px', boxShadow: 'var(--shadow-sm)', cursor: 'default', whiteSpace: 'nowrap'
                        }}>
                            {activeTab === 'make-student' ? (isEditing ? 'Edit Student' : '+ New Student') : activeTab === 'make-teacher' ? (isEditing ? 'Edit Teacher' : '+ New Teacher') : (isEditing ? 'Edit Course' : '+ New Course')}
                        </button>
                    )}
                </div>

                {/* ── Content ── */}
                <div className="animate-fadeInUp stagger-2" style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>

                    {/* Overview Cards */}
                    {activeTab === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            {[
                                { count: stats.students, label: 'Total Students', icon: <GraduationCap size={36} style={{ color: '#3b82f6' }} />, gradient: 'linear-gradient(135deg, #3b82f6, #1e3a8a)', lightBg: '#eff6ff', barColor: '#3b82f6' },
                                { count: stats.teachers, label: 'Total Teachers', icon: <Users size={36} style={{ color: '#059669' }} />, gradient: 'linear-gradient(135deg, #059669, #065f46)', lightBg: '#ecfdf5', barColor: '#059669' },
                                { count: stats.courses, label: 'Total Courses', icon: <BookOpen size={36} style={{ color: '#7c3aed' }} />, gradient: 'linear-gradient(135deg, #7c3aed, #581c87)', lightBg: '#f5f3ff', barColor: '#7c3aed' },
                            ].map((card, i) => (
                                <div key={i} className="admin-stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: card.gradient }} />
                                    <div style={{ marginBottom: '0.75rem' }}>{card.icon}</div>
                                    <div style={{ fontSize: '2.8rem', fontWeight: '800', background: card.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{card.count}</div>
                                    <div style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem', marginTop: '0.25rem' }}>{card.label}</div>
                                    <div style={{ marginTop: '1rem', background: card.lightBg, height: '6px', borderRadius: '100px', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.min(card.count * 5, 100)}%`, height: '100%', background: card.gradient, borderRadius: '100px', transition: 'width 1s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Students List */}
                    {activeTab === 'students' && (
                        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontWeight: '600', fontSize: '1.1rem', color: '#581c87', display: 'flex', alignItems: 'center', gap: '8px' }}><GraduationCap size={18} /> Manage Students</h3>
                                <span style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#581c87', padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' }}>{students.length} records</span>
                            </div>
                            <div className="table-responsive" style={{ borderRadius: 'var(--radius-sm)', overflowX: 'auto', border: '1px solid var(--border-light)' }}>
                                <table>
                                    <thead><tr><th>Photo</th><th>Student ID</th><th>Full Name</th><th>Email</th><th>Dept</th><th>Grade</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {students.map(s => (
                                            <tr key={s._id}>
                                                <td>
                                                    {s.photo ? (
                                                        <img src={`${API_BASE_URL}/profile/${s.photo}`} alt={s.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                                                    ) : (
                                                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#7c3aed', fontWeight: '600', border: '1px solid rgba(124, 58, 237, 0.15)' }}>{s.name?.[0] || '?'}</div>
                                                    )}
                                                </td>
                                                <td style={{ fontWeight: '600', color: '#7c3aed' }}>{s.studentId}</td>
                                                <td style={{ fontWeight: '500' }}>{s.name}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                                                <td><span className="pill pill-primary">{s.department || 'N/A'}</span></td>
                                                <td>{s.grade || 'N/A'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => handleEdit('student', s)} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>Edit</button>
                                                        <button onClick={() => handleDelete('student', s.studentId)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {students.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No students found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Teachers List */}
                    {activeTab === 'teachers' && (
                        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontWeight: '600', fontSize: '1.1rem', color: '#581c87', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Manage Teachers</h3>
                                <span style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#581c87', padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' }}>{teachers.length} records</span>
                            </div>
                            <div className="table-responsive" style={{ borderRadius: 'var(--radius-sm)', overflowX: 'auto', border: '1px solid var(--border-light)' }}>
                                <table>
                                    <thead><tr><th>ID</th><th>Name</th><th>Dept</th><th>Designation</th><th>Email</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {teachers.map(t => (
                                            <tr key={t._id}>
                                                <td style={{ fontWeight: '600', color: '#7c3aed' }}>{t.teacherId}</td>
                                                <td style={{ fontWeight: '500' }}>{t.name}</td>
                                                <td><span className="pill pill-success">{t.department}</span></td>
                                                <td>{t.designation}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{t.email}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => handleEdit('teacher', t)} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>Edit</button>
                                                        <button onClick={() => handleDelete('teacher', t.teacherId)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {teachers.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No teachers found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Courses List */}
                    {activeTab === 'courses' && (
                        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontWeight: '600', fontSize: '1.1rem', color: '#581c87', display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={18} /> Manage Courses</h3>
                                <span style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#581c87', padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' }}>{courses.length} programs</span>
                            </div>
                            <div className="table-responsive" style={{ borderRadius: 'var(--radius-sm)', overflowX: 'auto', border: '1px solid var(--border-light)' }}>
                                <table>
                                    <thead><tr><th>Code</th><th>Course Name</th><th>Credits</th><th>Instructor</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {courses.map(c => (
                                            <tr key={c._id}>
                                                <td style={{ fontWeight: '600', color: '#7c3aed' }}>{c.courseId}</td>
                                                <td style={{ fontWeight: '500' }}>{c.courseName}</td>
                                                <td>{c.credits}</td>
                                                <td>{c.instructor || 'Unassigned'}</td>
                                                <td><span className={`pill ${c.status === 'Active' ? 'pill-success' : 'pill-accent'}`}>{c.status || 'Active'}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => handleEdit('course', c)} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>Edit</button>
                                                        <button onClick={() => handleDelete('course', c.courseId)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {courses.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No courses found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {/* Add Student Form */}
                    {activeTab === 'make-student' && (
                        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem', color: '#581c87' }}>Student <span style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{isEditing ? 'Update' : 'Registration'}</span></h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{isEditing ? 'Update the details of the student' : 'Fill in the details to register a new student'}</p>
                            </div>
                            <form onSubmit={handleAddStudent} className="glass-card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
                                <div style={sectionTitleStyle}>Basic Identification</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div><label style={labelStyle}>Student Id</label>
                                        <input style={inputStyle} value={studentForm.studentId} onChange={e => setStudentForm({ ...studentForm, studentId: e.target.value })} placeholder="e.g. 23TH0201" required disabled={isEditing} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>* Default password is <b>student123</b></div>
                                    </div>
                                    <div><label style={labelStyle}>Email Address</label><input type="email" style={inputStyle} value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} placeholder="email@example.com" required onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div>
                                        <label style={labelStyle}>Photo</label>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ ...inputStyle, padding: '8px' }} />
                                            {studentPhotoPreview && <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #7c3aed', flexShrink: 0 }}><img src={studentPhotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                                        </div>
                                    </div>
                                </div>

                                <div style={sectionTitleStyle}>Personal Details</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div><label style={labelStyle}>First Name</label><input style={inputStyle} value={studentForm.firstName} onChange={e => setStudentForm({ ...studentForm, firstName: e.target.value })} placeholder="First Name" required onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Last Name</label><input style={inputStyle} value={studentForm.lastName} onChange={e => setStudentForm({ ...studentForm, lastName: e.target.value })} placeholder="Last Name" required onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={studentForm.phone} onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })} placeholder="Phone Number" required onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Gender</label><select style={inputStyle} value={studentForm.gender} onChange={e => setStudentForm({ ...studentForm, gender: e.target.value })}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                                </div>

                                <div style={sectionTitleStyle}>Address</div>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div style={{ gridColumn: isMobile ? 'auto' : 'span 3' }}><label style={labelStyle}>Street</label><input aria-label="Street Address" style={inputStyle} value={studentForm.address} onChange={e => setStudentForm({ ...studentForm, address: e.target.value })} placeholder="Street Address" onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>City</label><input aria-label="City" style={inputStyle} value={studentForm.city} onChange={e => setStudentForm({ ...studentForm, city: e.target.value })} placeholder="City" onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div>
                                        <label style={labelStyle}>State</label>
                                        <select aria-label="State" style={inputStyle} value={studentForm.state} onChange={e => setStudentForm({ ...studentForm, state: e.target.value })} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                                            <option value="" disabled>Select State</option>
                                            {["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli", "Delhi", "Lakshadweep", "Puducherry"].map(st => <option key={st} value={st}>{st}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={sectionTitleStyle}>Academics</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div><label style={labelStyle}>Grade / Year</label><input style={inputStyle} value={studentForm.grade} onChange={e => setStudentForm({ ...studentForm, grade: e.target.value })} placeholder="10" onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>School</label><input style={inputStyle} value={studentForm.school} onChange={e => setStudentForm({ ...studentForm, school: e.target.value })} placeholder="School Name" onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Department</label><select style={inputStyle} value={studentForm.department} onChange={e => setStudentForm({ ...studentForm, department: e.target.value })}><option value="CS">Computer Science</option><option value="Information Technology">IT</option><option value="ECE">Electronics</option><option value="ME">Mechanical</option><option value="Civil">Civil</option><option value="EEE">Electrical</option></select></div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                    <button type="button" onClick={() => setActiveTab('students')} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '10px 24px', borderRadius: '100px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>Cancel</button>
                                    <button type="submit" style={{ background: 'linear-gradient(135deg, #581c87, #7c3aed)', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '100px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 2px 10px rgba(124, 58, 237, 0.25)' }}>{isEditing ? 'Update Student' : 'Add Student'}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Add Teacher Form */}
                    {activeTab === 'make-teacher' && (
                        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem', color: '#581c87' }}>Teacher <span style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{isEditing ? 'Update' : 'Registration'}</span></h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{isEditing ? 'Update existing teacher profile' : 'Create a new faculty profile'}</p>
                            </div>
                            <form onSubmit={handleAddTeacher} className="glass-card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
                                <div style={sectionTitleStyle}>Identification</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div><label style={labelStyle}>Teacher Id</label>
                                        <input style={inputStyle} value={teacherForm.teacherId} onChange={e => setTeacherForm({ ...teacherForm, teacherId: e.target.value })} placeholder="e.g. IT-F012" required disabled={isEditing} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>* Default password is <b>teacher123</b></div>
                                    </div>
                                    <div><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={teacherForm.email} onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })} placeholder="email@college.edu" required onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                </div>
                                <div style={sectionTitleStyle}>Personal</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div><label style={labelStyle}>First Name</label><input style={inputStyle} value={teacherForm.firstName} onChange={e => setTeacherForm({ ...teacherForm, firstName: e.target.value })} required onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Last Name</label><input style={inputStyle} value={teacherForm.lastName} onChange={e => setTeacherForm({ ...teacherForm, lastName: e.target.value })} required onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Gender</label><select style={inputStyle} value={teacherForm.gender} onChange={e => setTeacherForm({ ...teacherForm, gender: e.target.value })}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                                    <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={teacherForm.phone} onChange={e => setTeacherForm({ ...teacherForm, phone: e.target.value })} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                </div>
                                <div style={sectionTitleStyle}>Address</div>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div style={{ gridColumn: isMobile ? 'auto' : 'span 3' }}><label style={labelStyle}>Street</label><input aria-label="Street Address" style={inputStyle} value={teacherForm.address} onChange={e => setTeacherForm({ ...teacherForm, address: e.target.value })} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>City</label><input aria-label="City" style={inputStyle} value={teacherForm.city} onChange={e => setTeacherForm({ ...teacherForm, city: e.target.value })} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div>
                                        <label style={labelStyle}>State</label>
                                        <select aria-label="State" style={inputStyle} value={teacherForm.state} onChange={e => setTeacherForm({ ...teacherForm, state: e.target.value })} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                                            <option value="" disabled>Select State</option>
                                            {["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli", "Delhi", "Lakshadweep", "Puducherry"].map(st => <option key={st} value={st}>{st}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={sectionTitleStyle}>Professional</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div><label style={labelStyle}>Department</label><select style={inputStyle} value={teacherForm.department} onChange={e => setTeacherForm({ ...teacherForm, department: e.target.value })}><option value="CS">Computer Science</option><option value="Information Technology">IT</option><option value="ECE">Electronics</option><option value="ME">Mechanical</option><option value="Civil">Civil</option><option value="EEE">Electrical</option></select></div>
                                    <div><label style={labelStyle}>Designation</label><input style={inputStyle} value={teacherForm.designation} onChange={e => setTeacherForm({ ...teacherForm, designation: e.target.value })} placeholder="Professor" onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Qualification</label><input style={inputStyle} value={teacherForm.qualification} onChange={e => setTeacherForm({ ...teacherForm, qualification: e.target.value })} placeholder="Ph.D" onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Specialization</label><input style={inputStyle} value={teacherForm.specialization} onChange={e => setTeacherForm({ ...teacherForm, specialization: e.target.value })} placeholder="AI & ML" onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                    <button type="button" onClick={() => setActiveTab('teachers')} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '10px 24px', borderRadius: '100px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>Cancel</button>
                                    <button type="submit" style={{ background: 'linear-gradient(135deg, #581c87, #7c3aed)', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '100px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 2px 10px rgba(124, 58, 237, 0.25)' }}>{isEditing ? 'Update Teacher' : 'Register Teacher'}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Add Course Form */}
                    {activeTab === 'make-course' && (
                        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem', color: '#581c87' }}>Course <span style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{isEditing ? 'Editor' : 'Builder'}</span></h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{isEditing ? 'Modify existing course details' : 'Design and launch new academic programs'}</p>
                            </div>
                            <form onSubmit={handleAddCourse} className="glass-card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
                                <div style={{ ...sectionTitleStyle, borderBottomColor: '#a855f7' }}>Core Info</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div><label style={labelStyle}>Course ID</label><input style={inputStyle} value={courseForm.courseId} onChange={e => setCourseForm({ ...courseForm, courseId: e.target.value })} placeholder="ITPC607" required disabled={isEditing} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Course Name</label><input style={inputStyle} value={courseForm.courseName} onChange={e => setCourseForm({ ...courseForm, courseName: e.target.value })} placeholder="Course Name" required onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Credits</label><input type="number" style={inputStyle} value={courseForm.credits} onChange={e => setCourseForm({ ...courseForm, credits: e.target.value })} required onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Status</label><select style={inputStyle} value={courseForm.status} onChange={e => setCourseForm({ ...courseForm, status: e.target.value })}><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Upcoming">Upcoming</option></select></div>
                                </div>
                                <div style={{ ...sectionTitleStyle, borderBottomColor: '#a855f7' }}>Structure</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div><label style={labelStyle}>Department</label><select style={inputStyle} value={courseForm.department} onChange={e => setCourseForm({ ...courseForm, department: e.target.value })}><option value="CS">CS</option><option value="Information Technology">IT</option><option value="ECE">ECE</option><option value="ME">ME</option><option value="Civil">Civil</option><option value="EEE">EEE</option></select></div>
                                    <div><label style={labelStyle}>Level</label><select style={inputStyle} value={courseForm.courseLevel} onChange={e => setCourseForm({ ...courseForm, courseLevel: e.target.value })}><option value="Undergraduate">UG</option><option value="Postgraduate">PG</option><option value="Diploma">Diploma</option></select></div>
                                    <div><label style={labelStyle}>Semester</label><input style={inputStyle} value={courseForm.semester} onChange={e => setCourseForm({ ...courseForm, semester: e.target.value })} placeholder="Sem 1" onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                </div>
                                <div style={{ ...sectionTitleStyle, borderBottomColor: '#a855f7' }}>Logistics</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div><label style={labelStyle}>Instructor</label><input style={inputStyle} value={courseForm.instructor} onChange={e => setCourseForm({ ...courseForm, instructor: e.target.value })} placeholder="Faculty Name" onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Duration</label><input style={inputStyle} value={courseForm.duration} onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })} placeholder="6 Months" onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                    <div><label style={labelStyle}>Capacity</label><input type="number" style={inputStyle} value={courseForm.capacity} onChange={e => setCourseForm({ ...courseForm, capacity: e.target.value })} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course details..." onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                    <button type="button" onClick={() => setActiveTab('courses')} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '10px 24px', borderRadius: '100px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>Cancel</button>
                                    <button type="submit" style={{ background: 'linear-gradient(135deg, #581c87, #7c3aed)', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '100px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 2px 10px rgba(124, 58, 237, 0.25)' }}>{isEditing ? 'Update Course' : 'Publish Course'}</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
