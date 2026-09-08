import { createHash, randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoredUser {
  id: string
  email: string
  name: string
  color: string
  passwordHash: string
  /** Active auth token (one token per user, replaced on each login). */
  token: string | null
  /** Unix timestamp (ms) when the token expires. */
  tokenExpiresAt: number | null
}

// ---------------------------------------------------------------------------
// File helpers — works on local dev; falls back to in-memory on Vercel
// ---------------------------------------------------------------------------

const DATA_PATH = resolve(process.cwd(), 'server/data/users.json')
const IS_VERCEL = !!process.env.VERCEL

// In-memory store — used on Vercel (serverless filesystem is read-only)
let memStore: StoredUser[] = []

function readUsers(): StoredUser[] {
  if (IS_VERCEL) return memStore
  try {
    return JSON.parse(readFileSync(DATA_PATH, 'utf-8')) as StoredUser[]
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]): void {
  if (IS_VERCEL) { memStore = users; return }
  try {
    writeFileSync(DATA_PATH, JSON.stringify(users, null, 2), 'utf-8')
  } catch {
    // Fallback: file write failed, keep in memory
    memStore = users
  }
}

// ---------------------------------------------------------------------------
// Password helpers
// ---------------------------------------------------------------------------

/** SHA-256 hash — sufficient for a local-file demo starter. */
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

// ---------------------------------------------------------------------------
// Color generator (consistent with the existing identity palette)
// ---------------------------------------------------------------------------

function randomColor(): string {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue} 85% 60%)`
}

// ---------------------------------------------------------------------------
// Token lifetime
// ---------------------------------------------------------------------------

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Register a new user. Returns the created user or an error string. */
export function registerUser(
  email: string,
  password: string,
): { user: StoredUser } | { error: string } {
  const users = readUsers()
  const normalized = email.toLowerCase().trim()

  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { error: 'Format email tidak valid.' }
  }
  if (!password || password.length < 6) {
    return { error: 'Password minimal 6 karakter.' }
  }
  if (users.some(u => u.email === normalized)) {
    return { error: 'Email sudah terdaftar.' }
  }

  const name = normalized.split('@')[0]!
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  const user: StoredUser = {
    id: randomUUID(),
    email: normalized,
    name,
    color: randomColor(),
    passwordHash: hashPassword(password),
    token: null,
    tokenExpiresAt: null,
  }

  users.push(user)
  writeUsers(users)
  return { user }
}

/** Login an existing user. Returns the user (with refreshed token) or an error string. */
export function loginUser(
  email: string,
  password: string,
): { user: StoredUser } | { error: string } {
  const users = readUsers()
  const normalized = email.toLowerCase().trim()
  const idx = users.findIndex(u => u.email === normalized)

  if (idx === -1) return { error: 'Email tidak ditemukan.' }

  const user = users[idx]!
  if (user.passwordHash !== hashPassword(password)) {
    return { error: 'Password salah.' }
  }

  // Rotate token on each login
  user.token = `sk-${randomUUID()}`
  user.tokenExpiresAt = Date.now() + TOKEN_TTL_MS
  writeUsers(users)
  return { user }
}

/** Validate a token + timestamp pair. Returns the user or null. */
export function validateToken(
  token: string | null | undefined,
  timestamp: string | number | null | undefined,
): StoredUser | null {
  if (!token) return null

  const users = readUsers()
  const user = users.find(u => u.token === token)
  if (!user || !user.tokenExpiresAt) return null

  // Reject if token is expired
  if (Date.now() > user.tokenExpiresAt) return null

  // Optionally cross-check the timestamp the client sent (must match stored expiry)
  if (timestamp !== undefined && timestamp !== null) {
    const ts = Number(timestamp)
    if (Number.isNaN(ts) || ts !== user.tokenExpiresAt) return null
  }

  return user
}

/** Invalidate (clear) a user's token — used on logout. */
export function logoutUser(token: string): void {
  const users = readUsers()
  const user = users.find(u => u.token === token)
  if (user) {
    user.token = null
    user.tokenExpiresAt = null
    writeUsers(users)
  }
}
