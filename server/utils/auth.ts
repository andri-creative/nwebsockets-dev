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

  const newToken = `sk-${randomUUID()}`

  const user: StoredUser = {
    id: randomUUID(),
    email: normalized,
    name,
    color: randomColor(),
    passwordHash: hashPassword(password),
    token: newToken,
    tokenExpiresAt: null,
  }

  await db.execute({
    sql: `INSERT INTO users (id, email, name, color, password_hash, token, token_expires_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [user.id, user.email, user.name, user.color, user.passwordHash, newToken, null],
  })

  return { user }
}

/** Login an existing user. Returns the user with existing token. */
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

  // Use existing token, only generate if missing (migration for old users)
  if (!user.token) {
    const newToken = `sk-${randomUUID()}`
    await db.execute({
      sql: 'UPDATE users SET token = ? WHERE id = ?',
      args: [newToken, user.id],
    })
    user.token = newToken
  }
  return { user }
}

/** Validate a token. Returns the user or null. */
export async function validateToken(
  token: string | null | undefined,
): Promise<StoredUser | null> {
  if (!token) return null

  await ensureSchema()
  const db = useTurso()

  const { rows } = await db.execute({
    sql: 'SELECT * FROM users WHERE token = ?',
    args: [token],
  })

  if (rows.length === 0) return null

  return rowToUser(rows[0]!)
}

/** Logout is a no-op — token persists. Use deleteToken to revoke. */
export async function logoutUser(_token: string): Promise<void> {
  // Intentionally empty — token stays valid
}
