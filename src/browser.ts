import { inflates } from './inflate/browser'
import { LiveWSBase, OpenLiveWebSocketInfo, WSOptions } from './ws'
import { KeepLive } from './common'

export { OpenLiveWebSocketInfo, WSOptions }
export { LiveOptions, relayEvent } from './common'

export class LiveWS extends LiveWSBase {
  constructor(websocketInfo: OpenLiveWebSocketInfo, opts?: WSOptions) {
    super(inflates as any, websocketInfo, opts)
  }
}

export class KeepLiveWS extends KeepLive<typeof LiveWSBase> {
  constructor(websocketInfo: OpenLiveWebSocketInfo, opts?: WSOptions) {
    super(LiveWSBase, inflates as any, websocketInfo, opts)
  }
}
