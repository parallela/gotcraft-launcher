<template>
  <v-card
    class="gotcraft-server-card mb-4"
    outlined
  >
    <v-card-title class="flex items-center gap-2">
      <v-icon color="primary">dns</v-icon>
      <v-spacer />
      <v-chip
        :color="status?.online ? 'success' : 'error'"
        small
        label
      >
        {{ status?.online ? 'Online' : 'Offline' }}
      </v-chip>
    </v-card-title>

    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <div class="mt-2">{{ t('serverStatus.ping') }}</div>
    </v-card-text>

    <v-card-text v-else-if="error" class="text-center py-8">
      <v-icon large color="error">error_outline</v-icon>
      <div class="mt-2">{{ error }}</div>
    </v-card-text>

    <template v-else-if="status">
      <v-card-text class="flex flex-col gap-3">
        <div class="flex items-center gap-4">
          <img
            v-if="status.icon"
            :src="status.icon"
            alt="Server Icon"
            class="server-icon"
            style="width: 64px; height: 64px; image-rendering: pixelated;"
          >
          <v-icon v-else x-large color="grey">image_not_supported</v-icon>

          <div class="flex-1">
            <div class="text-h6">{{ serverAddress }}</div>
            <div v-if="status.version" class="text-caption text-gray-400">
              {{ status.version }}
            </div>
            <div
              v-if="status.motd?.clean && status.motd.clean.length > 0"
              class="mt-1 text-sm"
            >
              <div v-for="(line, index) in status.motd.clean" :key="index">
                {{ line }}
              </div>
            </div>
          </div>
        </div>

        <v-divider />

        <div class="flex gap-2 flex-wrap">
          <v-chip
            label
            outlined
            small
          >
            <v-icon left small>people</v-icon>
            {{ status.players.online }} / {{ status.players.max }}
          </v-chip>

          <v-chip
            v-if="status.online"
            label
            outlined
            small
            color="success"
          >
            <v-icon left small>check_circle</v-icon>
            {{ t('server.status') }}: {{ t('online') }}
          </v-chip>
        </div>

        <div
          v-if="status.players.list && status.players.list.length > 0"
          class="mt-2"
        >
          <div class="text-caption mb-1">{{ t('server.onlinePlayers') }}:</div>
          <div class="flex flex-wrap gap-1">
            <v-chip
              v-for="player in status.players.list"
              :key="player.uuid"
              x-small
              label
            >
              {{ player.name }}
            </v-chip>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-btn
          text
          color="primary"
          :loading="loading"
          @click="refresh"
        >
          <v-icon left>refresh</v-icon>
          {{ t('refresh') }}
        </v-btn>
        <v-spacer />
        <v-btn
          color="indigo darken-2"
          dark
          href="https://discord.gotcraft.dev"
          target="browser"
        >
          <v-icon left>discord</v-icon>
          Join Discord
        </v-btn>
        <v-btn
          text
          color="primary"
          @click="copyAddress"
        >
          <v-icon left>content_copy</v-icon>
          {{ t('server.copyAddress') }}
        </v-btn>
      </v-card-actions>
    </template>
  </v-card>
</template>

<script lang="ts" setup>
import { useGotCraftServerStatus } from '@/composables/gotcraftServerStatus'
import { useNotifier } from '@/composables/notifier'

const { status, loading, error, refresh, serverAddress } = useGotCraftServerStatus()
const { t } = useI18n()
const { notify } = useNotifier()

onMounted(() => {
  refresh()
})

// Auto-refresh every 2 minutes (matching API cache time)
const refreshInterval = setInterval(() => {
  if (!loading.value) {
    refresh()
  }
}, 120000)

onUnmounted(() => {
  clearInterval(refreshInterval)
})

function copyAddress() {
  navigator.clipboard.writeText(serverAddress)
  notify({
    level: 'success',
    title: t('server.copyAddress'),
    body: t('server.addressCopied', { address: serverAddress }),
  })
}
</script>

<style scoped>
.gotcraft-server-card {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.server-icon {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
