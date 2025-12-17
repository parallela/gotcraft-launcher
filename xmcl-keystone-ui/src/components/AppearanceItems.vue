<template>
  <div>
    <!-- Hidden: All theme customization removed -->
    <!--
    <v-list-item class="items-center justify-center">
      ...color theme controls...
    </v-list-item>
    <SettingItemSelect
      :select.sync="backgroundType"
      :title="t('setting.backgroundType')"
      :description="t('setting.backgroundTypeDescription')"
      :items="backgroundTypes"
    />
    <SettingItemCheckbox
      v-model="backgroundColorOverlay"
      :title="t('setting.backgroundColorAbove')"
      :description="t('setting.backgroundColorAboveDescription')"
    />
    -->

    <!-- Font Settings Only -->
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          {{
            t('setting.themeFont')
          }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{
            t('setting.themeFontDescription')
          }}
        </v-list-item-subtitle>
      </v-list-item-content>
      <div class="flex flex-grow-0 gap-1 mr-2">
        <v-btn-toggle
          v-model="fontDelta"
          mandatory
          solo
          dense
        >
          <v-btn
            solo
            class="h-unset!"
          >
            1px
          </v-btn>
          <v-btn
            solo
            class="h-unset!"
          >
            0.1px
          </v-btn>
        </v-btn-toggle>
        <v-btn
          icon
          @click="onFontSizeDecrease"
        >
          <v-icon>
            text_decrease
          </v-icon>
        </v-btn>
        <v-text-field
          :value="`${Math.round(fontSize * 10) / 10}px`"
          readonly
          class="max-w-20"
          solo
          outlined
          dense
          hide-details
        />
        <v-btn
          icon
          @click="onFontSizeIncrease"
        >
          <v-icon>
            text_increase
          </v-icon>
        </v-btn>
      </div>

      <v-menu
        offset-y
        open-on-hover
        close-delay="100"
      >
        <template #activator="{ on, attrs }">
          <v-btn
            outlined
            text
            style="margin-right: 10px"
            v-bind="attrs"
            v-on="on"
            @click="onSelectFont"
          >
            {{ t("setting.themeSelectFont") }}
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item @click="showFontUrlDialog = true">
            <v-list-item-icon>
              <v-icon>link</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ t("setting.enterUrl") }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        outlined
        text
        style="margin-right: 10px"
        @click="onRevertFont"
      >
        {{ t("setting.themeResetFont") }}
      </v-btn>
    </v-list-item>

    <!-- Font URL Dialog -->
    <v-dialog
      v-model="showFontUrlDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>{{ t("setting.themeFontUrl") }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="fontUrlInput"
            autofocus
            filled
            :label="t('setting.themeFontUrlPlaceholder')"
            @keydown.enter="applyFontUrl"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="showFontUrlDialog = false"
          >
            {{ t("cancel") }}
          </v-btn>
          <v-btn
            color="primary"
            text
            :disabled="!fontUrlInput"
            @click="applyFontUrl"
          >
            {{ t("ok") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
import SettingItemCheckbox from '@/components/SettingItemCheckbox.vue'
import SettingItemSelect from '@/components/SettingItemSelect.vue'
import { useService } from '@/composables/service'
import { BackgroundType, UIThemeDataV1, useThemeWritter } from '@/composables/theme'
import { basename } from '@/util/basename'
import { ThemeServiceKey } from '@xmcl/runtime-api'
import SettingAppearanceColor from '../views/SettingAppearanceColor.vue'

const props = defineProps<{
  theme: UIThemeDataV1
  /**
   * If provided, media files will be stored under the instance's theme folder.
   * This keeps instance theme media separate from global theme media.
   */
  instancePath?: string
}>()
const { showOpenDialog, showSaveDialog } = windowController
const { t } = useI18n()

const emit = defineEmits<{
  (e: 'save'): void
}>()
const {
  backgroundMusic,
  backgroundImage,
  setBackgroundImage, setBackgroundImageUrl, clearBackgroundImage, exportTheme, importTheme, resetToDefault, setFont, setFontUrl, resetFont, removeMusic, addMusic, addMusicUrl,
  appBarColor, sideBarColor, primaryColor, cardColor, backgroundColor, warningColor, errorColor,
  blurAppBar, blurSidebar, blurCard, blur,
  backgroundColorOverlay, backgroundType, particleMode, backgroundImageFit, volume, fontSize,
  isDark,
} = useThemeWritter(computed(() => props.theme), () => emit('save'), { instancePath: props.instancePath })

// Force background type to none
watch(() => backgroundType.value, (val) => {
  if (val !== BackgroundType.NONE) {
    backgroundType.value = BackgroundType.NONE
  }
}, { immediate: true })

// URL input refs
const fontUrlInput = ref('')

// Dialog show states
const showFontUrlDialog = ref(false)

// URL apply functions
function isValidHttpUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

async function applyFontUrl() {
  if (fontUrlInput.value && isValidHttpUrl(fontUrlInput.value)) {
    await setFontUrl(fontUrlInput.value)
    fontUrlInput.value = ''
    showFontUrlDialog.value = false
  }
}

const fontDelta = ref(0)
function onFontSizeIncrease() {
  const delta = fontDelta.value ? 0.1 : 1
  fontSize.value = fontSize.value + delta
}
function onFontSizeDecrease() {
  const delta = fontDelta.value ? 0.1 : 1
  fontSize.value = fontSize.value - delta
}

function onSelectFont() {
  showOpenDialog({
    title: t('setting.themeSelectFont'),
    properties: ['openFile'],
    filters: [{
      name: 'font',
      extensions: ['ttf', 'otf', 'woff', 'woff2'],
    }],
  }).then((v) => {
    if (v.filePaths[0]) {
      setFont(v.filePaths[0])
    }
  })
}

function onRevertFont() {
  resetFont()
}

</script>
