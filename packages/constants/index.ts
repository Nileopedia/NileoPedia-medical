{
  "name": "@nileopedia/constants",
  "version": "0.1.0",
  "main": "index.ts"
}

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR'
} as const

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  QUERY: '/api/query',
  CITATIONS: '/api/citations'
} as const

export const VALIDATION_THRESHOLDS = {
  MIN_CONFIDENCE: 0.8,
  MIN_SOURCES: 2
}