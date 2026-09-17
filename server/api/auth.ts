import { createError, defineEventHandler, readBody, setResponseStatus } from 'nitro/h3'
import { loginUser, logoutUser, registerUser } from '../utils/auth'

/**
 * POST /api/auth
 *
 * Body shapes:
 *   { action: 'register', email: string, password: string }
 *   { action: 'login',    email: string, password: string }
 *   { action: 'logout',   token: string }
 */
export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  const body = await readBody<Record<string, unknown>>(event) ?? {}

  const { action, email, password, token } = body as {
    action?: string
    email?: string
    password?: string
    token?: string
  }

  // ------------------------------------------------------------------
  // Logout — just needs the token
  // ------------------------------------------------------------------
  if (action === 'logout' || action === 'delete_token') {
    if (typeof token === 'string') await logoutUser(token)
    return { ok: true }
  }

  // ------------------------------------------------------------------
  // Register
  // ------------------------------------------------------------------
  if (action === 'register') {
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'email dan password wajib diisi.' })
    }

    const result = await registerUser(email, password)
    if ('error' in result) {
      throw createError({ statusCode: 400, statusMessage: result.error })
    }

    // Auto-login after register
    const loginResult = await loginUser(email, password)
    if ('error' in loginResult) {
      throw createError({ statusCode: 500, statusMessage: loginResult.error })
    }

    const { user } = loginResult
    setResponseStatus(event, 201)
    return {
      token: user.token,
      expiresAt: user.tokenExpiresAt,
      user: { id: user.id, name: user.name, color: user.color, email: user.email },
    }
  }

  // ------------------------------------------------------------------
  // Login
  // ------------------------------------------------------------------
  if (action === 'login') {
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'email dan password wajib diisi.' })
    }

    const result = await loginUser(email, password)
    if ('error' in result) {
      throw createError({ statusCode: 401, statusMessage: result.error })
    }

    const { user } = result
    return {
      token: user.token,
      expiresAt: user.tokenExpiresAt,
      user: { id: user.id, name: user.name, color: user.color, email: user.email },
    }
  }

  throw createError({ statusCode: 400, statusMessage: 'action tidak dikenal. Gunakan: register, login, atau logout.' })
})
