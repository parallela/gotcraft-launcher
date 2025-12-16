<template>
  <div
    ref="container"
    class="visible-scroll h-full select-none overflow-auto pb-8"
    @wheel="onWheel"
  >
    <div class="z-2 relative flex w-full flex-col py-4" @dragover.prevent>
      <!-- "My Stuff" Section (Games, Versions, Modpacks) -->
      <section class="mt-4 px-4 md:px-6">
        <MeSectionHeader
          id="my-stuff-header"
          :title="options.find((o) => o.value === currentDisplaied)?.text ?? ''"
          @select="currentDisplaied = $event"
        >
          <template #extra>
            <v-btn-toggle
              v-if="currentDisplaied === ''"
              v-model="instanceViewMode"
              mandatory
              dense
              class="mr-2"
            >
              <v-btn
                v-shared-tooltip.bottom="() => t('me.viewByFolder')"
                small
                value="folder"
              >
                <v-icon small>folder</v-icon>
              </v-btn>
              <v-btn
                v-shared-tooltip.bottom="() => t('me.viewByDate')"
                small
                value="date"
              >
                <v-icon small>schedule</v-icon>
              </v-btn>
            </v-btn-toggle>
            <v-text-field
              v-model="filterKey"
              outlined
              small
              dense
              hide-details
              class="flex-grow-0"
              prepend-inner-icon="search"
              :placeholder="t('filter')"
            ></v-text-field>
          </template>
        </MeSectionHeader>
        <div class="mt-4">
          <InstancesCards
            v-if="currentDisplaied === ''"
            :instances="sorted"
            :view-mode="instanceViewMode"
            class="px-0"
            @select="onInstanceClick"
          />
          <ResourceManageVersions
            v-else-if="currentDisplaied === 'version'"
            class="mt-2"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLocalStorageCacheBool } from "@/composables/cache";
import { useDateString } from "@/composables/date";
import { kInstance } from "@/composables/instance";
import { kInstances } from "@/composables/instances";
import { useScrollRight } from "@/composables/scroll";
import { vSharedTooltip } from "@/directives/sharedTooltip";
import { injection } from "@/util/inject";
import { ref, computed, watch, onUnmounted } from "vue";
import MeSectionHeader from "./MeSectionHeader.vue";

import { useQuery } from "@/composables/query";
import InstancesCards from "./InstancesCards.vue";
import ResourceManageVersions from "./ResourceManageVersions.vue";
import { useTutorial } from "@/composables/tutorial";
import { DriveStep } from "driver.js";
import { kTheme } from "@/composables/theme";
import { useMagicKeys } from "@vueuse/core";

const currentDisplaied = useQuery("view");

const { t } = useI18n();
const { backgroundImageOverride } = injection(kTheme);

const filterKey = ref("");
const instanceViewMode = ref<'folder' | 'date'>('folder');
const keys = useMagicKeys()
const ctrlF = keys['Ctrl+F']
watch(ctrlF, (v) => {
  if (v) {
    const input = container.value?.querySelector('input')
    if (input) {
      input.focus()
      input.select()
    }
  }
})

const { getDateString } = useDateString();

const options = computed(() => [
  {
    text: t("me.games", 2),
    value: "",
    icon: "apps",
  },
  {
    text: t("me.versions", 2),
    value: "version",
    icon: "power",
  },
]);

const { instances } = injection(kInstances);
const sorted = computed(() =>
  [...instances.value].filter(v => v.name.toLocaleLowerCase().includes(filterKey.value.toLocaleLowerCase())).sort((a, b) => b.lastAccessDate - a.lastAccessDate)
);

const opacity = ref(1);

const container = ref<HTMLDivElement | undefined>(undefined);
const onWheel = (e: WheelEvent) => {
  const element = container.value;
  if (!element) return;
  if (element.clientHeight === 0) return;

  const maxVal = element.scrollHeight - element.clientHeight;
  if (maxVal === 0) {
    opacity.value = 1;
    return;
  }
  const currentVal = element.scrollTop;
  opacity.value = 1 - currentVal / maxVal;
};

const { path } = injection(kInstance);
const { push, currentRoute } = useRouter();
const onInstanceClick = (instancePath: string) => {
  if (currentRoute.path === "/") {
    path.value = instancePath;
  } else {
    path.value = instancePath;
    push("/");
  }
};

// Tutorial
useTutorial(
  computed(() => {
    const steps: DriveStep[] = [
      {
        element: "#hide-news-button",
        popover: {
          title: t("setting.hideNewsHeader"),
          description: t("tutorial.hideNewsHeaderDescription"),
        },
      },
      {
        element: "#my-stuff-header",
        popover: {
          title: t("me.recentPlay"),
          description: t("tutorial.recentPlayDescription"),
        },
      },
    ];
    return steps;
  })
);
</script>

<style scoped>
/* visible-scroll and other global styles are assumed to be defined elsewhere */
.visible-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.visible-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(128, 128, 128, 0.5);
  border-radius: 4px;
}

.visible-scroll::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Transition for fade */
.fade-transition-enter-active,
.fade-transition-leave-active {
  transition: opacity 0.3s ease;
}

.fade-transition-enter-from,
.fade-transition-leave-to {
  opacity: 0;
}
</style>
