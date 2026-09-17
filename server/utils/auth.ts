import { createHash, randomUUID } from 'node:crypto'
import { useTurso } from './turso'

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
// Schema — run once to ensure the users table exists
// ---------------------------------------------------------------------------

let schemaReady = false

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return
  const db = useTurso()
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id              TEXT PRIMARY KEY,
      email           TEXT NOT NULL UNIQUE,
      name            TEXT NOT NULL,
      color           TEXT NOT NULL,
      password_hash   TEXT NOT NULL,
      token           TEXT,
      token_expires_at INTEGER
    )
  `)
  schemaReady = true
}

// ---------------------------------------------------------------------------
// Row → StoredUser helper
// ---------------------------------------------------------------------------

function rowToUser(row: Record<string, unknown>): StoredUser {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    color: row.color as string,
    passwordHash: row.password_hash as string,
    token: (row.token as string) ?? null,
    tokenExpiresAt: (row.token_expires_at as number) ?? null,
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
export async function registerUser(
  email: string,
  password: string,
): Promise<{ user: StoredUser } | { error: string }> {
  await ensureSchema()
  const db = useTurso()
  const normalized = email.toLowerCase().trim()

  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { error: 'Format email tidak valid.' }
  }
  if (!password || password.length < 6) {
    return { error: 'Password minimal 6 karakter.' }
  }

  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [normalized],
  })
  if (existing.rows.length > 0) {
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

  await db.execute({
    sql: `INSERT INTO users (id, email, name, color, password_hash, token, token_expires_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [user.id, user.email, user.name, user.color, user.passwordHash, null, null],
  })

  return { user }
}

/** Login an existing user. Returns the user (with refreshed token) or an error string. */
export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: StoredUser } | { error: string }> {
  await ensureSchema()
  const db = useTurso()
  const normalized = email.toLowerCase().trim()

  const { rows } = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [normalized],
  })

  if (rows.length === 0) return { error: 'Email tidak ditemukan.' }

  const user = rowToUser(rows[0]!)
  if (user.passwordHash !== hashPassword(password)) {
    return { error: 'Password salah.' }
  }

  // Rotate token on each login
  const newToken = `sk-${randomUUID()}`
  const newExpiresAt = Date.now() + TOKEN_TTL_MS

  await db.execute({
    sql: 'UPDATE users SET token = ?, token_expires_at = ? WHERE id = ?',
    args: [newToken, newExpiresAt, user.id],
  })

  user.token = newToken
  user.tokenExpiresAt = newExpiresAt
  return { user }
}

/** Validate a token + timestamp pair. Returns the user or null. */
export async function validateToken(
  token: string | null | undefined,
  timestamp: string | number | null | undefined,
): Promise<StoredUser | null> {
  if (!token) return null

  await ensureSchema()
  const db = useTurso()

  const { rows } = await db.execute({
    sql: 'SELECT * FROM users WHERE token = ?',
    args: [token],
  })

  if (rows.length === 0) return null

  const user = rowToUser(rows[0]!)
  if (!user.tokenExpiresAt) return null

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
export async function logoutUser(token: string): Promise<void> {
  await ensureSchema()
  const db = useTurso()

  await db.execute({
    sql: 'UPDATE users SET token = NULL, token_expires_at = NULL WHERE token = ?',
    args: [token],
  })
}
