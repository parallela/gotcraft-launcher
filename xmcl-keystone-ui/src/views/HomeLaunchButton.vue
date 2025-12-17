<template>
  <div class="flex flex-grow-0 gap-[2px]">
    <v-badge
      left
      color="primary"
      bordered
      overlap
      :value="count !== 0"
    >
      <template #badge>
        <span v-ripple>{{ count }}</span>
      </template>
      <v-btn
        id="launch-button"
        :disabled="isValidating"
        :color="color"
        :x-large="!compact"
        :large="compact"
        :class="[
          'px-10 font-semibold transition-all btn-left',
          compact ? 'text-base' : 'text-lg'
        ]"
        elevation="3"
        @click="onClick()"
        @mouseenter="emit('mouseenter')"
        @mouseleave="emit('mouseleave')"
      >
        <v-icon
          v-if="leftIcon"
          class="-ml-1 pr-2"
          :size="compact ? 20 : 24"
        >
          {{ leftIcon }}
        </v-icon>
        {{ text }}
        <v-icon
          v-if="icon"
          right
          class="pl-2"
          :size="compact ? 20 : 24"
        >
          {{ icon }}
        </v-icon>
      </v-btn>
    </v-badge>
    <v-menu
      v-model="isShown"
      offset-y
      left
      :top="top"
      transition="scroll-y-transition"
    >
      <template #activator="{ on }">
        <v-btn
          :disabled="isValidating"
          class="min-w-unset! max-w-5! px-0! btn-right"
          :color="color"
          :x-large="!compact"
          :large="compact"
          elevation="3"
          v-on="on"
        >
          <v-icon>
            arrow_drop_down
          </v-icon>
        </v-btn>
      </template>
      <HomeLaunchButtonMenuList />
    </v-menu>
  </div>
</template>

<script lang="ts" setup>
import { kLaunchButton } from '@/composables/launchButton'
import { injection } from '@/util/inject'
import HomeLaunchButtonMenuList from './HomeLaunchButtonMenuList.vue'
import { kInstances } from '@/composables/instances'

defineProps<{ compact?: boolean; top?: boolean }>()

const emit = defineEmits(['mouseenter', 'mouseleave'])
const { isValidating } = injection(kInstances)

const { onClick, color, icon, text, loading, leftIcon, count } = injection(kLaunchButton)

const isShown = ref(false)
</script>

<style scoped>
.btn-right {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-left {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  text-transform: none;
  letter-spacing: 0.025em;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-left:hover,
.btn-right:hover {
  transform: translateY(-1px);
}

@media (max-width: 850px) {
  .btn-left {
    max-width: 196px;
  }
}
</style>
