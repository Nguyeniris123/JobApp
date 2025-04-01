export const API_URL = 'http://192.168.1.5:8000';

export const API_ENDPOINTS = {
  LOGIN: `${API_URL}/o/token/`,
  REGISTER: `${API_URL}/auth/register/`,
  JOB_POSTS: `${API_URL}/jobpost/`,
  CANDIDATES: `${API_URL}/candidates/`,
  RECRUITERS: `${API_URL}/recruiters/`,
  APPLY_JOB: `${API_URL}/apply/`,
  PROFILE: `${API_URL}/profile/`,
  GETCANDIDATEUSER: `${API_URL}/candidates/current_user/`,
  GETRECRUITERUSER: `${API_URL}/recruiters/current_user/`,
};

export default API_ENDPOINTS;