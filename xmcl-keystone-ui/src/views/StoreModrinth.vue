<template>
  <div ref="container" class="w-full overflow-auto bg-mc-store">
    <v-progress-linear class="absolute left-0 top-0 z-10 m-0 p-0"
      :active="isModrinthSearching" height="3" :indeterminate="true" />

    <!-- Search and Filters - Compact Header -->
    <div class="sticky top-0 z-10 bg-mc-sidebar px-4 py-2 border-b-2 border-mc-emerald/20 shadow-lg">
      <div class="flex gap-2 items-center flex-wrap">
        <!-- Modrinth Icon -->
        <v-icon size="24" color="#1bd96a" class="mr-1">$vuetify.icons.modrinth</v-icon>

        <!-- Search Field -->
        <v-text-field
          id="search-text-field"
          ref="searchTextField"
          v-model="keyword"
          color="#1bd96a"
          class="flex-1 min-w-[250px] store-input"
          append-icon="search"
          dense
          solo
          hide-details
          clearable
          :placeholder="t('modrinth.searchText')"
          @click:clear="query = ''"
          @keydown.enter="query = keyword"
          @click:append="query = keyword"
        />

        <!-- Game Version Selector -->
        <v-select
          v-model="gameVersion"
          :items="gameVersionItems"
          :label="t('minecraftVersion.name')"
          color="#1bd96a"
          dense
          solo
          hide-details
          clearable
          class="version-select store-input"
          style="max-width: 160px;"
        />

        <!-- Mod Loader Selector -->
        <v-select
          v-model="selectedLoader"
          :items="loaderItems"
          :label="t('modrinth.modLoaders.name')"
          color="#1bd96a"
          dense
          solo
          hide-details
          clearable
          class="loader-select store-input"
          style="max-width: 140px;"
        />

        <!-- Sort Selector -->
        <v-select
          v-model="sort"
          :items="sortItems"
          :label="t('modrinth.sort.title')"
          color="#1bd96a"
          dense
          solo
          hide-details
          class="sort-select store-input"
          style="max-width: 160px;"
        />
      </div>
    </div>

    <div class="main px-3 py-2">
      <!-- Search Results -->
      <div class="content">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <v-icon size="20" color="#1bd96a">explore</v-icon>
            <span class="text-base font-semibold text-white">{{ t('mod.name', 2) }}</span>
            <span v-if="modrinthTotal > 0" class="text-sm text-gray-300 font-medium">
              ({{ modrinthTotal.toLocaleString() }})
            </span>
          </div>
        </div>

        <div v-if="!searchError && items.length > 0" id="search-result" class="relative flex flex-col gap-2">
          <StoreExploreCard
            v-for="mod in items"
            :key="mod.id"
            v-ripple
            :disabled="false"
            :value="mod"
            class="cursor-pointer hover:shadow-lg transition-shadow"
            @mouseenter.native="onMouseEnter($event, mod)"
            @mouseleave.native="onMouseLeave(mod)"
            @click="enterModrinth(mod.id)"
          />

          <div v-if="pageCount > 1" class="flex justify-center my-4">
            <v-pagination
              v-model="page"
              :length="pageCount"
              color="#1bd96a"
              :disabled="isModrinthSearching"
              :total-visible="9"
              circle
            />
          </div>
        </div>
        <Hint
          v-else-if="!isModrinthSearching && items.length === 0"
          icon="search_off"
          :size="64"
          :text="t('modSearch.noModsFound')"
        />
        <div v-else-if="isModrinthSearching" class="flex items-center justify-center py-12">
          <v-progress-circular indeterminate color="#1bd96a" size="48" />
        </div>
      </div>

      <!-- Categories Sidebar - Compact -->
      <div class="category-sidebar">
        <div class="sticky top-[60px]">
          <div class="bg-[#1a2332] rounded-lg p-3 shadow-lg">
            <div class="flex items-center gap-2 mb-3">
              <v-icon size="18" color="#1bd96a">category</v-icon>
              <span class="text-sm font-semibold">{{ t('modrinth.categories.name') }}</span>
            </div>

            <div v-if="!refreshingTag && modrinthGroups.length > 0" class="space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto category-scroll">
              <div v-for="group in modrinthGroups" :key="group.name" class="mb-2">
                <div v-for="cat in group.categories" :key="cat.value" class="mb-1">
                  <v-chip
                    small
                    :color="isSelected(cat) ? '#1bd96a' : 'transparent'"
                    :text-color="isSelected(cat) ? 'black' : 'white'"
                    class="category-chip w-full justify-start"
                    @click="onSelect(cat)"
                  >
                    <v-icon v-if="cat.icon" size="14" left>{{ cat.icon }}</v-icon>
                    <span class="text-xs">{{ cat.text }}</span>
                  </v-chip>
                </div>
              </div>
            </div>
            <div v-else-if="refreshingTag" class="flex justify-center py-4">
              <v-progress-circular indeterminate color="#1bd96a" size="24" />
            </div>
            <div v-else class="text-xs text-gray-400 text-center py-4">
              {{ t('modrinth.categories.name') }}
            </div>

            <!-- Selected Filters -->
            <div v-if="selected.length > 0" class="mt-3 pt-3 border-t border-white/10">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-400">{{ t('modFilter.source') }}</span>
                <v-btn x-small text color="#1bd96a" @click="clearFilters">
                  {{ t('modFilter.clear') }}
                </v-btn>
              </div>
              <div class="flex flex-wrap gap-1">
                <v-chip
                  v-for="sel in selected"
                  :key="`${sel.type}-${sel.value}`"
                  x-small
                  close
                  color="#1bd96a"
                  text-color="black"
                  @click:close="onSelect(sel)"
                >
                  {{ sel.text }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CategoryChipProps } from '@/components/CategoryChip.vue'
