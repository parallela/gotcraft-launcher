/* eslint-disable no-template-curly-in-string */
import { config as dotenv } from 'dotenv'
import type { Configuration } from 'electron-builder'

dotenv()

export const config = {
  productName: 'GotLauncher',
  appId: 'xmcl',
  directories: {
    output: 'build/output',
    buildResources: 'build',
    app: '.',
  },
  protocols: {
    name: 'XMCL',
    schemes: ['xmcl'],
  },
  // assign publish for auto-updater
  // set this to your own repo!
  publish: [{
    provider: 'github',
    owner: 'voxelum',
    repo: 'x-minecraft-launcher',
  }],
  files: [{
    from: 'dist',
    to: '.',
    filter: ['**/*.js', '**/*.ico', '**/*.png', '**/*.webp', '**/*.svg', '*.node', '**/*.html', '**/*.css', '**/*.woff2'],
  }, {
    from: '.',
    to: '.',
    filter: 'package.json',
  }],
  artifactName: 'gtlauncher-${version}-${platform}-${arch}.${ext}',
  appx: {
    displayName: 'GotLauncher',
    applicationId: 'xmcl',
    identityName: 'xmcl',
    backgroundColor: 'transparent',
    publisher: process.env.PUBLISHER,
    publisherDisplayName: 'CI010',
    setBuildNumber: true,
  },
  dmg: {
    artifactName: 'gtlauncher-${version}-${arch}.${ext}',
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications',
      },
      {
        x: 130,
        y: 150,
        type: 'file',
      },
    ],
  },
  mac: {
    icon: 'icons/gotlogo2.png',
    darkModeSupport: true,
    target: [
      {
        target: 'dmg',
        arch: ['arm64', 'x64'],
      },
    ],
    extendInfo: {
      NSMicrophoneUsageDescription: 'A Minecraft mod wants to access your microphone.',
      NSCameraUsageDescription: 'Please give us access to your camera',
      'com.apple.security.device.audio-input': true,
      'com.apple.security.device.camera': true,
    },
  },
  win: {
    // For code signing: set WIN_CSC_LINK and WIN_CSC_KEY_PASS environment variables
    // FREE option: Apply for SignPath.io (free for open-source projects)
    // See: https://about.signpath.io/product/open-source
    certificateFile: process.env.WIN_CSC_LINK || undefined,
    certificatePassword: process.env.WIN_CSC_KEY_PASS || undefined,
    icon: 'icons/dark.ico',
    target: [
      {
        target: 'nsis',
        arch: [
          'x64',
        ],
      },
    ],
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    perMachine: false,
  },
  linux: {
    executableName: 'gtlauncher',
    desktop: {
      MimeType: 'x-scheme-handler/xmcl',
      StartupWMClass: 'xmcl',
    },
    category: 'Game',
    icon: 'icons/gotlogo2.png',
    artifactName: 'gtlauncher-${version}-${arch}.${ext}',
    target: [
      { target: 'AppImage', arch: ['x64'] },
    ],
  },
  snap: {
    publish: [
      'github',
    ],
  },
} satisfies Configuration
