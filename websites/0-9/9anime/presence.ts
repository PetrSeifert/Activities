import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1264754447276310599',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/9anime/assets/logo.png',
}

let videoData = {
  currentTime: 0,
  duration: 0,
  paused: true,
}

async function updatePresence() {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
  }
  const usePresenceName = await presence.getSetting<boolean>('usePresenceName')
  const { href, pathname, search } = document.location

  switch (true) {
    case pathname === '/':
    case pathname === '/home':
      presenceData.details = 'Viewing Homepage'
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname === '/search':
      presenceData.details = `Viewing results: ${search
        .split('=')[1]
        ?.replace(/\+/g, ' ')}`
      presenceData.smallImageKey = Assets.Search
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname.includes('/genre/'):
      presenceData.details = `Viewing genre: ${pathname.split('/')[2]}`
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname.includes('/watch/'): {
      const title = getAnimeTitle()
      const coverArt = document
        .querySelector<HTMLImageElement>('.anime-poster img')
        ?.src

      const episodeLabel = getEpisodeLabel()
      const isVideoReady = videoData.duration > 0

      presenceData.type = ActivityType.Watching
      presenceData.largeImageKey = coverArt ?? ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: 'Watch Anime',
          url: href,
        },
      ]

      if (isVideoReady) {
        presenceData.smallImageKey = videoData.paused
          ? Assets.Pause
          : Assets.Play
        presenceData.smallImageText = videoData.paused ? 'Paused' : 'Playing'
        presenceData.largeImageText = episodeLabel

        if (!videoData.paused)
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(videoData.currentTime, videoData.duration)
      }

      if (usePresenceName) {
        presenceData.name = title
        presenceData.details = title

        if (episodeLabel)
          presenceData.state = episodeLabel
      }
      else {
        presenceData.details = title

        if (episodeLabel)
          presenceData.state = episodeLabel
      }
      break
    }
    case pathname.includes('/az-list'):
      presenceData.details = `Viewing AZ List: ${pathname.split('/')[2]}`
      presenceData.smallImageKey = Assets.Search
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname === '/movie':
      presenceData.details = 'Browsing movies...'
      presenceData.smallImageKey = Assets.Search
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname === '/tv':
      presenceData.details = 'Browsing TV series...'
      presenceData.smallImageKey = Assets.Search
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname === '/ova':
      presenceData.details = 'Browsing OVAs...'
      presenceData.smallImageKey = Assets.Search
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname === '/ona':
      presenceData.details = 'Browsing ONAs...'
      presenceData.smallImageKey = Assets.Search
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname === '/special':
      presenceData.details = 'Browsing specials...'
      presenceData.smallImageKey = Assets.Search
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname === '/recently-updated':
      presenceData.details = 'Browsing recently updated anime...'
      presenceData.smallImageKey = Assets.Search
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname === '/recently-added':
      presenceData.details = 'Browsing recently added anime...'
      presenceData.smallImageKey = Assets.Search
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname === '/ongoing':
      presenceData.details = 'Browsing ongoing anime...'
      presenceData.smallImageKey = Assets.Search
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathname === '/upcoming':
      presenceData.details = 'Viewing upcoming anime...'
      presenceData.smallImageKey = Assets.Search
      presenceData.startTimestamp = browsingTimestamp
      break
    default:
      presenceData.details = 'Browsing 9anime...'
      presenceData.startTimestamp = browsingTimestamp
      break
  }

  presence.setActivity(presenceData)
}

presence.on(
  'iFrameData',
  (data: {
    currentTime?: number
    duration?: number
    paused?: boolean
    iFrameVideoData?: {
      currTime: number
      dur: number
      paused: boolean
    }
  }) => {
    if (data.iFrameVideoData) {
      videoData = {
        currentTime: data.iFrameVideoData.currTime,
        duration: data.iFrameVideoData.dur,
        paused: data.iFrameVideoData.paused,
      }
    }
    else if (typeof data.duration === 'number') {
      videoData = {
        currentTime: data.currentTime ?? 0,
        duration: data.duration,
        paused: data.paused ?? true,
      }
    }
    else {
      return
    }

    void updatePresence()
  },
)

function getAnimeTitle() {
  return document
    .querySelector<HTMLElement>('.film-infor .film-name.dynamic-name')
    ?.textContent
    ?.trim()
    || document.title
      .replace(/^Watch /, '')
      .replace(/ online free on 9anime$/, '')
      .trim()
}

function getEpisodeNumber() {
  return document
    .querySelector<HTMLElement>('.ep-item.active')
    ?.dataset
    .number
    || document
      .querySelector<HTMLElement>('.ep-item.active .order')
      ?.textContent
      ?.trim()
}

function getEpisodeLabel() {
  const rawEpisodeLabel = document
    .querySelector<HTMLElement>('.ep-item.active')
    ?.textContent
    ?.replace(/\s+/g, ' ')
    ?.trim()
  const episodeNumber = getEpisodeNumber()

  if (rawEpisodeLabel && !/^ep$/i.test(rawEpisodeLabel))
    return rawEpisodeLabel.startsWith('Episode ') ? rawEpisodeLabel : `Episode ${rawEpisodeLabel}`

  if (episodeNumber)
    return `Episode ${episodeNumber}`
}

presence.on('UpdateData', updatePresence)
