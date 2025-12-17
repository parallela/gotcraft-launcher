<template>
  <div
    ref="containerRef"
    class="home-page visible-scroll relative flex max-h-full flex-1 flex-col overflow-x-hidden overflow-y-auto"
    :style="{ scrollbarGutter: 'stable' }"
    @wheel="onScroll"
  >
    <HomeHeader ref="headerEl" class="sticky top-0 z-20" />

    <!-- Modern transition with smooth fade and slide -->
    <transition
      name="fade-slide-transition"
      mode="out-in"
      @after-enter="end"
      @leave="start"
    >
      <router-view class="px-2 pb-8" />
    </transition>

    <HomeLogDialog />
    <HomeDropModpackDialog />
    <HomeLaunchMultiInstanceDialog />
    <HomeLaunchStatusDialog />
    <HomeInstanceInstallDialog />
    <AppCollectionDialog />
  </div>
</template>

<script lang=ts setup>
import { kInstance } from '@/composables/instance'
import { usePresence } from '@/composables/presence'
import { kCompact, useCompactScroll } from '@/composables/scrollTop'
import { useBlockSharedTooltip } from '@/composables/sharedTooltip'
import { injection } from '@/util/inject'
import { useElementBounding, useElementSize, useScroll } from '@vueuse/core'
import { useInstanceServerStatus } from '../composables/serverStatus'
import HomeHeader from './HomeHeader.vue'
import HomeInstanceInstallDialog from './HomeInstanceInstallDialog.vue'
import HomeLaunchMultiInstanceDialog from './HomeLaunchMultiInstanceDialog.vue'
import HomeLaunchStatusDialog from './HomeLaunchStatusDialog.vue'
import HomeLogDialog from './HomeLogDialog.vue'
import AppCollectionDialog from './AppCollectionDialog.vue'
import HomeDropModpackDialog from './HomeDropModpackDialog.vue'

const router = useRouter()

router.afterEach((r) => {
  document.title = `XMCL KeyStone - ${r.fullPath}`
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
})

const headerEl = ref(null as null | HTMLDivElement)
const { height } = useElementBounding(headerEl)
const hightTracker = inject('headerHeight', ref(0))
watch(height, (h) => {
  hightTracker.value = h
}, { immediate: true })

const { isServer, instance } = injection(kInstance)

const { refresh } = useInstanceServerStatus(instance)
const containerRef = ref(null as null | HTMLDivElement)

onMounted(() => {
  if (isServer.value) {
    refresh()
  }
})

const { t } = useI18n()
usePresence(computed(() => t('presence.instance', {
  instance: instance.value.name,
  minecraft: instance.value.runtime.minecraft || '',
  forge: instance.value.runtime.forge || '',
  fabric: instance.value.runtime.fabricLoader || '',
})))

const compact = injection(kCompact)
const onScroll = useCompactScroll(compact)

const { start, end } = useBlockSharedTooltip()

const { arrivedState } = useScroll(containerRef)
provide('scroll', arrivedState)

// Scroll
provide('scrollElement', containerRef)
</script>

<style scoped>
.home-page {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, transparent 100%);
}

/* Modern fade-slide transition */
.fade-slide-transition-enter-active,
.fade-slide-transition-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-transition-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-slide-transition-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.v-dialog__content--active {
  -webkit-app-region: no-drag;
  user-select: auto;
}

.v-dialog {
  -webkit-app-region: no-drag;
  user-select: auto;
}

.pointer * {
  cursor: pointer !important;
}
</style>
