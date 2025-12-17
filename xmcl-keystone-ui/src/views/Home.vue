<template>
  <div
    ref="scrollElement"
    class="select-none"
  >
    <HomeCriticalError />

    <!-- Launch Button Section - More compact and modern -->
    <div class="flex flex-row items-center justify-center gap-3 mb-4 mt-3 px-3">
      <HomeLaunchButtonStatus :active="active" />
      <HomeLaunchButton
        :compact="compact"
        @mouseenter="active = true"
        @mouseleave="active = false"
      />
    </div>

    <GotCraftServerCard class="mx-3 mb-3" />

    <!-- Top Buyers and Voters Grid - Compact spacing -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mx-3 mb-3">
      <TopBuyersCard />
      <TopVotersCard />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDialog } from '@/composables/dialog'
import { useGlobalDrop } from '@/composables/dropHandler'
import { kInstance } from '@/composables/instance'
import { kUpstream } from '@/composables/instanceUpdate'
import { kCompact } from '@/composables/scrollTop'
import { useTutorial } from '@/composables/tutorial'
import { useInFocusMode } from '@/composables/uiLayout'
import { injection } from '@/util/inject'
import type { DriveStep } from 'driver.js'
import HomeCriticalError from './HomeCriticalError.vue'
import HomeLaunchButton from './HomeLaunchButton.vue'
import HomeLaunchButtonStatus from './HomeLaunchButtonStatus.vue'
import GotCraftServerCard from '@/components/GotCraftServerCard.vue'
import TopBuyersCard from '@/components/TopBuyersCard.vue'
import TopVotersCard from '@/components/TopVotersCard.vue'

const isFocus = useInFocusMode()
const { instance } = injection(kInstance)
provide(kUpstream, computed(() => ({ upstream: instance.value.upstream, minecraft: instance.value.runtime.minecraft })))

const compact = injection(kCompact)
onMounted(() => {
  compact.value = false
})

const active = ref(false)

const { show } = useDialog('HomeDropModpackDialog')

useGlobalDrop({
  onDrop: async (e) => {
    const files = e.files
    const file = files?.[0]
    if (file) {
      const ext = file.name.split('.').pop()
      if (ext === 'zip' || ext === 'mrpack') {
        show(file.path)
        return
      }
    }
  },
})

const scrollElement = ref(null as HTMLElement | null)
provide('scrollElement', scrollElement)

const { t } = useI18n()
useTutorial(computed(() => {
  const steps: DriveStep[] = [
    { element: '#user-avatar', popover: { title: t('userAccount.add'), description: t('tutorial.userAccountDescription') } },
    { element: '#create-instance-button', popover: { title: t('instances.add'), description: t('tutorial.instanceAddDescription') } },
    { element: '#launch-button', popover: { title: t('launch.launch'), description: t('tutorial.launchDescription') } },
    { element: '#feedback-button', popover: { title: t('feedback.name'), description: t('tutorial.feedbackDescription') } },
  ]
  return steps
}))
</script>
