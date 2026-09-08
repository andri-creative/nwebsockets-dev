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
  KeyRound,
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
  const [activePlatform, setActivePlatform] = useState<'auth' | 'flutter' | 'swift' | 'golang' | 'kotlin' | 'python'>('auth')

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
      id: 'auth',
      title: '🔐 Autentikasi & Token',
      icon: KeyRound,
      content: (
        <div className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 mb-2">
              Authentication Flow
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Cara Mendapatkan & Menggunakan Token
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Token digunakan untuk autentikasi koneksi WebSocket. Setiap user yang register/login akan mendapatkan token unik.
            </p>
          </div>

          <div className="rounded-xl border bg-card/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">1. Register / Login via REST API</h4>
            <CodeSnippet
              lang="HTTP Request"
              code={`# Register
curl -X POST https://your-domain.vercel.app/api/auth \\
  -H "Content-Type: application/json" \\
  -d '{"action":"register","email":"user@email.com","password":"secret123"}'

# Response:
# {
#   "token": "cc654f37-d2ee-4a4e-b784-d378050ea02a",
#   "expiresAt": 1788919776556,
#   "user": { "id": "...", "name": "User", "email": "user@email.com", "color": "hsl(...)" }
# }

# Login
curl -X POST https://your-domain.vercel.app/api/auth \\
  -H "Content-Type: application/json" \\
  -d '{"action":"login","email":"user@email.com","password":"secret123"}'`}
            />
          </div>

          <div className="rounded-xl border bg-card/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">2. Connect WebSocket dengan Token</h4>
            <p className="text-xs text-muted-foreground">
              Sertakan token sebagai query parameter saat connect ke WebSocket:
            </p>
            <CodeSnippet
              lang="WebSocket URL"
              code={`wss://your-domain.vercel.app/api/ws?token=YOUR_TOKEN_HERE&timestamp=EXPIRES_AT`}
            />
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <h4 className="text-sm font-semibold text-amber-500">Catatan Penting</h4>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1.5 mt-2">
              <li>Token berlaku selama <strong>24 jam</strong> sejak login terakhir.</li>
              <li>Login ulang akan menghasilkan token baru (token lama otomatis tidak valid).</li>
              <li>Tanpa token, user akan terhubung sebagai <strong>guest</strong> (anonymous identity).</li>
              <li>Token bisa diambil dari modal login/register di web ini, atau dari response API.</li>
            </ul>
          </div>
        </div>
      ),
    },
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
              { id: 'auth', label: '🔐 Autentikasi' },
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
                  Connect ke endpoint WebSocket dengan token autentikasi:
                </p>
                <CodeSnippet
                  lang="Dart (Flutter)"
                  code={`import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class RealtimeService {
  late WebSocketChannel _channel;

  /// Connect dengan token autentikasi
  void connect(String token, {int? expiresAt}) {
    // Bangun URL dengan token sebagai query parameter
    var uri = 'wss://your-domain.vercel.app/api/ws';
    if (token.isNotEmpty) {
      uri += '?token=\${Uri.encodeComponent(token)}';
      if (expiresAt != null) {
        uri += '&timestamp=\$expiresAt';
      }
    }

    _channel = WebSocketChannel.connect(Uri.parse(uri));

    // Dengarkan pesan masuk dari server
    _channel.stream.listen((message) {
      final data = jsonDecode(message);
      print('Frame diterima: \$data');

      if (data['t'] == 'message') {
        print('Pesan baru dari \${data['message']['name']}: \${data['message']['text']}');
      }
    }, onError: (error) {
      print('WS Error: \$error');
    }, onDone: () {
      print('WS Disconnected, reconnecting...');
      Future.delayed(Duration(seconds: 2), () => connect(token, expiresAt: expiresAt));
    });
  }

  /// Login dulu untuk mendapatkan token
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('https://your-domain.vercel.app/api/auth'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'action': 'login',
        'email': email,
        'password': password,
      }),
    );
    return jsonDecode(response.body);
  }

  // Kirim pesan chat ke room
  void sendMessage(String text) {
    final payload = jsonEncode({'t': 'message', 'text': text});
    _channel.sink.add(payload);
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
  
  /// Connect dengan token autentikasi
  func connect(token: String, expiresAt: Int? = nil) {
    var urlString = "wss://your-domain.vercel.app/api/ws"
    if !token.isEmpty {
      urlString += "?token=\(token)"
      if let ts = expiresAt {
        urlString += "&timestamp=\\(ts)"
      }
    }
    
    let url = URL(string: urlString)!
    let session = URLSession(configuration: .default)
    webSocketTask = session.webSocketTask(with: url)
    webSocketTask?.resume()
    listenForMessages()
  }
  
  /// Login untuk mendapatkan token
  func login(email: String, password: String, completion: @escaping (String?, Int?) -> Void) {
    let url = URL(string: "https://your-domain.vercel.app/api/auth")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body = ["action": "login", "email": email, "password": password]
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)
    
    URLSession.shared.dataTask(with: request) { data, _, _ in
      guard let data = data,
            let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let token = json["token"] as? String,
            let expiresAt = json["expiresAt"] as? Int else {
        completion(nil, nil)
        return
      }
      completion(token, expiresAt)
    }.resume()
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
        self?.listenForMessages()
      case .failure(let error):
        print("WebSocket Error: \\(error)")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
          self?.connect(token: "", expiresAt: nil)
        }
      }
    }
  }

  func sendMessage(_ text: String) {
    let payload: [String: Any] = ["t": "message", "text": text]
    if let data = try? JSONSerialization.data(withJSONObject: payload),
       let jsonString = String(data: data, encoding: .utf8) {
      webSocketTask?.send(.string(jsonString)) { _ in }
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
                <h4 className="text-sm font-semibold text-foreground">1. Client Golang (Connect dengan Token)</h4>
                <p className="text-xs text-muted-foreground">
                  Gunakan package modern <code>nhooyr.io/websocket</code>:
                </p>
                <CodeSnippet
                  lang="Golang (Client)"
                  code={`package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
	"nhooyr.io/websocket"
)

