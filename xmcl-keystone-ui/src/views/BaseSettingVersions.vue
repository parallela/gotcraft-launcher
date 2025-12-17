<template>
  <v-list
    class="base-settings"
    subheader
    color="transparent"
  >
    <v-subheader>
      {{ t('version.name', 2) }}
      <div class="flex-grow" />
      <v-btn
        text
        :disabled="!versionHeader || isModified"
        @click="onFix"
      >
        <v-icon left>
          build
        </v-icon>
        {{ t('version.checkIntegrity') }}
      </v-btn>
      <v-btn
        icon
        @click="showAddVersionDialog = true"
      >
        <v-icon>
          add
        </v-icon>
      </v-btn>
    </v-subheader>
    <VersionInputMinecraft
      :value="data.runtime.minecraft"
      @input="onSelectMinecraft"
    />
    <VersionInputOptifine
      v-if="showOptifine"
      :value="data.runtime.optifine"
      forge=""
      :minecraft="data.runtime.minecraft"
      @input="onSelectOptifine"
    />

    <VersionInputLocal
      :value="data.version"
      :versions="versions"
      :placeholder="versionHeader ? versionHeader.id : undefined"
      @input="onSelectLocalVersion"
      @add="showAddVersionDialog = true"
    />

    <BaseSettingAddVersionDialog
      :show="showAddVersionDialog"
      :minecraft="data.runtime.minecraft"
      @input="showAddVersionDialog = $event"
      @confirm="onAddVersionConfirm"
    />

    <SimpleDialog
      v-model="reinstallDialogModel"
      :width="390"
      :title="t('localVersion.reinstallTitle', { version: reinstallDialog.target.value })"
      :confirm-icon="'build'"
      :color="'orange en-1'"
      :confirm="t('yes')"
      @cancel="reinstallDialog.cancel"
      @confirm="reinstallDialog.confirm"
    >
      {{ t('localVersion.reinstallDescription') }}
    </SimpleDialog>
  </v-list>
</template>

<script lang=ts setup>
import SimpleDialog from '@/components/SimpleDialog.vue'
import VersionInputLocal from '@/components/VersionInputLocal.vue'
import VersionInputMinecraft from '@/components/VersionInputMinecraft.vue'
import VersionInputOptifine from '@/components/VersionInputOptifine.vue'
import BaseSettingAddVersionDialog from './BaseSettingAddVersionDialog.vue'
import { useService } from '@/composables'
import { useSimpleDialog } from '@/composables/dialog'
import { kInstanceVersion } from '@/composables/instanceVersion'
import { kLocalVersions } from '@/composables/versionLocal'
import { injection } from '@/util/inject'
import { InstallServiceKey } from '@xmcl/runtime-api'
import { InstanceEditInjectionKey, useInstanceEditVersions } from '../composables/instanceEdit'
import { kInstance } from '@/composables/instance'

const props = defineProps<{
  isExpanded: boolean
}>()

const { instance } = injection(kInstance)
const {
  data,
  isModified,
} = injection(InstanceEditInjectionKey)
const { versions } = injection(kLocalVersions)

const showAddVersionDialog = ref(false)
const showOptifine = computed(() => props.isExpanded || instance.value.runtime.optifine)

const {
  onSelectMinecraft,
  onSelectOptifine,
  onSelectLocalVersion,
} = useInstanceEditVersions(data, versions)

function onAddVersionConfirm(versions: {
  optifine?: string
}) {
  // Apply the selected versions
  if (versions.optifine) onSelectOptifine(versions.optifine)
}

const { versionHeader } = injection(kInstanceVersion)
function onFix() {
  if (versionHeader.value) {
    reinstallDialog.show(versionHeader.value.id)
  }
}

const { reinstall } = useService(InstallServiceKey)
const reinstallDialog = useSimpleDialog<string>((v) => {
  if (!v) return
  reinstall(v)
})
const reinstallDialogModel = reinstallDialog.model

const { t } = useI18n()
</script>

<style scoped=true>
.flex {
  padding: 6px 8px !important
}
.v-btn {
  margin: 0
}
</style>
