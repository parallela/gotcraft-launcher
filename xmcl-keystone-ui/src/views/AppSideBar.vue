<template>
  <!-- Custom sidebar with Minecraft theme -->
  <div class="hidden md:flex fixed left-0 top-0 h-full w-20 bg-mc-sidebar border-r-2 border-mc-emerald/20 z-30 flex-col items-center py-4">
    <!-- Logo at top -->
    <div class="flex justify-center items-center mb-6">
      <img
        src="@/assets/logo.webp"
        alt="GotCraft"
        class="w-10 h-10 object-contain"
      >
    </div>

    <!-- Navigation icons with reduced spacing -->
    <div class="flex flex-col items-center space-y-1 mb-2">
      <router-link
        to="/"
        exact
        v-shared-tooltip.right="() => t('home')"
        class="nav-icon"
      >
        <v-icon size="20">home</v-icon>
      </router-link>

      <router-link
        to="/store"
        v-shared-tooltip.right="() => t('store.name', 2)"
        class="nav-icon"
      >
        <v-icon size="20">shopping_bag</v-icon>
      </router-link>

      <router-link
        to="/me"
        v-shared-tooltip.right="() => t('myStuff')"
        class="nav-icon"
      >
        <v-icon size="20">star</v-icon>
      </router-link>
    </div>

    <!-- Small divider before version selector -->
    <div class="w-8 h-[1px] bg-gray-600/30 my-2"></div>

    <!-- Version Selector Dropdown -->
    <div class="mb-2">
      <v-menu
        v-model="versionMenuShown"
        offset-x
        right
        :close-on-content-click="true"
        max-height="300"
      >
        <template #activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
            v-shared-tooltip.right="() => t('version.selector')"
            class="nav-icon cursor-pointer"
          >
            <v-icon size="20">apps</v-icon>
          </div>
        </template>

        <v-list class="version-dropdown">
          <v-list-item
            v-for="instance in instances"
            :key="instance.path"
            @click="selectInstance(instance.path)"
            class="version-item"
          >
            <v-list-item-avatar size="32">
              <v-img :src="getInstanceIcon(instance)" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ instance.name || 'Unnamed' }}</v-list-item-title>
              <v-list-item-subtitle>{{ instance.runtime.minecraft }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- Divider line -->
    <div class="w-12 h-[1px] bg-gray-600/50 mb-4"></div>

    <!-- Instances section - HIDDEN as it's redundant with version selector -->
    <div class="hidden flex-1 overflow-y-auto overflow-x-hidden w-full flex-col items-center px-2">
      <AppSideBarContentNext />
    </div>

    <!-- Settings at bottom -->
    <div class="mt-auto pt-4">
      <router-link
        to="/setting"
        v-shared-tooltip.right="() => t('setting.name', 2)"
        class="nav-icon"
      >
        <v-icon size="20">settings</v-icon>
        <span v-if="state?.updateStatus !== 'none'" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">1</span>
      </router-link>
    </div>

    <!-- User avatar at bottom with menu -->
    <v-menu
      v-model="userMenuShown"
      :close-on-content-click="false"
      transition="slide-x-transition"
      :nudge-width="280"
      offset-x
      right
    >
      <template #activator="{ on, attrs }">
        <div
          v-bind="attrs"
          class="mt-3 cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-mc-emerald rounded-lg"
          v-on="on"
          v-shared-tooltip.right="() => selectedUserGameProfile?.name || t('login.login')"
        >
          <PlayerAvatar
            class="w-10 h-10 rounded-lg overflow-hidden"
            :src="selectedUserGameProfile?.textures.SKIN.url"
            :dimension="40"
            style="image-rendering: pixelated;"
          />
        </div>
      </template>

      <UserCard
        class="user-menu w-[600px] max-w-[600px] overflow-y-auto"
        outlined
        flat
        :show="userMenuShown"
      />
    </v-menu>
  </div>
</template>

<script lang=ts setup>
import { kSettingsState } from '@/composables/setting'
import { injection } from '@/util/inject'
import AppSideBarContentNext from './AppSideBarContentNext.vue'
import { vSharedTooltip } from '@/directives/sharedTooltip'
import { kTheme } from '@/composables/theme'
import { kUserContext } from '@/composables/user'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import UserCard from '@/components/UserCard.vue'
import { UserSkinRenderPaused } from '@/composables/userSkin'
import { kInstances } from '@/composables/instances'
import { kInstance } from '@/composables/instance'
import { getInstanceIcon } from '@/util/favicon'

const { state } = injection(kSettingsState)
const { t } = useI18n()
const { gameProfile: selectedUserGameProfile } = injection(kUserContext)
const { instances } = injection(kInstances)
const { select } = injection(kInstance)
const router = useRouter()

const userMenuShown = ref(false)
const versionMenuShown = ref(false)

provide(UserSkinRenderPaused, computed(() => !userMenuShown.value))

const selectInstance = (path: string) => {
  if (router.currentRoute.path !== '/') {
    router.push('/').then(() => {
      select(path)
    })
  } else {
    select(path)
  }
  versionMenuShown.value = false
}
</script>

<style scoped>
.bg-mc-sidebar {
  --tw-bg-opacity: 1;
  background-color: rgb(21 32 43 / var(--tw-bg-opacity, 1));
}

.border-mc-emerald\/20 {
  border-color: rgba(0, 245, 66, 0.2);
}

.nav-icon {
  @apply relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200;
  @apply text-gray-400 hover:text-white no-underline;
  text-decoration: none !important;
  border: 2px solid transparent;
}

.nav-icon:hover {
  background-color: rgba(0, 245, 66, 0.1);
}

.nav-icon.router-link-active,
.nav-icon.router-link-exact-active {
  background-color: #00f54233;
  color: #00f542;
  border-color: #00f54280;
  text-decoration: none !important;
  border-radius: 0.5rem;
}

.version-dropdown {
  max-height: 280px;
  overflow-y: auto;
  min-width: 250px;
}

.version-item {
  min-height: 64px;
}

.version-item:hover {
  background-color: rgba(0, 245, 66, 0.1);
}
</style>

<style>
.bg-mc-emerald\/10 {
  background-color: rgba(0, 245, 66, 0.1);
}

.bg-mc-emerald\/20 {
  background-color: rgba(0, 245, 66, 0.2);
}

.text-mc-emerald {
  color: rgb(0, 245, 66);
}

.user-menu {
  max-height: min(700px, 90vh);
}
</style>
