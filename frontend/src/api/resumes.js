import api from './axios';

/* ---- Auth ---- */
export const loginUser = (data) => api.post('/auth/login/', data).then((r) => r.data);
export const registerUser = (data) => api.post('/auth/register/', data).then((r) => r.data);
export const logoutUser = (refresh) => api.post('/auth/logout/', { refresh }).then((r) => r.data);
export const refreshToken = (refresh) => api.post('/auth/token/refresh/', { refresh }).then((r) => r.data);
export const getProfile = () => api.get('/auth/profile/').then((r) => r.data);
export const updateProfile = (data) => api.put('/auth/profile/', data).then((r) => r.data);

/* ---- Resumes ---- */
export const getResumes = (params) => api.get('/resumes/', { params }).then((r) => r.data.results);
export const createResume = (data) => api.post('/resumes/', data).then((r) => r.data);
export const getResume = (id) => api.get(`/resumes/${id}/`).then((r) => r.data);
export const updateResume = (id, data) => api.patch(`/resumes/${id}/`, data).then((r) => r.data);
export const deleteResume = (id) => api.delete(`/resumes/${id}/`).then((r) => r.data);
export const enhanceSummary = (id, data) => api.post(`/resumes/${id}/enhance_summary/`, data).then((r) => r.data);
export const enhanceExperience = (id, data) => api.post(`/resumes/${id}/enhance_experience/`, data).then((r) => r.data);
export const enhanceProject = (id, data) => api.post(`/resumes/${id}/enhance_project/`, data).then((r) => r.data);
export const enhanceAll = (id) => api.post(`/resumes/${id}/enhance_all/`).then((r) => r.data);
export const exportPDF = (id, params) => api.get(`/resumes/${id}/export_pdf/`, { params, responseType: 'text' }).then((r) => r.data);
export const getPreviewHtml = (id, params) => api.get(`/resumes/${id}/preview/`, { params, responseType: 'text' }).then((r) => r.data);
export const getTips = (id) => api.get(`/resumes/${id}/tips/`).then((r) => r.data);
export const duplicateResume = (id) => api.post(`/resumes/${id}/duplicate/`).then((r) => r.data);
export const togglePublic = (id) => api.post(`/resumes/${id}/toggle_public/`).then((r) => r.data);
export const getAtsScore = (id, data) => api.post(`/resumes/${id}/ats_score/`, data).then((r) => r.data);
export const healthCheck = () => api.get('/health/').then((r) => r.data);

/* ---- Experiences ---- */
export const createExperience = (data) => api.post('/experiences/', data).then((r) => r.data);
export const updateExperience = (id, data) => api.patch(`/experiences/${id}/`, data).then((r) => r.data);
export const deleteExperience = (id) => api.delete(`/experiences/${id}/`).then((r) => r.data);
export const reorderExperiences = (items) => api.post('/experiences/reorder/', items).then((r) => r.data);

/* ---- Education ---- */
export const createEducation = (data) => api.post('/education/', data).then((r) => r.data);
export const updateEducation = (id, data) => api.patch(`/education/${id}/`, data).then((r) => r.data);
export const deleteEducation = (id) => api.delete(`/education/${id}/`).then((r) => r.data);
export const reorderEducation = (items) => api.post('/education/reorder/', items).then((r) => r.data);

/* ---- Skills ---- */
export const createSkill = (data) => api.post('/skills/', data).then((r) => r.data);
export const updateSkill = (id, data) => api.put(`/skills/${id}/`, data).then((r) => r.data);
export const deleteSkill = (id) => api.delete(`/skills/${id}/`).then((r) => r.data);
export const bulkCreateSkills = (items) => api.post('/skills/bulk_create/', items).then((r) => r.data);

/* ---- Projects ---- */
export const createProject = (data) => api.post('/projects/', data).then((r) => r.data);
export const updateProject = (id, data) => api.put(`/projects/${id}/`, data).then((r) => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}/`).then((r) => r.data);

/* ---- Certifications ---- */
export const createCertification = (data) => api.post('/certifications/', data).then((r) => r.data);
export const updateCertification = (id, data) => api.put(`/certifications/${id}/`, data).then((r) => r.data);
export const deleteCertification = (id) => api.delete(`/certifications/${id}/`).then((r) => r.data);
