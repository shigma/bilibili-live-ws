import { inflates } from './inflate/node'
import { LiveWSBase, OpenLiveWebSocketInfo, WSOptions } from './ws'
import { KeepLive } from './common'

export { OpenLiveWebSocketInfo, WSOptions }
export { LiveOptions, relayEvent } from './common'

export class LiveWS extends LiveWSBase {
  constructor(websocketInfo: OpenLiveWebSocketInfo, opts?: WSOptions) {
    super(inflates, websocketInfo, opts)
  }
}

export class KeepLiveWS extends KeepLive<typeof LiveWSBase> {
  constructor(websocketInfo: OpenLiveWebSocketInfo, opts?: WSOptions) {
    super(LiveWSBase, inflates, websocketInfo, opts)
  }
}