type ClientMessage struct {
	Type string \`json:"t"\`
	Text string \`json:"text,omitempty"\`
}

type LoginResponse struct {
	Token     string \`json:"token"\`
	ExpiresAt int64  \`json:"expiresAt"\`
}

// Login untuk mendapatkan token
func login(email, password string) (*LoginResponse, error) {
	body := map[string]string{
		"action":   "login",
		"email":    email,
		"password": password,
	}
	jsonBody, _ := json.Marshal(body)

	resp, err := http.Post(
		"https://your-domain.vercel.app/api/auth",
		"application/json",
		bytes.NewBuffer(jsonBody),
	)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result LoginResponse
	json.NewDecoder(resp.Body).Decode(&result)
	return &result, nil
}

func main() {
	// 1. Login dulu
	loginResp, err := login("user@email.com", "password123")
	if err != nil {
		log.Fatalf("Login gagal: %v", err)
	}

	// 2. Connect WebSocket dengan token
	ctx := context.Background()
	wsURL := fmt.Sprintf(
		"wss://your-domain.vercel.app/api/ws?token=%s&timestamp=%d",
		loginResp.Token,
		loginResp.ExpiresAt,
	)

	conn, _, err := websocket.Dial(ctx, wsURL, nil)
	if err != nil {
		log.Fatalf("Gagal koneksi: %v", err)
	}
	defer conn.Close(websocket.StatusNormalClosure, "")

	// 3. Baca pesan dari server
	go func() {
		for {
			_, data, err := conn.Read(ctx)
			if err != nil {
				log.Printf("Disconnected: %v", err)
				return
			}
			log.Printf("Server: %s", string(data))
		}
	}()

	// 4. Kirim pesan
	msg := ClientMessage{Type: "message", Text: "Halo dari Go!"}
	payload, _ := json.Marshal(msg)
	conn.Write(ctx, websocket.MessageText, payload)

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
                  Gunakan <code>okhttp3.WebSocket</code> dengan token autentikasi:
                </p>
                <CodeSnippet
                  lang="Kotlin (Android)"
                  code={`import okhttp3.*
import org.json.JSONObject
import java.io.IOException

class RealtimeClient {
  private val client = OkHttpClient()
  private var ws: WebSocket? = null

  /// Login untuk mendapatkan token
  fun login(email: String, password: String, callback: (String?, Int?) -> Unit) {
    val body = JSONObject().apply {
      put("action", "login")
      put("email", email)
      put("password", password)
    }

    val request = Request.Builder()
      .url("https://your-domain.vercel.app/api/auth")
      .post(body.toString().toRequestBody("application/json".toMediaType()))
      .build()

    client.newCall(request).enqueue(object : Callback {
      override fun onFailure(call: Call, e: IOException) { callback(null, null) }
      override fun onResponse(call: Call, response: Response) {
        val json = JSONObject(response.body?.string() ?: "")
        callback(json.optString("token"), json.optInt("expiresAt"))
      }
    })
  }

  /// Connect dengan token autentikasi
  fun connect(token: String, expiresAt: Int? = null) {
    var url = "wss://your-domain.vercel.app/api/ws"
    if (token.isNotEmpty()) {
      url += "?token=$token"
      if (expiresAt != null) url += "&timestamp=$expiresAt"
    }

    val request = Request.Builder().url(url).build()

    ws = client.newWebSocket(request, object : WebSocketListener() {
      override fun onOpen(webSocket: WebSocket, response: Response) {
        println("Terhubung ke WebSocket!")
      }

      override fun onMessage(webSocket: WebSocket, text: String) {
        val json = JSONObject(text)
        if (json.optString("t") == "message") {
          val msg = json.getJSONObject("message")
          println("Pesan dari \${msg.getString("name")}: \${msg.getString("text")}")
        }
      }

      override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
        println("Gagal: \${t.message}, reconnecting...")
        // Reconnect setelah delay
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
                  Jalankan <code>pip install websockets aiohttp</code>:
                </p>
                <CodeSnippet
                  lang="Python 3"
                  code={`import asyncio
import json
import aiohttp
import websockets

# Login untuk mendapatkan token
async def login(email: str, password: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://your-domain.vercel.app/api/auth",
            json={"action": "login", "email": email, "password": password}
        ) as resp:
            return await resp.json()

# Connect WebSocket dengan token
async def connect_with_token(token: str, expires_at: int):
    uri = f"wss://your-domain.vercel.app/api/ws?token={token}&timestamp={expires_at}"
    
    async with websockets.connect(uri) as ws:
        print("Connected to WebSocket!")
        
        # Kirim pesan chat
        await ws.send(json.dumps({"t": "message", "text": "Halo dari Python!"}))
        
        # Terus dengarkan pesan server
        async for message in ws:
            data = json.loads(message)
            print(f"Server: {data}")

async def main():
    # 1. Login dulu
    login_resp = await login("user@email.com", "password123")
    token = login_resp["token"]
    expires_at = login_resp["expiresAt"]
    
    # 2. Connect dengan token
    await connect_with_token(token, expires_at)

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
