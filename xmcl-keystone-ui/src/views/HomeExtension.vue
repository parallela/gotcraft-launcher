<template>
  <div
    class="flex flex-1 flex-grow-0 flex-row items-center justify-start min-h-[52px]"
    :class="{
      'mb-3': !compact,
      'mb-2': compact,
    }"
  >
    <div
      class="flex flex-grow-0 flex-row items-center justify-center gap-1"
    >
      <AvatarItemList
        :items="items"
      />
    </div>
    <div class="flex-grow mr-2" />
  </div>
</template>

<script lang=ts setup>
import AvatarItemList from '@/components/AvatarItemList.vue'
import { useExtensionItemsGamePlay, useExtensionItemsVersion } from '@/composables/extensionItems'
import { kInstance } from '@/composables/instance'
import { kInstanceVersion } from '@/composables/instanceVersion'
import { kCompact } from '@/composables/scrollTop'
import { injection } from '@/util/inject'

const { instance, runtime: version } = injection(kInstance)
const { versionHeader } = injection(kInstanceVersion)

const compact = injection(kCompact)

const versionItems = useExtensionItemsVersion(instance, versionHeader)
const playDataItems = useExtensionItemsGamePlay(instance)
const items = computed(() => [...versionItems.value, ...playDataItems.value])

</script>
