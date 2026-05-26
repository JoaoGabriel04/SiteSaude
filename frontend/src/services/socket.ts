'use client'

import { io, Socket } from "socket.io-client"
import { getAccessToken } from "./api"

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000"
    socket = io(url, {
      auth: (cb: (data: { token: string | null }) => void) => cb({ token: getAccessToken() }),
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) {
    s.connect()
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}
