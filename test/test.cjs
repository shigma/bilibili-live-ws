const { assert } = require('chai')

const { resolveOpenLiveWebSocketInfo } = require('../src/ws')

describe('resolveOpenLiveWebSocketInfo', function() {
  const websocketInfo = {
    auth_body: '{"key":"issued-by-open-platform"}',
    wss_link: ['wss://open-platform.example/first', 'wss://open-platform.example/second']
  }

  it('uses the official auth body and first WSS link', function() {
    assert.deepEqual(resolveOpenLiveWebSocketInfo(websocketInfo), {
      authBody: websocketInfo.auth_body,
      address: websocketInfo.wss_link[0]
    })
  })

  it('can select another official WSS link', function() {
    assert.strictEqual(resolveOpenLiveWebSocketInfo(websocketInfo, 1).address, websocketInfo.wss_link[1])
  })

  it('rejects a missing auth body', function() {
    assert.throws(() => resolveOpenLiveWebSocketInfo({ auth_body: '', wss_link: websocketInfo.wss_link }))
  })

  it('rejects a caller-supplied non-WSS endpoint', function() {
    assert.throws(() => resolveOpenLiveWebSocketInfo({ auth_body: websocketInfo.auth_body, wss_link: ['ws://example.com/sub'] }))
  })

  it('rejects a link index outside the official response', function() {
    assert.throws(() => resolveOpenLiveWebSocketInfo(websocketInfo, 2))
  })
})
