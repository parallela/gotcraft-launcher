<template>
  <v-dialog
    v-model="isShown"
    width="800"
    @input="onInput"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
        flat
      >
        <v-toolbar-title>{{ t('version.addVersion') }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="isShown = false"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-0">
        <v-list>
          <v-subheader>{{ t('version.addVersionHint') }}</v-subheader>

          <!-- OptiFine -->
          <VersionInputOptifine
            :value="selectedVersions.optifine"
            forge=""
            :minecraft="minecraft"
            @input="onSelectOptifine"
          />
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="isShown = false"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!hasSelection"
          @click="onConfirm"
        >
          {{ t('confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import VersionInputOptifine from '@/components/VersionInputOptifine.vue'

const props = defineProps<{
  show: boolean
  minecraft: string
}>()

const emit = defineEmits<{
  (event: 'input', value: boolean): void
  (event: 'confirm', versions: {
    optifine?: string
  }): void
}>()

const { t } = useI18n()

const isShown = computed({
  get: () => props.show,
  set: (v) => emit('input', v),
})

const selectedVersions = reactive({
  optifine: '',
})

const hasSelection = computed(() => {
  return selectedVersions.optifine
})

function onSelectOptifine(version: string) {
  selectedVersions.optifine = version
}

function onConfirm() {
  const versions: { optifine?: string } = {}
  if (selectedVersions.optifine) versions.optifine = selectedVersions.optifine
  emit('confirm', versions)
  isShown.value = false
}

function onInput(value: boolean) {
  if (!value) {
    selectedVersions.optifine = ''
  }
}
</script>
