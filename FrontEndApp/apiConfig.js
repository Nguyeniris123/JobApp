export const API_URL = 'http://192.168.1.4:8000';
// export const API_URL = 'http://10.17.51.133:8000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/o/token/`,

  // JobPosts
  JOBPOSTS_LIST: `${API_URL}/jobposts/`,
  JOBPOSTS_CREATE: `${API_URL}/jobposts/`,
  JOBPOSTS_RECRUITER_JOB_POST: `${API_URL}/jobposts/recruiter_job_post/`,
  JOBPOSTS_READ: (id) => `${API_URL}/jobposts/${id}/`,
  JOBPOSTS_UPDATE: (id) => `${API_URL}/jobposts/${id}/`,
  JOBPOSTS_PARTIAL_UPDATE: (id) => `${API_URL}/jobposts/${id}/`,
  JOBPOSTS_DELETE: (id) => `${API_URL}/jobposts/${id}/`,

  // Recruiters
  RECRUITERS_CREATE: `${API_URL}/recruiters/`,
  RECRUITERS_GET_CURRENT_USER: `${API_URL}/recruiters/current-user/`,
  RECRUITERS_UPDATE: (id) => `${API_URL}/recruiters/${id}/`,
  RECRUITERS_PARTIAL_UPDATE: (id) => `${API_URL}/recruiters/${id}/`,

  // Candidates
  CANDIDATES_CREATE: `${API_URL}/candidates/`,
  CANDIDATES_GET_CURRENT_USER: `${API_URL}/candidates/current-user/`,
  CANDIDATES_UPDATE: (id) => `${API_URL}/candidates/${id}`,
  CANDIDATES_PARTIAL_UPDATE: (id) => `${API_URL}/candidates/${id}`,

  // Apply Job
  APPLY_JOB: `${API_URL}/apply/`,

  // Applications
  APPLICATIONS_LIST: `${API_URL}/applications/`,
  APPLICATIONS_CREATE: `${API_URL}/applications/`,
  APPLICATIONS_LIST_FOR_RECRUITER: `${API_URL}/applications/recruiter/`,
  APPLICATIONS_READ: (id) => `${API_URL}/applications/${id}/`,
  APPLICATIONS_UPDATE: (id) => `${API_URL}/applications/${id}/`,
  APPLICATIONS_ACCEPT: (id) => `${API_URL}/applications/${id}/accept/`,
  APPLICATIONS_REJECT: (id) => `${API_URL}/applications/${id}/reject/`,

  // Profile
  PROFILE: `${API_URL}/profile/`,

  // Companys
  COMPANIES_LIST: `${API_URL}/companys/`,
  COMPANIES_READ: (id) => `${API_URL}/companys/${id}/`,
  COMPANIES_UPDATE: (id) => `${API_URL}/companys/${id}/`,
  COMPANIES_PARTIAL_UPDATE: (id) => `${API_URL}/companys/${id}/`,

  // Follow
  FOLLOW_LIST: `${API_URL}/follow/`,
  FOLLOW_CREATE: `${API_URL}/follow/`,
  FOLLOW_MY_FOLLOWERS: `${API_URL}/follow/recruiter-followers/`,
  FOLLOW_READ: (id) => `${API_URL}/follow/${id}/`,
  FOLLOW_DELETE: (id) => `${API_URL}/follow/${id}/`,
};
