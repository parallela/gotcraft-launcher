# Modrinth Integration - Complete Documentation

## 🎉 Overview

Your launcher has a **complete, production-ready Modrinth integration** that works identically to the CurseForge integration. Users can search, browse, and install mods from Modrinth with full dependency resolution.

## 🔑 API Configuration

### Environment Variables

```env
MODRINTH_API_KEY=mrp_zjoXQkq4yrJyYTnl0QAODRrZvl0UwOSMU82rdeOskM8hFTjMg8qwU6Vim6uo
```

**Note:** While Modrinth doesn't require authentication for basic operations, having an API key provides:
- Higher rate limits
- Access to user-specific features
- Better reliability

## 📁 Architecture

### Backend (xmcl-runtime)

#### 1. Market Provider (`pluginMarketProvider.ts`)
- Initializes `ModrinthV2Client` with API key
- Handles file downloads to `.minecraft/versions/<VERSION>/mods/`
- Creates mods folder if it doesn't exist
- Verifies file integrity (SHA1/MD5 hashes)
- Task name: `installModrinthFile`

```typescript
const modrinth = new ModrinthV2Client({
  fetch: (...args) => app.fetch(...args),
  apiKey: process.env.MODRINTH_API_KEY || undefined
})
```

### Frontend (xmcl-keystone-ui)

#### 1. Search (`modrinthSearch.ts`)
- Searches via `https://api.modrinth.com/v2/search`
- Filters: game version, mod loaders, categories, environment
- Returns: project details with metadata

#### 2. Version Resolution (`modrinthVersions.ts`)
- Fetches compatible versions via `/v2/project/{id}/version`
- Filters by: Minecraft version, loaders (fabric/forge/quilt/neoforge)
- Auto-selects latest compatible version

#### 3. Dependency Resolution (`modrinth.ts`)
- `resolveModrinthDependencies()` function
- Recursively resolves required dependencies
- Handles optional/embedded dependencies

#### 4. Installer (`modrinthInstaller.ts`)
```typescript
// Install single mod
install({ versionId: 'abc123', icon: 'url' })

// Install with dependencies
installWithDependencies(versionId, loaders, icon, installed, deps)
```

## 🚀 How It Works (Complete Flow)

### 1. User Searches for Mods
```typescript
// Frontend: modrinthSearch.ts
const results = await clientModrinthV2.searchProjects({
  query: 'sodium',
  facets: [
    ['project_type:mod'],
    ['versions:1.21.10'],
    ['categories:fabric']
  ],
  limit: 20,
  index: 'relevance'
})
```

**API Endpoint:** `GET https://api.modrinth.com/v2/search`

**Response:**
```json
{
  "hits": [
    {
      "project_id": "AANobbMI",
      "title": "Sodium",
      "description": "Modern rendering engine...",
      "icon_url": "https://cdn.modrinth.com/.../icon.png",
      "downloads": 10000000,
      "follows": 50000,
      "versions": ["1.21.10", "1.21.9", ...],
      "categories": ["optimization", "fabric"]
    }
  ],
  "total_hits": 1
}
```

### 2. Get Project Details
```typescript
// Frontend: modrinthProject.ts
const project = await clientModrinthV2.getProject('AANobbMI')
```

**API Endpoint:** `GET https://api.modrinth.com/v2/project/AANobbMI`

### 3. Fetch Compatible Versions
```typescript
// Frontend: modrinthVersions.ts
const versions = await clientModrinthV2.getProjectVersions('AANobbMI', {
  gameVersions: ['1.21.10'],
  loaders: ['fabric'],
  featured: false
})
```

**API Endpoint:** `GET https://api.modrinth.com/v2/project/AANobbMI/version?loaders=fabric&game_versions=1.21.10`

**Response:**
```json
[
  {
    "id": "version123",
    "project_id": "AANobbMI",
    "name": "Sodium 0.5.8",
    "version_number": "0.5.8",
    "game_versions": ["1.21.10"],
    "loaders": ["fabric"],
    "version_type": "release",
    "files": [
      {
        "url": "https://cdn.modrinth.com/.../sodium-0.5.8.jar",
        "filename": "sodium-0.5.8.jar",
        "primary": true,
        "size": 1234567,
        "hashes": {
          "sha1": "abc123...",
          "sha512": "def456..."
        }
      }
    ],
    "dependencies": [
      {
        "project_id": "P7dR8mSH",
        "dependency_type": "required"
      }
    ]
  }
]
```

### 4. Resolve Dependencies
```typescript
// Frontend: util/modrinth.ts
const deps = await resolveModrinthDependencies(version)
// Returns: [[FabricAPI, 'required'], [OtherDep, 'optional'], ...]
```

### 5. Install Mod + Dependencies
```typescript
// Frontend: modrinthInstaller.ts
await installWithDependencies(
  versionId,        // 'version123'
  ['fabric'],       // loaders
  iconUrl,          // project icon
  installedMods,    // currently installed
  dependencies      // resolved deps
)
```

### 6. Backend Downloads Files
```typescript
// Backend: pluginMarketProvider.ts

// 1. Get version metadata
const modrinthVersions = await modrinth.getProjectVersionsById([versionId])

// 2. Create file info
const file = {
  path: 'mods/sodium-0.5.8.jar',
  hashes: { sha1: 'abc123...' },
  downloads: ['https://cdn.modrinth.com/.../sodium-0.5.8.jar'],
  size: 1234567,
  modrinth: {
    projectId: 'AANobbMI',
    versionId: 'version123'
  }
}

// 3. Download with integrity check
const task = new DownloadTask({
  url: file.downloads,
  destination: '/path/to/.minecraft/versions/1.21.10/mods/sodium-0.5.8.jar',
  validator: {
    algorithm: 'sha1',
    hash: 'abc123...'
  }
}).setName('installModrinthFile', {
  projectId: 'AANobbMI',
  versionId: 'version123',
  filename: 'sodium-0.5.8.jar'
})

await submit(task)
```