import Hint from '@/components/Hint.vue'
import StoreExploreCard, { ExploreProject } from '@/components/StoreExploreCard.vue'
import StoreExploreCategories, { ExploreCategoryGroup } from '@/components/StoreExploreCategories.vue'
import { getFacatsText, kModrinthTags } from '@/composables/modrinth'
import { useQuery, useQueryNumber, useQueryStringArray } from '@/composables/query'
import { useTextFieldBehavior } from '@/composables/textfieldBehavior'
import { clientModrinthV2 } from '@/util/clients'
import { injection } from '@/util/inject'
import { SearchResultHit } from '@xmcl/modrinth'
import { kInstance } from '@/composables/instance'

const { push } = useRouter()
const { t } = useI18n()

function ensureQuery(query: Record<string, string | (string | null)[] | null | undefined>) {
  query.page = '1'
}

const query = useQuery('query', ensureQuery)
const gameVersion = useQuery('gameVersion', ensureQuery)
const selectedLoader = useQuery('loader', ensureQuery)
const sort = useQuery('sort', (q) => { q.page = '1' })
const page = useQueryNumber('page', 1)

const pageSize = 20
const keyword = ref(query.value)

// Get current instance version
const { instance } = injection(kInstance)
watch(instance, (inst) => {
  if (inst && !gameVersion.value) {
    gameVersion.value = inst.runtime.minecraft
  }
}, { immediate: true })

// Modrinth Tags
const { categories: modrinthCategories, gameVersions, modLoaders: loaders, refreshing: refreshingTag, error: tagError } = injection(kModrinthTags)

// Game Version Items
const gameVersionItems = computed(() => {
  const versions = gameVersions.value || []
  return versions
    .filter(v => v.version_type === 'release')
    .map(v => ({
      text: v.version,
      value: v.version,
    }))
})

// Loader Items
const loaderItems = computed(() => {
  const loadersList = loaders.value || []
  return loadersList.map(l => ({
    text: l.name.charAt(0).toUpperCase() + l.name.slice(1),
    value: l.name,
  }))
})

// Sort Items
const sortItems = computed(() => [
  { text: t('modrinth.sort.relevance'), value: 'relevance' },
  { text: t('modrinth.sort.downloads'), value: 'downloads' },
  { text: t('modrinth.sort.follows'), value: 'follows' },
  { text: t('modrinth.sort.newest'), value: 'newest' },
  { text: t('modrinth.sort.updated'), value: 'updated' },
])

// Search
const isModrinthSearching = ref(false)
const searchError = ref<any>(null)
const modrinthResult = ref<SearchResultHit[]>([])
const modrinthTotal = ref(0)

// Initialize selected categories from query
const selected = ref<CategoryChipProps[]>([])

watch([query, gameVersion, selectedLoader, sort, page, selected], async () => {
  isModrinthSearching.value = true
  searchError.value = null
  try {
    // Build facets array properly
    const facets: string[][] = [['project_type:mod']]

    if (gameVersion.value) {
      facets.push([`versions:${gameVersion.value}`])
    }

    if (selectedLoader.value) {
      facets.push([`categories:${selectedLoader.value}`])
    }

    // Add selected category facets
    const categoryFacets = selected.value
      .filter(s => s.type === 'category')
      .map(s => `categories:${s.value}`)

    if (categoryFacets.length > 0) {
      facets.push(categoryFacets)
    }

    const result = await clientModrinthV2.searchProjects({
      query: query.value || undefined,
      facets: JSON.stringify(facets),
      index: sort.value || 'relevance',
      limit: pageSize,
      offset: (page.value - 1) * pageSize,
    })

    modrinthResult.value = result.hits
    modrinthTotal.value = result.total_hits
  } catch (e) {
    console.error('Modrinth search error:', e)
    searchError.value = e
  } finally {
    isModrinthSearching.value = false
  }
}, { immediate: true, deep: true })

