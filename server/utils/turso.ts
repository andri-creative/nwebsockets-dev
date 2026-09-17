import { createClient, type Client } from '@libsql/client'

let _client: Client | null = null

export function useTurso(): Client {
  if (_client) return _client

  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error(
      'TURSO_DATABASE_URL is not set. '
      + 'Run `turso db show --url <db-name>` to get it.',
    )
  }

  _client = createClient({ url, authToken: authToken ?? undefined })
  return _client
}
