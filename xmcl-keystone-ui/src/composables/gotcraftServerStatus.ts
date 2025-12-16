import { ref } from 'vue'

export interface GotCraftServerStatus {
  online: boolean
  ip: string
  port: number
  hostname?: string
  version?: string
  players: {
    online: number
    max: number
    list?: Array<{
      name: string
      uuid: string
    }>
  }
  motd: {
    raw: string[]
    clean: string[]
    html: string[]
  }
  icon?: string
  protocol?: {
    version: number
    name?: string
  }
}

const GOTCRAFT_SERVER = 'gotcraft.network'
const API_ENDPOINT = `https://api.mcsrvstat.us/3/${GOTCRAFT_SERVER}`

export function useGotCraftServerStatus() {
  const status = ref<GotCraftServerStatus | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStatus() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(API_ENDPOINT, {
        headers: {
          'User-Agent': 'GotCraft-Minecraft-Launcher/1.0',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.online) {
        status.value = {
          online: data.online,
          ip: data.ip || GOTCRAFT_SERVER,
          port: data.port || 25565,
          hostname: data.hostname,
          version: data.version,
          players: {
            online: data.players?.online || 0,
            max: data.players?.max || 0,
            list: data.players?.list || [],
          },
          motd: {
            raw: data.motd?.raw || [],
            clean: data.motd?.clean || [],
            html: data.motd?.html || [],
          },
          icon: data.icon,
          protocol: data.protocol,
        }
      } else {
        status.value = {
          online: false,
          ip: data.ip || GOTCRAFT_SERVER,
          port: data.port || 25565,
          players: {
            online: 0,
            max: 0,
          },
          motd: {
            raw: [],
            clean: [],
            html: [],
          },
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch server status'
      console.error('Failed to fetch GotCraft server status:', e)
      status.value = null
    } finally {
      loading.value = false
    }
  }

  function refresh() {
    return fetchStatus()
  }

  return {
    status,
    loading,
    error,
    refresh,
    serverAddress: GOTCRAFT_SERVER,
  }
}
