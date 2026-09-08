import { useEffect, useRef, useState } from 'react'
import type { AuthState } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Check, Copy, KeyRound } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  auth: AuthState
  defaultTab?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, auth, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tokenCopied, setTokenCopied] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  // Sync defaultTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab)
      setEmail('')
      setPassword('')
      setTokenCopied(false)
      setTimeout(() => emailRef.current?.focus(), 50)
    }
  }, [isOpen, defaultTab])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    if (!trimmedEmail || !trimmedPassword) return

    let success = false
    if (tab === 'login') {
      success = await auth.login(trimmedEmail, trimmedPassword)
    } else {
      success = await auth.register(trimmedEmail, trimmedPassword)
    }
    // Don't close on success — show token instead
  }

  function handleCopyToken() {
    if (auth.user?.token) {
      navigator.clipboard.writeText(auth.user.token)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2000)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={tab === 'login' ? 'Login' : 'Register'}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl shadow-black/60">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-white/40 transition-colors hover:text-white/80"
          aria-label="Tutup modal"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Logo / Title */}
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">
            {tab === 'login' ? 'Masuk ke akun' : 'Buat akun baru'}
          </h2>
          <p className="text-xs text-white/40">
            {tab === 'login'
              ? 'Gunakan identitas akun saat di room'
              : 'Daftar untuk identitas tetap di room'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-5 flex rounded-lg bg-white/5 p-1">
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); auth.error && void 0 }}
              className={cn(
                'flex-1 rounded-md py-1.5 text-sm font-medium transition-all duration-200',
                tab === t
                  ? 'bg-white text-black shadow'
                  : 'text-white/50 hover:text-white/80',
              )}
            >
              {t === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Error */}
          {auth.error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {auth.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-email" className="text-xs font-medium text-white/60">
              Email
            </label>
            <input
              id="auth-email"
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              autoComplete="email"
              required
              disabled={auth.isLoading}
              className={cn(
                'rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/25',
                'transition-colors focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20',
                'disabled:opacity-50',
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-password" className="text-xs font-medium text-white/60">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={tab === 'register' ? 'Minimal 6 karakter' : '••••••••'}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              required
              disabled={auth.isLoading}
              className={cn(
                'rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/25',
                'transition-colors focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20',
                'disabled:opacity-50',
              )}
            />
          </div>

          <button
            id={`auth-submit-${tab}`}
            type="submit"
            disabled={auth.isLoading || !email.trim() || !password.trim()}
            className={cn(
              'mt-1 w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-black',
              'transition-all hover:bg-white/90 active:scale-[0.98]',
              'disabled:cursor-not-allowed disabled:opacity-40',
            )}
          >
            {auth.isLoading
              ? (tab === 'login' ? 'Masuk...' : 'Mendaftar...')
              : (tab === 'login' ? 'Masuk' : 'Daftar')}
          </button>
        </form>

        {/* Switch tab link */}
        {!auth.user && (
          <p className="mt-4 text-center text-xs text-white/40">
            {tab === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button
              onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
              className="text-white/70 underline-offset-2 hover:text-white hover:underline"
            >
              {tab === 'login' ? 'Daftar' : 'Masuk'}
            </button>
          </p>
        )}

        {/* Token Display — shown after successful login/register */}
        {auth.user && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <KeyRound className="size-4" />
              <span className="text-sm font-semibold">Token Berhasil Digenerate!</span>
            </div>
            <p className="text-xs text-white/50">
              Gunakan token ini di client (Flutter, Swift, Go, Python, dsb) untuk autentikasi WebSocket:
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 p-2">
              <code className="flex-1 overflow-x-auto text-xs text-emerald-300 font-mono break-all">
                {auth.user.token}
              </code>
              <button
                onClick={handleCopyToken}
                className={cn(
                  'shrink-0 rounded-md p-1.5 transition-colors',
                  tokenCopied
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                )}
                title="Copy token"
              >
                {tokenCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </button>
            </div>
            <div className="rounded-lg bg-black/30 p-2.5 text-xs text-white/40 space-y-1">
              <p className="font-medium text-white/60">Cara pakai:</p>
              <p>WebSocket URL: <code className="text-emerald-300">wss://domain.com/api/ws?token={auth.user.token.slice(0, 8)}...</code></p>
              <p>Token berlaku 24 jam. Login ulang untuk dapat token baru.</p>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-emerald-500/20 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/30"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
