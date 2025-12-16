import { join } from 'path'

const darkIcoRelative = require('../../icons/favicon.ico')
const darkIconRelative = require('../../icons/gotlogo2.png')
const darkTrayRelative = require('../../icons/gotlogo2.png')
const lightIcoRelative = require('../../icons/favicon.ico')
const lightIconRelative = require('../../icons/gotlogo2.png')
const lightTrayRelative = require('../../icons/gotlogo2.png')

// Resolve to absolute paths
export const darkIco = join(__dirname, darkIcoRelative)
export const darkIcon = join(__dirname, darkIconRelative)
export const darkTray = join(__dirname, darkTrayRelative)
export const lightIco = join(__dirname, lightIcoRelative)
export const lightIcon = join(__dirname, lightIconRelative)
export const lightTray = join(__dirname, lightTrayRelative)
