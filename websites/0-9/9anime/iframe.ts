const iframe = new iFrame()

let currentMedia: HTMLMediaElement | null = null
let lastPayload = ''

const mediaEvents = [
  'play',
  'playing',
  'pause',
  'timeupdate',
  'seeking',
  'seeked',
  'loadedmetadata',
  'durationchange',
  'ended',
] as const

function sendVideoData(force = false) {
  const media = currentMedia ?? document.querySelector<HTMLMediaElement>('video, audio')

  if (!media || !Number.isFinite(media.duration) || media.duration <= 0)
    return

  const payload = {
    currentTime: media.currentTime,
    duration: media.duration,
    paused: media.paused || media.ended,
    iFrameVideoData: {
      currTime: media.currentTime,
      dur: media.duration,
      paused: media.paused || media.ended,
    },
  }
  const payloadKey = JSON.stringify({
    currentTime: Math.floor(payload.currentTime),
    duration: Math.floor(payload.duration),
    paused: payload.paused,
  })

  if (!force && payloadKey === lastPayload)
    return

  lastPayload = payloadKey
  iframe.send(payload)
}

function removeMediaListeners(media: HTMLMediaElement) {
  for (const eventName of mediaEvents)
    media.removeEventListener(eventName, onMediaEvent)
}

function addMediaListeners(media: HTMLMediaElement) {
  for (const eventName of mediaEvents)
    media.addEventListener(eventName, onMediaEvent)
}

function onMediaEvent() {
  sendVideoData(true)
}

function syncMedia() {
  const media = document.querySelector<HTMLMediaElement>('video, audio')

  if (media === currentMedia)
    return

  if (currentMedia)
    removeMediaListeners(currentMedia)

  currentMedia = media
  lastPayload = ''

  if (currentMedia) {
    addMediaListeners(currentMedia)
    sendVideoData(true)
  }
}

const observer = new MutationObserver(() => {
  syncMedia()
})

if (document.documentElement) {
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })
}

syncMedia()
setInterval(() => {
  syncMedia()
  sendVideoData()
}, 1000)

iframe.on('UpdateData', () => {
  syncMedia()
  sendVideoData(true)
})
