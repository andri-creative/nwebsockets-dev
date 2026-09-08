import { useState, useEffect } from 'react'
import {
  BookOpen,
  X,
  Code2,
  Server,
  RefreshCw,
  Layers,
  Check,
  Copy,
  Smartphone,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Section {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
}

function CodeSnippet({ code, lang = 'TypeScript' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-3 overflow-hidden rounded-xl border bg-black/80 text-slate-100 shadow-inner">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="font-mono text-[11px] text-primary-foreground/90 font-medium">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] hover:bg-white/10 text-white/80 transition-colors"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 text-xs leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function DocsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('multi-clients')
  const [activePlatform, setActivePlatform] = useState<'flutter' | 'swift' | 'golang' | 'kotlin' | 'python'>('flutter')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sections: Section[] = [
    {
      id: 'multi-clients',
      title: '📱 Flutter, Swift/iOS, Go, dll',
      icon: Smartphone,
      content: (
        <div className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
              Cross-Platform & Multi-Language
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Menghubungkan Berbagai Bahasa ke WebSocket Vercel
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Karena WebSocket menggunakan protokol standar <code>RFC 6455</code> dan data JSON, aplikasi Anda di <strong>Flutter</strong>, <strong>Swift (iOS)</strong>, <strong>Golang</strong>, <strong>Kotlin (Android)</strong>, atau <strong>Python</strong> dapat langsung berkomunikasi dengan server Nitro ini!
            </p>
          </div>

          {/* Sub-tab Platform Selector */}
          <div className="flex flex-wrap gap-2 border-b pb-3">
            {[
              { id: 'flutter', label: 'Flutter / Dart' },
              { id: 'swift', label: 'Swift (iOS Native)' },
              { id: 'golang', label: 'Golang (Go)' },
              { id: 'kotlin', label: 'Kotlin (Android)' },
              { id: 'python', label: 'Python' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activePlatform === p.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* FLUTTER / DART */}
          {activePlatform === 'flutter' && (
            <div className="space-y-3">
              <div className="rounded-xl border bg-card/60 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">1. Install Package</h4>
                <CodeSnippet code="flutter pub add web_socket_channel" lang="Terminal / Bash" />
              </div>

              <div className="rounded-xl border bg-card/60 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">2. Implementasi Client Flutter (Dart)</h4>
                <p className="text-xs text-muted-foreground">
                  Connect ke endpoint Vercel WebSocket, dengarkan broadcast pesan, dan kirim chat:
                </p>
                <CodeSnippet
                  lang="Dart (Flutter)"
                  code={`import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class RealtimeService {
  late WebSocketChannel _channel;

  void connect() {
    // URL server Vercel Anda (gunakan wss:// di production)
    final uri = Uri.parse('wss://your-domain.vercel.app/api/ws');
    _channel = WebSocketChannel.connect(uri);

    // Dengarkan pesan masuk dari server
    _channel.stream.listen((message) {
      final data = jsonDecode(message);
      print('Frame diterima: $data');

      if (data['t'] == 'message') {
        print('Pesan baru dari \${data['message']['name']}: \${data['message']['text']}');
      }
    }, onError: (error) {
      print('WS Error: $error');
    }, onDone: () {
      print('WS Disconnected, coba sambungkan ulang...');
      Future.delayed(Duration(seconds: 2), connect);
    });
  }

  // Kirim pesan chat ke room
  void sendMessage(String text) {
    final payload = jsonEncode({
      't': 'message',
      'text': text,
    });
    _channel.sink.add(payload);
  }

  // Kirim posisi kursor (koordinat 0.0 - 1.0)
  void sendCursor(double x, double y) {
    _channel.sink.add(jsonEncode({
      't': 'cursor',
      'x': x,
      'y': y,
    }));
  }

  void dispose() {
    _channel.sink.close();
  }
}`}
                />
              </div>
            </div>
          )}

          {/* SWIFT / IOS */}
          {activePlatform === 'swift' && (
            <div className="space-y-3">
              <div className="rounded-xl border bg-card/60 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Implementasi Swift (iOS Native - URLSessionWebSocketTask)</h4>
                <p className="text-xs text-muted-foreground">
                  Tidak butuh third-party library, gunakan native Apple Foundation <code>URLSessionWebSocketTask</code>:
                </p>
                <CodeSnippet
                  lang="Swift (iOS 13+)"
                  code={`import Foundation

class RealtimeManager: ObservableObject {
  private var webSocketTask: URLSessionWebSocketTask?
  private let url = URL(string: "wss://your-domain.vercel.app/api/ws")!

  func connect() {
    let session = URLSession(configuration: .default)
    webSocketTask = session.webSocketTask(with: url)
    webSocketTask?.resume()
    listenForMessages()
  }

  private func listenForMessages() {
    webSocketTask?.receive { [weak self] result in
      switch result {
      case .success(let message):
        switch message {
        case .string(let text):
          if let data = text.data(using: .utf8),
             let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            print("Pesan masuk: \\(json)")
          }
        default: break
        }
        // Lanjutkan mendengarkan frame berikutnya
        self?.listenForMessages()

      case .failure(let error):
        print("WebSocket Error: \\(error)")
        // Auto-reconnect setelah 2 detik
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
          self?.connect()
        }
      }
    }
  }

  // Kirim pesan chat ke room
  func sendMessage(_ text: String) {
    let payload: [String: Any] = [
      "t": "message",
      "text": text
    ]
    if let data = try? JSONSerialization.data(withJSONObject: payload),
       let jsonString = String(data: data, encoding: .utf8) {
      webSocketTask?.send(.string(jsonString)) { error in
        if let error = error {
          print("Gagal kirim pesan: \\(error)")
        }
      }
    }
  }
}`}
                />
              </div>
            </div>
          )}

          {/* GOLANG */}
          {activePlatform === 'golang' && (
            <div className="space-y-3">
              <div className="rounded-xl border bg-card/60 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">1. Client Golang (Connect ke Vercel WebSocket)</h4>
                <p className="text-xs text-muted-foreground">
                  Gunakan package modern <code>nhooyr.io/websocket</code>:
                </p>
                <CodeSnippet
                  lang="Golang (Client)"
                  code={`package main

import (
	"context"
	"encoding/json"
	"log"
	"time"
	"nhooyr.io/websocket"
)

type ClientMessage struct {
	Type string \`json:"t"\`
	Text string \`json:"text,omitempty"\`
}

func main() {
	ctx := context.Background()
	wsURL := "wss://your-domain.vercel.app/api/ws"

	conn, _, err := websocket.Dial(ctx, wsURL, nil)
	if err != nil {
		log.Fatalf("Gagal koneksi: %v", err)
	}
	defer conn.Close(websocket.StatusNormalClosure, "")

	// 1. Goroutine untuk membaca pesan dari server
	go func() {
		for {
			_, data, err := conn.Read(ctx)
			if err != nil {
				log.Printf("Disconnected: %v", err)
				return
			}
			log.Printf("Server broadcast: %s", string(data))
		}
	}()

	// 2. Kirim pesan chat dari Go
	msg := ClientMessage{Type: "message", Text: "Halo dari Go backend client!"}
	payload, _ := json.Marshal(msg)

	err = conn.Write(ctx, websocket.MessageText, payload)
	if err != nil {
		log.Printf("Error kirim: %v", err)
	}

	// Jaga proses tetap hidup
	select {}
}`}
                />
              </div>
            </div>
          )}

          {/* KOTLIN / ANDROID */}
          {activePlatform === 'kotlin' && (
            <div className="space-y-3">
              <div className="rounded-xl border bg-card/60 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Implementasi Kotlin (Android Native - OkHttp)</h4>
                <p className="text-xs text-muted-foreground">
                  Gunakan <code>okhttp3.WebSocket</code>:
                </p>
                <CodeSnippet
                  lang="Kotlin (Android)"
                  code={`import okhttp3.*
import org.json.JSONObject

class RealtimeClient {
  private val client = OkHttpClient()
  private var ws: WebSocket? = null

  fun connect() {
    val request = Request.Builder()
      .url("wss://your-domain.vercel.app/api/ws")
      .build()

    ws = client.newWebSocket(request, object : WebSocketListener() {
      override fun onOpen(webSocket: WebSocket, response: Response) {
        println("Terhubung ke Vercel WebSocket!")
      }

      override fun onMessage(webSocket: WebSocket, text: String) {
        val json = JSONObject(text)
        if (json.optString("t") == "message") {
          val msg = json.getJSONObject("message")
          println("Pesan dari \${msg.getString("name")}: \${msg.getString("text")}")
        }
      }

      override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
        println("Gagal terhubung: \${t.message}, reconnecting...")
        // Handle auto-reconnect di sini
      }
    })
  }

  fun sendMessage(text: String) {
    val payload = JSONObject().apply {
      put("t", "message")
      put("text", text)
    }
    ws?.send(payload.toString())
  }
}`}
                />
              </div>
            </div>
          )}

          {/* PYTHON */}
          {activePlatform === 'python' && (
            <div className="space-y-3">
              <div className="rounded-xl border bg-card/60 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Implementasi Python (asyncio + websockets)</h4>
                <p className="text-xs text-muted-foreground">
                  Jalankan <code>pip install websockets</code>:
                </p>
                <CodeSnippet
                  lang="Python 3"
                  code={`import asyncio
import json
import websockets

async def listen(ws):
    async for message in ws:
        data = json.loads(message)
        print(f"Pesan dari Vercel: {data}")

async def send_chat(ws, text):
    payload = json.dumps({"t": "message", "text": text})
    await ws.send(payload)

async def main():
    uri = "wss://your-domain.vercel.app/api/ws"
    async with websockets.connect(uri) as ws:
        print("Connected to Vercel WS!")
        
        # Kirim pesan chat dari Python
        await send_chat(ws, "Halo dari script Python!")
        
        # Terus dengarkan pesan server
        await listen(ws)

asyncio.run(main())`}
                />
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'nitro',
      title: '⚡ Nitro v3 (Web Ini)',
      icon: Server,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Nitro + WebSockets (Arsitektur Web Ini)</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Aplikasi ini menggunakan Nitro v3 dengan runtime native <code>crossws</code> yang berjalan mulus baik di local dev maupun di Vercel Functions.
            </p>
          </div>

          <div className="rounded-xl border bg-card/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">1. Aktifkan di vite.config.ts</h4>
            <CodeSnippet
              code={`// vite.config.ts
import { nitro } from 'nitro/vite'

export default defineConfig({
  plugins: [
    nitro({
      features: { websocket: true }
    })
  ]
})`}
            />
          </div>

          <div className="rounded-xl border bg-card/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">2. Handler WebSocket Server (server/api/ws.ts)</h4>
            <p className="text-xs text-muted-foreground">
              Handler menggunakan <code>defineWebSocketHandler</code> dengan pub/sub channel:
            </p>
            <CodeSnippet
              code={`// server/api/ws.ts
import { defineWebSocketHandler } from 'nitro'

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe('room')
    peer.publish('room', JSON.stringify({ t: 'join', id: peer.id }))
  },
  message(peer, message) {
    const data = JSON.parse(message.text())
    // Broadcast pesan ke seluruh room
    peer.publish('room', JSON.stringify(data))
    peer.send(JSON.stringify(data)) // Echo kembali ke pengirim
  },
  close(peer) {
    peer.publish('room', JSON.stringify({ t: 'leave', id: peer.id }))
  }
})`}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'overview',
      title: '📌 Overview Vercel WS',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Apa itu Vercel Functions WebSockets?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vercel Functions kini mendukung koneksi <strong>WebSocket bidirectional</strong> secara native berkat arsitektur <em>Fluid Compute</em>.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-card/60 p-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                Pinned Connection
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Satu koneksi WebSocket di-pin ke satu instance Vercel Function selama koneksi berlangsung.
              </p>
            </div>

            <div className="rounded-xl border bg-card/60 p-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                Fluid Compute
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Satu instance fungsi dapat melayani banyak koneksi WebSocket secara bersamaan dengan efisien.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <h4 className="text-sm font-semibold text-amber-500">Siklus Hidup Request</h4>
            <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1.5 mt-2">
              <li>Client memulai HTTP <code>GET</code> request dengan header <code>Upgrade: websocket</code>.</li>
              <li>Request melewati middleware, firewall, dan rate limits Vercel.</li>
              <li>Setelah handshake sukses, status berubah menjadi koneksi WebSocket (<code>wss://</code>).</li>
              <li>Frame dikirim dua arah tanpa batas request HTTP biasa.</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'reconnect',
      title: '🔄 Reconnection Client',
      icon: RefreshCw,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Logika Auto-Reconnect di Client</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Karena Vercel Functions serverless memiliki batas durasi maksimum (max duration), client wajib memiliki logika reconnect dengan exponential backoff dan heartbeat ping/pong.
            </p>
          </div>

          <div className="rounded-xl border bg-card/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Pola Exponential Backoff</h4>
            <CodeSnippet
              code={`let socket: WebSocket
let reconnectDelay = 1000

function connect() {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  socket = new WebSocket(\`\${protocol}://\${location.host}/api/ws\`)

  socket.addEventListener('open', () => {
    reconnectDelay = 1000 // Reset delay saat sukses terhubung
  })

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data)
    console.log('Pesan realtime:', data)
  })

  socket.addEventListener('close', () => {
    setTimeout(connect, reconnectDelay)
    reconnectDelay = Math.min(reconnectDelay * 2, 30000)
  })
}

connect()`}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'multiserver',
      title: '🌐 Skala Multi-Instance',
      icon: Layers,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Komunikasi Antar Banyak Instance (Pub/Sub)</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Di lingkungan serverless Vercel, pengguna yang berbeda bisa saja terhubung ke instance fungsi yang berbeda (*scaling out*).
            </p>
          </div>

          <div className="rounded-xl border bg-card/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Solusi: Redis Pub/Sub (Upstash)</h4>
            <p className="text-xs text-muted-foreground">
              Untuk menyinkronkan pesan ke seluruh pengguna di dunia nyata yang terhubung ke instance berbeda:
            </p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              <li>Gunakan <strong>Upstash Redis</strong> atau message broker.</li>
              <li>Ketika sebuah instance menerima pesan chat/event dari user A, ia mem-publish event ke Redis.</li>
              <li>Semua instance serverless mendengarkan channel Redis dan meneruskannya ke WebSocket client masing-masing.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'frameworks',
      title: '⚡ Next.js / Express',
      icon: Code2,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Implementasi di Framework Lain</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vercel Functions juga mendukung WebSockets di Next.js App Router dan Express / Node.js.
            </p>
          </div>

          <div className="rounded-xl border bg-card/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Next.js App Router (app/api/ws/route.ts)</h4>
            <CodeSnippet
              code={`import { experimental_upgradeWebSocket, type WebSocketData } from '@vercel/functions'

export async function GET() {
  return experimental_upgradeWebSocket((ws) => {
    ws.on('message', (data: WebSocketData) => {
      ws.send(data)
    })
  })
}`}
            />
          </div>

          <div className="rounded-xl border bg-card/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Node.js / Express (api/ws.ts)</h4>
            <CodeSnippet
              code={`import http from 'http'
import { WebSocketServer } from 'ws'

const server = http.createServer()
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    ws.send(data)
  })
})

export default server`}
            />
          </div>
        </div>
      ),
    },
  ]

  const activeSection = sections.find((s) => s.id === activeTab)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight text-foreground">
                Dokumentasi Vercel WebSockets Multi-Platform
              </h2>
              <p className="text-xs text-muted-foreground">
                Panduan integrasi Flutter, Swift (iOS), Golang, Android (Kotlin), Python, dan Nitro
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Close documentation"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Navigation Sidebar */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r bg-muted/20 p-3 space-y-1 overflow-x-auto md:overflow-y-auto flex md:flex-col shrink-0">
            {sections.map((sec) => {
              const Icon = sec.icon
              const isActive = activeTab === sec.id
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all text-left whitespace-nowrap md:whitespace-normal w-full ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{sec.title}</span>
                </button>
              )
            })}
          </aside>

          {/* Main Reading View */}
          <main className="flex-1 overflow-y-auto p-5 md:p-6 bg-background">
            {activeSection?.content}
          </main>
        </div>
      </div>
    </div>
  )
}
