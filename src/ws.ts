import { EventEmitter } from 'events'
import { Agent } from 'http'
import IsomorphicWebSocket from 'isomorphic-ws'

import { Inflates } from './buffer'
import { LiveOptions, Live } from './common'

export type OpenLiveWebSocketInfo = {
  auth_body: string
  wss_link: string[]
}

export type WSOptions = LiveOptions & { agent?: Agent, linkIndex?: number }

export const isNode = !!IsomorphicWebSocket.Server

export const resolveOpenLiveWebSocketInfo = (websocketInfo: OpenLiveWebSocketInfo, linkIndex = 0) => {
  if (!websocketInfo || typeof websocketInfo !== 'object') {
    throw new TypeError('websocketInfo must be the websocket_info returned by Bilibili Live Open Platform')
  }
  if (typeof websocketInfo.auth_body !== 'string' || websocketInfo.auth_body.length === 0) {
    throw new TypeError('websocketInfo.auth_body must be a non-empty string')
  }
  if (!Array.isArray(websocketInfo.wss_link) || websocketInfo.wss_link.length === 0) {
    throw new TypeError('websocketInfo.wss_link must be a non-empty array')
  }
  if (!Number.isInteger(linkIndex) || linkIndex < 0 || linkIndex >= websocketInfo.wss_link.length) {
    throw new RangeError('linkIndex must select an entry in websocketInfo.wss_link')
  }
  const address = websocketInfo.wss_link[linkIndex]
  if (typeof address !== 'string' || !address.startsWith('wss://')) {
    throw new TypeError('websocketInfo.wss_link must only contain secure WebSocket URLs')
  }
  return {
    address,
    authBody: websocketInfo.auth_body
  }
}

class WebSocket extends EventEmitter {
  ws: IsomorphicWebSocket

  constructor(address: string, inflates: Inflates, ...args: any[]) {
    super()

    const ws = new IsomorphicWebSocket(address, ...(isNode ? args : []))
    this.ws = ws

    ws.onopen = () => this.emit('open')
    ws.onmessage = isNode ? ({ data }) => this.emit('message', data) : async ({ data }) => this.emit('message', inflates.Buffer.from(await new Response(data as unknown as InstanceType<typeof Blob>).arrayBuffer()))
    ws.onerror = () => this.emit('error')
    ws.onclose = () => this.emit('close')
  }

  get readyState() {
    return this.ws.readyState
  }

  send(data: Buffer) {
    this.ws.send(data)
  }

  close(code?: number, data?: string) {
    this.ws.close(code, data)
  }
}

export class LiveWSBase extends Live {
  ws: InstanceType<typeof WebSocket>

  constructor(inflates: Inflates, websocketInfo: OpenLiveWebSocketInfo, { agent, linkIndex = 0 }: WSOptions = {}) {
    const { address, authBody } = resolveOpenLiveWebSocketInfo(websocketInfo, linkIndex)
    const ws = new WebSocket(address, inflates, { agent })
    const send = (data: Buffer) => {
      if (ws.readyState === 1) {
        ws.send(data)
      }
    }
    const close = () => this.ws.close()

    super(inflates, { send, close, authBody })

    ws.on('open', (...params) => this.emit('open', ...params))
    ws.on('message', data => this.emit('message', data as Buffer))
    ws.on('close', (code, reason) => this.emit('close', code, reason))
    ws.on('error', error => this.emit('_error', error))

    this.ws = ws
  }
}
