const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = isLocal 
    ? 'http://localhost:5000' 
    : 'https://student-information-system-g7z8.onrender.com';