### 7. File Installation
- **Destination:** `.minecraft/versions/<CURRENT_VERSION>/mods/<filename>.jar`
- **Creates** mods folder if it doesn't exist
- **Verifies** SHA1/MD5 hash
- **Deduplicates** files already in cache
- **Links** cached files instead of re-downloading

## 🎯 Key Features

### ✅ Implemented Features

1. **Search & Browse**
   - Full-text search
   - Filter by: version, loader, category, environment
   - Sort by: relevance, downloads, follows, updated

2. **Version Resolution**
   - Automatically selects compatible versions
   - Filters by Minecraft version and mod loader
   - Prefers: release > beta > alpha

3. **Dependency Management**
   - Recursive dependency resolution
   - Auto-installs required dependencies
   - Handles optional dependencies
   - Detects circular dependencies

4. **Mod Loader Auto-Installation**
   - Detects if Fabric/Forge/Quilt/NeoForge is needed
   - Auto-installs if missing
   - Version compatibility check

5. **File Management**
   - SHA1/MD5 integrity verification
   - File deduplication
   - Cache management
   - Hard link optimization

6. **UI Components**
   - Mod search view
   - Project detail pages
   - Version selector
   - Dependency tree viewer
   - Installation progress

## 📂 File Structure

```
xmcl-runtime/
├── market/
│   ├── pluginMarketProvider.ts     ✅ Backend download logic
│   └── marketProvider.ts           ✅ Service interface

xmcl-keystone-ui/src/
├── composables/
│   ├── modrinth.ts                 ✅ Core Modrinth utilities
│   ├── modrinthSearch.ts           ✅ Search implementation
│   ├── modrinthVersions.ts         ✅ Version resolution
│   ├── modrinthInstaller.ts        ✅ Installation logic
│   ├── modrinthProject.ts          ✅ Project details
│   ├── modrinthDependencies.ts     ✅ Dependency resolution
│   └── modrinthAuthenticatedAPI.ts ✅ User auth features
├── views/
│   ├── Mod.vue                     ✅ Main mod browser
│   ├── StoreProjectModrinth.vue    ✅ Project detail page
│   └── ModItem.vue                 ✅ Mod list item
└── util/
    ├── clients.ts                  ✅ API clients
    └── modrinth.ts                 ✅ Helper functions
```

## 🔌 API Endpoints Used

| Endpoint | Purpose | Auth Required |
|----------|---------|---------------|
| `GET /v2/search` | Search projects | No |
| `GET /v2/project/{id}` | Get project details | No |
| `GET /v2/project/{id}/version` | Get versions | No |
| `GET /v2/version/{id}` | Get specific version | No |
| `GET /v2/versions` | Get multiple versions | No |
| `GET /v2/tag/category` | Get categories | No |
| `GET /v2/tag/loader` | Get loaders | No |
| `GET /v2/tag/game_version` | Get game versions | No |

## 🎮 User Experience

1. **Browse Mods:** Users navigate to the Mod section
2. **Search:** Type mod name (e.g., "sodium")
3. **Filter:** Select Minecraft version (1.21.10) and loader (Fabric)
4. **View Details:** Click on a mod to see description, screenshots, versions
5. **Install:** Click "Install" button
6. **Auto-Magic:** Launcher automatically:
   - Checks for required mod loader (Fabric)
   - Installs mod loader if missing
   - Resolves dependencies (e.g., Fabric API)
   - Downloads all required mods
   - Places them in correct folder
   - Verifies file integrity
7. **Launch:** User can now launch the game with the mod installed

## 🛠️ Troubleshooting

### Issue: "Failed to install mod"
**Cause:** Network error or invalid version
**Solution:** Check internet connection, try different version

### Issue: "Dependency conflict"
**Cause:** Incompatible mod versions
**Solution:** Update all mods to compatible versions

### Issue: "Mod loader missing"
**Cause:** No Fabric/Forge installed
**Solution:** Launcher auto-installs it (no user action needed)

## 🔧 Development

### Adding New Features

To add Modrinth-specific features:

1. **Frontend:** Add composables in `xmcl-keystone-ui/src/composables/`
2. **Backend:** Extend `pluginMarketProvider.ts`
3. **UI:** Add/modify Vue components in `views/`

### Testing Mod Installation

```bash
# 1. Start the launcher in dev mode
cd xmcl-electron-app
npm run dev

# 2. Navigate to Mods section
# 3. Search for "sodium"
# 4. Click Install
# 5. Check: ~/.minecraft/versions/<VERSION>/mods/
```

## 📊 Comparison: CurseForge vs Modrinth

| Feature | CurseForge | Modrinth | Status |
|---------|------------|----------|--------|
| Search | ✅ | ✅ | Identical |
| Version Resolution | ✅ | ✅ | Identical |
| Dependency Install | ✅ | ✅ | Identical |
| File Download | ✅ | ✅ | Identical |
| Hash Verification | ✅ | ✅ | Identical |
| Mod Loader Install | ✅ | ✅ | Identical |
| UI | ✅ | ✅ | Identical |

## ✨ Summary

Your launcher's Modrinth integration is **complete and production-ready**. It provides:

- ✅ Full mod search and browse
- ✅ Automatic version resolution
- ✅ Dependency management
- ✅ Mod loader auto-installation
- ✅ File integrity verification
- ✅ Identical UX to CurseForge

**No additional implementation needed** - everything works out of the box!

