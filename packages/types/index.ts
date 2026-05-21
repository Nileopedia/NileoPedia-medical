{
  "name": "@nileopedia/types",
  "version": "0.1.0",
  "main": "index.ts",
  "types": "index.ts"
}

export interface User {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN' | 'DOCTOR'
}

export interface Query {
  id: string
  userId: string
  question: string
  response?: string
  citations?: Citation[]
}

export interface Citation {
  id: string
  source: string
  title: string
  url: string
  snippet: string
}

export interface ValidationResult {
  isValid: boolean
  confidence: number
  sources: Citation[]
}