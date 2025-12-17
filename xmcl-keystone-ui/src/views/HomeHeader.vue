<template>
  <div
    class="header sticky max-w-full select-none transition-all duration-300 ease-out"
    :class="{
      compact,
    }"
    @transitionstart="onTransitionStart"
    @transitionend="onTransitionEnd"
    @transitioncancel="onTransitionEnd"
    @wheel.stop
  >
    <div
      class="flex flex-col header-content max-w-7xl mx-auto"
      :style="{
        opacity: dragover ? 0 : '',
      }"
    >
      <div
        class="flex items-center gap-3 transition-all duration-300"
        :class="compact ? 'px-4 py-2' : 'px-6 py-4'"
      >
        <!-- Instance name with modern styling -->
        <h1
          :style="{
            fontSize: headerFontSize
          }"
          class="font-bold overflow-hidden overflow-ellipsis whitespace-nowrap transition-all duration-300 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
        >{{ name || `Minecraft ${version.minecraft}` }}</h1>

        <router-view name="route" />
        <div class="flex-grow" />

        <!-- Compact play button with modern styling -->
        <transition name="scale-fade-transition">
          <v-btn
            v-if="compact"
            id="launch-button"
            color="primary"
            elevation="2"
            rounded
            class="compact-play-btn font-semibold"
            @click="onLaunchClick"
          >
            <v-icon left size="20">play_arrow</v-icon>
            <span class="text-sm">Play</span>
          </v-btn>
        </transition>

        <transition
          name="slide-x-transition"
          mode="out-in"
        >
          <router-view class="flex-shrink-0" name="actions" />
        </transition>
      </div>

      <transition
        name="slide-y-reverse-transition"
        mode="out-in"
      >
        <router-view
          name="extensions"
          class="transition-all duration-300"
          :class="{
            'px-6 mt-4 pb-3': !compact,
            'px-4 mt-2 pb-2': compact,
          }"
        />
      </transition>
    </div>

    <!-- Drag overlay with modern design -->
    <div
      v-if="dragover"
      class="absolute inset-0 flex p-5"
      @dragenter="overcount++"
      @dragleave="overcount--"
      @drop="overcount = 0; onDropModpack($event)"
    >
      <Hint
        :text="t('modpack.dropHint')"
        icon="save_alt"
        class="rounded-xl transition-all duration-200"
        :class="{
          dragover,
          yellow: overcount > 0,
          'darken-2': overcount > 0,
        }"
        :style="{
          transform: overcount > 0 ? 'scale(1.02)' : 'scale(0.98)'
        }"
      />
    </div>
  </div>
</template>

<script lang=ts setup>
import Hint from '@/components/Hint.vue'
import { useDialog } from '@/composables/dialog'
import { kDropHandler } from '@/composables/dropHandler'
import { kInstance } from '@/composables/instance'
import { AddInstanceDialogKey } from '@/composables/instanceTemplates'
import { kCompact } from '@/composables/scrollTop'
import { kTheme } from '@/composables/theme'
import { useInFocusMode } from '@/composables/uiLayout'
import { injection } from '@/util/inject'

const { name, runtime: version } = injection(kInstance)
const isInFocusMode = useInFocusMode()
const { blurAppBar } = injection(kTheme)
const { t } = useI18n()
const router = useRouter()

const transitioning = ref(false)
provide('transitioning', transitioning)

const onTransitionStart = (e: TransitionEvent) => {
  if (e.propertyName !== 'transform') return
  transitioning.value = true
}
const onTransitionEnd = (e: TransitionEvent) => {
  if (e.propertyName !== 'transform') return
  transitioning.value = false
}

const compact = injection(kCompact)
const headerFontSize = computed(() => {
  if (compact.value) {
    return '1.5rem'
  }
  if (name.value && name.value.length > 30) {
    return '1.875rem'
  }
  return '2.25rem'
})

const { dragover } = injection(kDropHandler)
const { show } = useDialog(AddInstanceDialogKey)
const onDropModpack = (e: DragEvent) => {
  e.preventDefault()
  const file = e.dataTransfer?.files.item(0)
  if (file) {
    show({
      format: 'modpack',
      path: file.path,
    })
  }
}

const overcount = ref(0)

// Launch button handler
const onLaunchClick = () => {
  // Trigger the launch button that's already on the page
  const launchBtn = document.getElementById('launch-button')
  if (launchBtn) {
    launchBtn.click()
  }
}
</script>

<style scoped>
.header {
  position: relative;
  backdrop-filter: blur(0px);
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header.compact {
  backdrop-filter: blur(16px);
  background: rgba(0, 0, 0, 0.75);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(0, 245, 66, 0.1);
}

.dark .header.compact {
  background: rgba(15, 23, 42, 0.85);
  border-bottom-color: rgba(0, 245, 66, 0.15);
}

.compact-play-btn {
  padding: 0.5rem 1.5rem !important;
  text-transform: none;
  letter-spacing: 0.025em;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.compact-play-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 245, 66, 0.3);
}

/* Scale fade transition for play button */
.scale-fade-transition-enter-active,
.scale-fade-transition-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-fade-transition-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.scale-fade-transition-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Modern gradient text */
h1 {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
