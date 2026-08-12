# bilibili-live-ws

哔哩哔哩直播开放平台长连接客户端，支持 Node.js 与浏览器。

本项目只接受[哔哩哔哩直播开放平台](https://open-live.bilibili.com/)官方接口返回的长连接参数，不获取网页端 Token，不连接网页端直播弹幕服务器，也不提供 TCP 接入。

## 前置条件

1. 在直播开放平台创建项目并完成平台要求的认证与配置。
2. 由服务端按照[开放平台文档](https://open-live.bilibili.com/document/)调用“开始游戏”接口。
3. 将接口响应中的 `websocket_info` 直接传给本库。

应用密钥和签名逻辑应只存在于服务端，不要放进浏览器代码或提交到仓库。

## 安装

```bash
npm install bilibili-live-ws
```

## 使用

```js
const { LiveWS } = require('bilibili-live-ws')

// 来自直播开放平台“开始游戏”接口响应的 data.websocket_info
const websocketInfo = {
  auth_body: process.env.BILIBILI_OPEN_LIVE_AUTH_BODY,
  wss_link: JSON.parse(process.env.BILIBILI_OPEN_LIVE_WSS_LINKS)
}

const live = new LiveWS(websocketInfo)

live.on('live', () => console.log('长连接认证成功'))
live.on('DANMU_MSG', data => console.log(data))
live.on('error', error => console.error(error))
```

若开放平台返回多个 `wss_link`，可以通过 `linkIndex` 选择其中一个：

```js
const live = new LiveWS(websocketInfo, { linkIndex: 1 })
```

`KeepLiveWS` 使用相同参数，并在连接中断时重新连接：

```js
const { KeepLiveWS } = require('bilibili-live-ws')
const live = new KeepLiveWS(websocketInfo)
```

重新连接复用的是传入的 `websocket_info`。调用方应遵循开放平台对游戏场次和身份码有效期的要求；场次结束后请调用平台的“结束游戏”接口并关闭连接。

## 事件

- `open`：WebSocket 已连接。
- `live`：开放平台身份认证成功。
- `heartbeat`：收到心跳响应。
- `msg`：收到业务消息。
- `DANMU_MSG`：收到弹幕类消息。
- 其他命令：按消息中的 `cmd` 名称触发同名事件。
- `close`：连接关闭。
- `error`：连接错误。

## API

### `new LiveWS(websocketInfo, options?)`

`websocketInfo` 必须为开放平台返回的对象：

```ts
type OpenLiveWebSocketInfo = {
  auth_body: string
  wss_link: string[]
}
```

可选配置：

- `agent`：仅 Node.js，可选 HTTP Agent。
- `linkIndex`：选择开放平台返回的 `wss_link`，默认 `0`。

本库不会接受独立的 Token、房间号、主机名或 WebSocket 地址，也不会调用任何用户端接口补全这些参数。

### `close()`

关闭连接。

### `heartbeat()` / `getOnline()`

发送心跳，或等待下一次心跳响应。

## 升级到 7.0

7.0 删除了网页端/TCP 接入相关的 `LiveTCP`、`KeepLiveTCP`、`getConf`、`getRoomid`、`address`、`host`、`port`、`key`、`uid`、`buvid` 和 `protover`。调用方必须改为传入直播开放平台返回的 `websocket_info`。
