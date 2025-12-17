<template>
  <v-card
    v-ripple
    v-context-menu="contextMenu"
    outlined
    color="#15202b"
    hoverable
    :disabled="disabled"
    hover
    class="select-none rounded-lg p-4 border border-[rgba(0,245,66,0.2)] hover:border-[rgba(0,245,66,0.4)] transition-all explore-card card-with-glow"
    @click="emit('click')"
  >
    <div class="flex gap-3">
      <!-- Mod Icon Image -->
      <img
        v-if="value.icon"
        :src="value.icon"
        class="hidden rounded-lg lg:block w-24 h-24 object-cover"
        style="image-rendering: auto;"
        :alt="value.title"
      />
      <div class="flex-1 flex flex-col">
        <div class="flex items-baseline gap-2">
          <h2 class="text-xl font-bold text-white">
            {{ value.localizedTitle || value.title }}
          </h2>
          <span class="text-sm text-gray-300">by {{ value.author }}</span>
          <div class="flex-grow" />
          <v-icon size="20" color="#1bd96a">
            $vuetify.icons.modrinth
          </v-icon>
        </div>
        <p class="text-sm text-gray-200 mt-1 line-clamp-2">
          {{ value.localizedDescription || value.description }}
        </p>
        <div class="mt-2 flex gap-3 text-xs text-gray-300">
          <span v-if="value.downloadCount" class="flex items-center gap-1">
            <v-icon small color="#1bd96a">download</v-icon>
            {{ value.downloadCount.toLocaleString() }}
          </span>
          <span v-if="value.followerCount" class="flex items-center gap-1">
            <v-icon small color="#1bd96a">favorite</v-icon>
            {{ value.followerCount.toLocaleString() }}
          </span>
          <span
            v-for="label of value.labels"
            :key="label.id"
            class="flex items-center gap-1"
          >
            <v-icon small color="#1bd96a">
              {{ label.icon }}
            </v-icon>
            {{ label.text }}
          </span>
        </div>
        <div
          v-if="value.tags && value.tags.length > 0"
          class="mt-2 flex flex-wrap gap-1"
          @click.stop.prevent
        >
          <CategoryChip
            v-for="tag of value.tags"
            :key="tag.id"
            small
            :item="tag"
            @click="emit('filter', tag.text)"
          />
        </div>
      </div>
    </div>
  </v-card>
</template>
<script lang="ts" setup>
import { ContextMenuItem } from '@/composables/contextMenu'
import { vContextMenu } from '@/directives/contextMenu'
import { injection } from '@/util/inject'
import CategoryChip, { CategoryChipProps } from './CategoryChip.vue'
import { kTheme } from '@/composables/theme'

defineProps<{
  contextMenu?: ContextMenuItem[]
  disabled?: boolean
  value: ExploreProject
}>()

export interface ExploreProject {
  id: string
  type: 'modrinth' | 'curseforge' | 'ftb'
  title: string
  icon_url: string
  description: string
  author: string
  labels: CategoryChipProps[]
  tags: CategoryChipProps[]
  gallery: string[]
  localizedTitle?: string
  localizedDescription?: string
}

const emit = defineEmits(['filter', 'click', 'search', 'browse'])

const { cardColor } = injection(kTheme)
</script>

<style scoped>
.card-with-glow {
  position: relative;
  border: 1px solid rgba(0, 245, 66, 0.3) !important;
  box-shadow: 0 0 10px rgba(0, 245, 66, 0.15);
  transition: all 0.3s ease;
}

.card-with-glow:hover {
  border-color: rgba(0, 245, 66, 0.5) !important;
  box-shadow: 0 0 15px rgba(0, 245, 66, 0.3), 0 0 25px rgba(0, 245, 66, 0.15);
}
</style>