const items = computed(() => {
  return modrinthResult.value.map(item => ({
    id: item.project_id,
    type: 'modrinth' as const,
    title: item.title,
    description: item.description,
    icon: item.icon_url,
    author: item.author,
    downloadCount: item.downloads,
    followerCount: item.follows,
    gallery: item.gallery,
    modrinth: item,
  } as ExploreProject))
})

const pageCount = computed(() => Math.ceil(modrinthTotal.value / pageSize))

// Categories
const modrinthGroups = computed(() => {
  const groups: ExploreCategoryGroup[] = []

  // Categories
  if (modrinthCategories.value.length > 0) {
    groups.push({
      name: t('modrinth.categories.name'),
      categories: modrinthCategories.value
        .filter(c => c.project_type === 'mod')
        .sort((a, b) => {
          const aText = t(`modrinth.categories.${a.name}`)
          const bText = t(`modrinth.categories.${b.name}`)
          return aText.localeCompare(bText)
        })
        .map(c => ({
          value: c.name,
          text: t(`modrinth.categories.${c.name}`),
          icon: c.icon,
          type: 'category' as const,
        })),
    })
  }

  return groups
})

const isSelected = (cat: CategoryChipProps) => {
  return selected.value.some(c => c.value === cat.value && c.type === cat.type)
}

const onSelect = (cat: CategoryChipProps) => {
  const index = selected.value.findIndex(c => c.value === cat.value && c.type === cat.type)
  if (index >= 0) {
    selected.value.splice(index, 1)
  } else {
    selected.value.push(cat)
  }
  page.value = 1
}

const clearFilters = () => {
  selected.value = []
  page.value = 1
}

const hovered = ref<ExploreProject | undefined>(undefined)

const onMouseEnter = (event: MouseEvent, mod: ExploreProject) => {
  hovered.value = mod
}

const onMouseLeave = (mod: ExploreProject) => {
  if (hovered.value === mod) {
    hovered.value = undefined
  }
}

const enterModrinth = (id: string) => {
  push(`/store/modrinth/${id}`)
}

// Text field behavior
const searchTextField = useTextFieldBehavior()
</script>

<style scoped>
.bg-mc-store {
  --tw-bg-opacity: 1;
  background-color: rgb(16 24 33 / var(--tw-bg-opacity, 1));
}

.bg-mc-sidebar {
  --tw-bg-opacity: 1;
  background-color: rgb(21 32 43 / var(--tw-bg-opacity, 1));
}

.border-mc-emerald\/20 {
  border-color: rgba(0, 245, 66, 0.2);
}

/* Store inputs styling - match app theme */
.store-input >>> .v-input__control {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.store-input >>> .v-input__slot {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.store-input >>> input {
  color: #ffffff !important;
}

.store-input >>> .v-select__selection {
  color: #ffffff !important;
}

.store-input >>> .v-label {
  color: rgba(255, 255, 255, 0.7) !important;
}

.store-input >>> .v-icon {
  color: rgba(255, 255, 255, 0.7) !important;
}

.main {
  display: grid;
  gap: 0.75rem;
  padding-top: 0.5rem;
  grid-template-columns: 1fr;
  grid-template-areas:
    "content"
    "category";
}

.content {
  grid-area: content;
  min-height: 300px;
}

.category-sidebar {
  grid-area: category;
}

@media (min-width: 1024px) {
  .main {
    grid-template-columns: 1fr 280px;
    grid-template-areas: "content category";
    gap: 1rem;
  }
}

.version-select, .loader-select, .sort-select {
  min-width: 120px;
}

.category-chip {
  cursor: pointer;
  transition: all 0.2s;
}

.category-chip:hover {
  background-color: rgba(27, 217, 106, 0.2) !important;
  transform: translateX(2px);
}

.category-scroll::-webkit-scrollbar {
  width: 6px;
}

.category-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.category-scroll::-webkit-scrollbar-thumb {
  background: #1bd96a;
  border-radius: 3px;
}

.category-scroll::-webkit-scrollbar-thumb:hover {
  background: #15a855;
}
</style>
