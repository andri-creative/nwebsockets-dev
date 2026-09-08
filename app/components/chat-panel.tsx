import { useEffect, useRef, useState } from 'react'
import { MessageSquare, Send, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UseRealtime } from '@/hooks/use-realtime'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ChatPanel({ rt }: { rt: UseRealtime }) {
  const [isOpen, setIsOpen] = useState(true)
  const [text, setText] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevMessagesLength = useRef(rt.messages.length)

  // Track unread messages when closed
  useEffect(() => {
    if (!isOpen && rt.messages.length > prevMessagesLength.current) {
      setUnreadCount((prev) => prev + (rt.messages.length - prevMessagesLength.current))
    }
    prevMessagesLength.current = rt.messages.length
  }, [rt.messages.length, isOpen])

  // Clear unread when opened
  const handleOpen = () => {
    setIsOpen(true)
    setUnreadCount(0)
  }

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [rt.messages, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || rt.status !== 'connected') return

    rt.sendMessage(trimmed)
    setText('')
  }

  const isConnected = rt.status === 'connected'

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Expanded Chat Box */}
      {isOpen ? (
        <div className="flex h-96 w-80 sm:w-96 flex-col overflow-hidden rounded-2xl border bg-background/95 shadow-2xl backdrop-blur-md transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/40">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-none text-foreground">Room Chat</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isConnected ? `${rt.count} active in room` : 'Connecting...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat"
              >
                <ChevronDown className="size-4" />
              </Button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {rt.messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <MessageSquare className="size-8 stroke-[1.5] text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs text-muted-foreground/80 max-w-[200px]">
                  Say hello! Messages are broadcasted in real time to everyone in the room.
                </p>
              </div>
            ) : (
              rt.messages.map((msg) => {
                const isSelf = msg.peerId === rt.self?.id
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-end gap-2 text-sm',
                      isSelf ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {!isSelf && (
                      <Avatar className="size-6 shrink-0 ring-1 ring-background">
                        <AvatarFallback
                          className="text-[10px] font-semibold text-white"
                          style={{ backgroundColor: msg.color }}
                        >
                          {initials(msg.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        'flex flex-col max-w-[78%]',
                        isSelf ? 'items-end' : 'items-start'
                      )}
                    >
                      <div className="flex items-center gap-1.5 px-1 mb-1 text-[10px] text-muted-foreground">
                        <span className="font-medium" style={{ color: isSelf ? undefined : msg.color }}>
                          {isSelf ? 'You' : msg.name}
                        </span>
                        <span>•</span>
                        <span>{formatTime(msg.createdAt)}</span>
                      </div>

                      <div
                        className={cn(
                          'rounded-2xl px-3 py-2 text-sm leading-relaxed break-words',
                          isSelf
                            ? 'bg-primary text-primary-foreground rounded-br-xs'
                            : 'bg-muted text-foreground rounded-bl-xs border'
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="border-t p-2.5 bg-background/80">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={isConnected ? 'Type a message...' : 'Connecting to chat...'}
                disabled={!isConnected}
                className="flex-1 rounded-xl border bg-muted/40 px-3.5 py-2 text-xs sm:text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!text.trim() || !isConnected}
                className="size-9 shrink-0 rounded-xl"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* Floating Button when Minimized */
        <Button
          onClick={handleOpen}
          className="relative size-12 rounded-full shadow-lg transition-transform hover:scale-105"
          aria-label="Open chat"
        >
          <MessageSquare className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      )}
    </div>
  )
}
