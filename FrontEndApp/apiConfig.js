import { API_HOST as API_URL } from '@env';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/o/token/`,
  FIREBASE_TOKEN: `${API_URL}/firebase-token/`,

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
  CANDIDATES_UPDATE: (id) => `${API_URL}/candidates/${id}/`,
  CANDIDATES_PARTIAL_UPDATE: (id) => `${API_URL}/candidates/${id}/`,

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

  // avatar
  AVATAR_PUT: (id) => `${API_URL}/avatars/${id}/`,
  AVATAR_PATCH: (id) => `${API_URL}/avatars/${id}/`,

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

  //Review_candidate 
  REVIEWS_CANDIDATE_CREATE: `${API_URL}/review_candidates/`,
  REVIEWS_LIST_FOR_CANDIDATE: (id) => `${API_URL}/review_candidates/candidate/${id}/recruiter-reviews/`,
  REVIEWS_DELETE_FOR_CANDIDATE: (id) => `${API_URL}/reviews_candidates/${id}/`,
  //Review_recruiter 
  REVIEWS_RECRUITER_CREATE: `${API_URL}/review_recruiters/`,
  REVIEWS_LIST_FOR_RECRUITER: (id) => `${API_URL}/review_recruiters/company/${id}/candidate-reviews/`,
  REVIEWS_DELETE_FOR_RECRUITER: (id) => `${API_URL}/review_recruiters/${id}/`,

};
