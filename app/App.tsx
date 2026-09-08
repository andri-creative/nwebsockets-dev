import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { AuthModal } from '@/components/auth-modal'
import { ChatPanel } from '@/components/chat-panel'
import { DocsModal } from '@/components/docs-modal'
import { HeroBackdrop } from '@/components/hero-backdrop'
import { LiveCanvas } from '@/components/live-canvas'
import { PresenceBar } from '@/components/presence-bar'
import {
  GitHubLogo,
  MousePointer2,
  Sparkles,
  Users,
  VercelLogo,
} from '@/components/icons'
import { BookOpen, Check, Copy, Eye, EyeOff, KeyRound, LogIn, LogOut, MessageSquare, Trash2, UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { site } from '@/lib/site'

const features = [
  {
    icon: MousePointer2,
    title: 'Live cursors',
    description:
      'Every pointer move is broadcast over a single WebSocket and rendered for everyone in the room.',
  },
  {
    icon: Users,
    title: 'Presence',
    description:
      'Join and leave events keep an accurate, shared roster of who is currently connected.',
  },
  {
    icon: Sparkles,
    title: 'Reactions',
    description:
      'Ephemeral emoji bursts fan out to everyone in the room over the same WebSocket connection.',
  },
  {
    icon: MessageSquare,
    title: 'Live chat',
    description:
      'Realtime bidirectional text messaging fanned out to all connected peers in the room.',
  },
]

export function App() {
  const auth = useAuth()
  const rt = useRealtime({
    token: auth.user?.token,
    expiresAt: auth.user?.expiresAt,
  })
  const [isDocsOpen, setIsDocsOpen] = useState(false)
  const [isTokenOpen, setIsTokenOpen] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)
  const [tokenRevealed, setTokenRevealed] = useState(false)
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({
    open: false,
    tab: 'login',
  })

  function openAuth(tab: 'login' | 'register') {
    setAuthModal({ open: true, tab })
  }

  function closeAuth() {
    setAuthModal(prev => ({ ...prev, open: false }))
  }

  function handleCopyToken() {
    if (auth.user?.token) {
      navigator.clipboard.writeText(auth.user.token)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2000)
    }
  }

  async function handleDeleteToken() {
    await auth.deleteToken()
    setIsTokenOpen(false)
    setTokenRevealed(false)
  }

  async function handleReconnect() {
    const success = await auth.reconnect()
    if (success) {
      // Token restored, WebSocket will auto-connect
    }
  }

  async function handleLogout() {
    await auth.logout()
    setIsTokenOpen(false)
    setTokenRevealed(false)
  }

  return (
    <div className="relative min-h-screen">
      <HeroBackdrop />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <img src="/nitro.svg" alt="Nitro" className="size-6" />
          <span className="text-muted-foreground">×</span>
          <VercelLogo className="size-6" />
          <span className="hidden text-sm sm:inline">WebSockets</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDocsOpen(true)}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'cursor-pointer gap-1.5'
            )}
          >
            <BookOpen className="size-4" />
            <span>Docs</span>
          </button>

          {/* ── Auth area ── */}
          {auth.user ? (
            /* Logged-in state: token panel + logout */
            <div className="flex items-center gap-2">
              {/* Token Panel Toggle */}
              <button
                onClick={() => {
                  setIsTokenOpen(!isTokenOpen)
                  if (!isTokenOpen) setTokenRevealed(false) // Reset reveal when opening
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                  isTokenOpen
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                )}
                title="Lihat & copy token"
              >
                <KeyRound className="size-3.5" />
                <span className="hidden sm:inline">Token</span>
                {rt.status === 'token_expired' && (
                  <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
                {rt.status === 'connected' && (
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                )}
              </button>

              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: auth.user.color }}
                />
                <span className="max-w-[120px] truncate">{auth.user.name}</span>
              </div>
              <button
                id="auth-logout-btn"
                onClick={handleLogout}
                title="Logout"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'cursor-pointer gap-1.5 text-white/70 hover:text-white',
                )}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            /* Guest state: Login + Register buttons */
            <>
              <button
                id="auth-login-btn"
                onClick={() => openAuth('login')}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'cursor-pointer gap-1.5',
                )}
              >
                <LogIn className="size-4" />
                <span>Login</span>
              </button>
              <button
                id="auth-register-btn"
                onClick={() => openAuth('register')}
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'sm' }),
                  'cursor-pointer gap-1.5 bg-white text-black hover:bg-white/90',
                )}
              >
                <UserPlus className="size-4" />
                <span>Register</span>
              </button>
            </>
          )}

          <a
            href={site.deployUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'sm' }),
              'bg-white text-black hover:bg-white/90',
            )}
          >
            <VercelLogo className="size-5" />
            Deploy with Vercel
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-20">
        {/* Token Expired Warning */}
        {auth.user && rt.status === 'token_expired' && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
            <div className="shrink-0 size-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <KeyRound className="size-4 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Token Expired!</p>
              <p className="text-xs text-red-400/70">
                Token kamu sudah tidak berlaku. Login ulang untuk dapat token baru.
              </p>
            </div>
            <button
              onClick={() => openAuth('login')}
              className="shrink-0 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Login Ulang
            </button>
          </div>
        )}

        {/* Guest Mode Warning */}
        {!auth.user && auth.savedToken && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
            <div className="shrink-0 size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <KeyRound className="size-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-400">Token Tersimpan</p>
              <p className="text-xs text-emerald-400/70">
                Kamu sudah login sebelumnya. Klik reconnect untuk hubungkan ulang WebSocket.
              </p>
            </div>
            <button
              onClick={handleReconnect}
              className="shrink-0 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              Reconnect
            </button>
          </div>
        )}

        {/* Guest Mode Warning (no token) */}
        {!auth.user && !auth.savedToken && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3">
            <div className="shrink-0 size-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <KeyRound className="size-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-400">Mode Guest</p>
              <p className="text-xs text-amber-400/70">
                Kamu terhubung tanpa identitas. Login atau register untuk dapat token & identitas tetap.
              </p>
            </div>
            <button
              onClick={() => openAuth('login')}
              className="shrink-0 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              Login
            </button>
          </div>
        )}

        <section className="flex flex-col items-center gap-5 py-10 text-center sm:py-14">
          <Badge variant="subtle" className="rounded-full px-3 py-1">
            Vercel Functions · WebSockets Beta
          </Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Realtime, served from a Vercel Function
          </h1>
          <p className="max-w-xl text-balance text-muted-foreground">
            A minimal Nitro v3 + React starter for the Vercel WebSockets beta.
            Move your cursor below — everything you see is live presence,
            cursors, and reactions over one connection.
          </p>
          <PresenceBar rt={rt} />
        </section>

        <LiveCanvas rt={rt} />

        <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-2 rounded-lg border bg-card p-5"
            >
              <feature.icon className="size-5 text-primary" />
              <h3 className="font-medium text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            Built with{' '}
            <a
              href="https://nitro.build"
              target="_blank"
              rel="noreferrer"
              className="text-foreground hover:underline"
            >
              Nitro
            </a>{' '}
            and{' '}
            <a
              href="https://vercel.com/docs/functions/websockets"
              target="_blank"
              rel="noreferrer"
              className="text-foreground hover:underline"
            >
              Vercel WebSockets
            </a>
            .
          </p>

          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <GitHubLogo className="size-4" />
            vercel/examples
          </a>
        </div>
      </footer>

      {/* Realtime Chat Floating Panel */}
      <ChatPanel rt={rt} />

      {/* Interactive Documentation Modal */}
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModal.open}
        onClose={closeAuth}
        auth={auth}
        defaultTab={authModal.tab}
      />

      {/* Token Panel Dropdown */}
      {isTokenOpen && auth.user && (
        <div className="fixed top-20 right-4 z-50 w-80 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <KeyRound className="size-4" />
              <span className="text-sm font-semibold">Token Kamu</span>
            </div>
            <button
              onClick={() => setIsTokenOpen(false)}
              className="rounded-md p-1 text-white/40 hover:text-white/80"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Status */}
          <div className={cn(
            'mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs',
            rt.status === 'connected' && 'bg-emerald-500/10 text-emerald-400',
            rt.status === 'token_expired' && 'bg-red-500/10 text-red-400',
            rt.status === 'guest' && 'bg-amber-500/10 text-amber-400',
            rt.status === 'connecting' && 'bg-blue-500/10 text-blue-400',
            rt.status === 'disconnected' && 'bg-white/5 text-white/50',
          )}>
            <span className={cn(
              'size-2 rounded-full',
              rt.status === 'connected' && 'bg-emerald-500',
              rt.status === 'token_expired' && 'bg-red-500 animate-pulse',
              rt.status === 'guest' && 'bg-amber-500',
              rt.status === 'connecting' && 'bg-blue-500 animate-pulse',
              rt.status === 'disconnected' && 'bg-white/30',
            )} />
            <span>
              {rt.status === 'connected' && 'WebSocket terhubung (authenticated)'}
              {rt.status === 'token_expired' && 'Token expired! Login ulang'}
              {rt.status === 'guest' && 'Mode guest (tanpa token)'}
              {rt.status === 'connecting' && 'Menyambungkan...'}
              {rt.status === 'disconnected' && 'Terputus'}
            </span>
          </div>

          {/* Token */}
          <div className="rounded-lg border border-white/10 bg-black/50 p-2 mb-3">
            <p className="text-[10px] text-white/40 mb-1">X-TOKEN:</p>
            <div className="flex items-center gap-2">
              {tokenRevealed ? (
                <code className="flex-1 overflow-x-auto text-xs text-emerald-300 font-mono break-all select-all">
                  {auth.user.token}
                </code>
              ) : (
                <code className="flex-1 text-xs text-white/20 font-mono">
                  ••••••••••••••••••••••••••••••••
                </code>
              )}
              <button
                onClick={() => setTokenRevealed(!tokenRevealed)}
                className="shrink-0 rounded-md p-1.5 bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                title={tokenRevealed ? 'Sembunyikan token' : 'Lihat token'}
              >
                {tokenRevealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
              {tokenRevealed && (
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
              )}
            </div>
            {!tokenRevealed && (
              <p className="text-[10px] text-amber-400/70 mt-1.5">
                ⚠️ Klik tombol mata untuk melihat token (sekali lihat)
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleDeleteToken}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="size-3.5" />
              Hapus Token
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 transition-colors"
            >
              <LogOut className="size-3.5" />
              Logout
            </button>
          </div>

          {/* URL Contoh */}
          <div className="rounded-lg bg-white/5 p-2.5 text-xs text-white/50 space-y-1">
            <p className="font-medium text-white/70">WebSocket URL:</p>
            <code className="block break-all text-[10px] text-emerald-300/70 font-mono">
              wss://domain.com/api/ws?token=sk-xxxx...&timestamp={auth.user.expiresAt}
            </code>
          </div>

          {/* Info */}
          <p className="mt-3 text-[10px] text-white/30 text-center">
            Token berlaku 24 jam. Hapus token = invalidate.
          </p>
        </div>
      )}
    </div>
  )
}
