<template>
  <div class="h-full overflow-auto w-full">
    <div class="flex flex-col items-center gap-3 w-full">
      <template v-if="isValidating">
        <v-skeleton-loader
          v-for="i in 5"
          :key="i"
          class="my-1"
          type="avatar"
        />
      </template>
      <template v-for="(i, index) of groups">
        <AppSideBarInstanceItem
          v-if="typeof i === 'string'"
          :key="i + index"
          :path="i"
          @arrange="move($event.targetPath, i, $event.previous)"
          @group="group($event, i)"
        />
        <AppSideBarGroupItem
          v-else-if="typeof i === 'object'"
          :key="i.id + index"
          :group="i"
          :color="i.color || defaultColor"
          @arrange="move($event.targetPath, $event.toPath || i, $event.previous)"
          @group="group($event, i)"
        />
      </template>

      <button
        v-shared-tooltip.right="() => t('instances.add')"
        @click="showAddInstance()"
        class="instance-add-btn"
      >
        <div class="w-10 h-10 bg-[rgba(80,80,80,0.4)] rounded-lg transition-all duration-300 hover:rounded-xl hover:bg-green-500 flex items-center justify-center">
          <v-icon size="20">
            add
          </v-icon>
        </div>
      </button>
    </div>
    <SimpleDialog
      :width="500"
      color="primary"
      dialog="saveCopyDialog"
      :title="t('save.copy.title')"
      :confirm="t('save.copy.confirm')"
      @confirm="doCopy"
    >
      {{ copySavePayload?.destInstancePath }}
      {{ copySavePayload?.saveName }}
    </SimpleDialog>
    <AppSideBarGroupSettingDialog :default-color="defaultColor" />
  </div>
</template>
<script setup lang="ts">
import SimpleDialog from '@/components/SimpleDialog.vue'
import { useService } from '@/composables'
import { useDialog } from '@/composables/dialog'
import { useInstanceGroup, useInstanceGroupDefaultColor } from '@/composables/instanceGroup'
import { AddInstanceDialogKey } from '@/composables/instanceTemplates'
import { kInstances } from '@/composables/instances'
import { useNotifier } from '@/composables/notifier'
import { vSharedTooltip } from '@/directives/sharedTooltip'
import { injection } from '@/util/inject'
import { InstanceSavesServiceKey } from '@xmcl/runtime-api'
import AppSideBarGroupItem from './AppSideBarGroupItem.vue'
import AppSideBarGroupSettingDialog from './AppSideBarGroupSettingDialog.vue'
import AppSideBarInstanceItem from './AppSideBarInstanceItem.vue'

const { t } = useI18n()

const { isValidating } = injection(kInstances)

const { show: showAddInstance } = useDialog(AddInstanceDialogKey)

const { groups, move, group } = useInstanceGroup()

const { isShown } = useDialog('saveCopyDialog')
const copySavePayload = ref(undefined as {
  saveName: string
  srcInstancePath: string
  destInstancePath: string
} | undefined)
const { cloneSave } = useService(InstanceSavesServiceKey)
const defaultColor = useInstanceGroupDefaultColor()
const { notify } = useNotifier()
function doCopy() {
  if (copySavePayload.value) {
    cloneSave({ ...copySavePayload.value }).then(() => {
      notify({
        level: 'success',
        title: t('save.copy.name'),
      })
    }, () => {
      notify({
        level: 'error',
        title: t('save.copy.name'),
      })
    })
  }
  isShown.value = false
}

</script>

<style scoped>
.instance-add-btn {
  @apply w-full flex justify-center items-center;
}
</style>
