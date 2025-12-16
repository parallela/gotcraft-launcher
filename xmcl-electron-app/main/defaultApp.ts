import defaultUrl from '@renderer/index.html'
import { InstalledAppManifest } from '@xmcl/runtime-api'
import { darkIcon, darkTray } from './utils/icons'
import { HAS_DEV_SERVER, HOST } from './constant'

const manifest: InstalledAppManifest = {
  name: 'KeyStone Launcher',
  description: 'The default launcher UI',
  url: HAS_DEV_SERVER ? defaultUrl : `http://${HOST}/index.html`,
  backgroundColor: '0x424242',
  minWidth: 800,
  minHeight: 400,
  vibrancy: false,
  iconSets: {
    icon: darkIcon,
    darkIcon: darkIcon,

    trayIcon: darkTray,
    darkTrayIcon: darkTray,

    dockIcon: darkIcon,
    darkDockIcon: darkIcon,
  },
  screenshots: [],
  ratio: false,
  iconUrls: {
    icon: darkIcon,
    darkIcon: darkIcon,

    trayIcon: darkTray,
    darkTrayIcon: darkTray,

    dockIcon: darkIcon,
    darkDockIcon: darkIcon,
  },
  defaultWidth: 800,
  defaultHeight: 600
}

export default manifest
