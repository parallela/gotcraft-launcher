<template>
  <v-list
    two-line
    subheader
    style="background: transparent; width: 100%"
  >
    <div class="mx-4 grid grid-cols-4 gap-4">
      <v-select
        v-model="data.java"
        outlined
        class="java-select col-span-2"
        :label="t('java.location')"
        :placeholder="t('java.allocatedLong')"
        :items="javaItems"
        :menu-props="{ auto: true, overflowY: true }"
        hide-details
        required
      />
      <v-text-field
        v-model="data.minMemory"
        outlined
        hide-details
        type="number"
        :label="t('java.minMemory')"
        :placeholder="t('java.allocatedShort')"
        required
      />
      <v-text-field
        v-model="data.maxMemory"
        outlined
        hide-details
        type="number"
        :label="t('java.maxMemory')"
        :placeholder="t('java.allocatedShort')"
        required
      />
    </div>

    <VersionInputMinecraft
      v-if="showMinecraft"
      class="mt-4"
      :value="data.runtime.minecraft"
      :versions="versions"
      @input="onSelectMinecraft"
    />
    <VersionInputOptifine
      :value="data.runtime.optifine"
      forge=""
      :minecraft="data.runtime.minecraft"
      :versions="versions"
      @input="onSelectOptifine"
    />
    <VersionInputLocal
      :value="data.version"
      :versions="versions"
      @input="onSelectLocalVersion"
    />
  </v-list>
</template>

<script lang=ts setup>
import VersionInputLocal from '@/components/VersionInputLocal.vue'
import VersionInputMinecraft from '@/components/VersionInputMinecraft.vue'
import VersionInputOptifine from '@/components/VersionInputOptifine.vue'
import { kInstanceCreation } from '../composables/instanceCreation'
import { kJavaContext } from '../composables/java'

import { useInstanceEditVersions } from '@/composables/instanceEdit'
import { kLocalVersions } from '@/composables/versionLocal'
import { injection } from '@/util/inject'

defineProps({
  valid: {
    type: Boolean,
    required: true,
  },
  showMinecraft: {
    type: Boolean,
    default: true,
  },
})

const { data } = injection(kInstanceCreation)
const { t } = useI18n()
const { versions } = injection(kLocalVersions)

const {
  onSelectMinecraft,
  onSelectOptifine,
  onSelectLocalVersion,
} = useInstanceEditVersions(data, versions)

const { all: javas } = injection(kJavaContext)
const javaItems = computed(() => javas.value.map(java => ({
  text: `Java ${java.majorVersion} (${java.version})`,
  value: java.path,
})))
</script>

<style>
.java-select .v-select__selection {
  white-space: nowrap;
  overflow-x: hidden;
  overflow-y: hidden;

  max-width: 240px;
}
</style>
