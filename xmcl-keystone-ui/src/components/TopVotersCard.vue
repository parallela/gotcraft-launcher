<template>
  <v-card class="top-voters-card" outlined>
    <v-card-title class="flex items-center gap-2 pb-2">
      <v-icon color="success">how_to_vote</v-icon>
      <span>Top Voters</span>
    </v-card-title>

    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="success" />
      <div class="mt-2">Loading...</div>
    </v-card-text>

    <v-card-text v-else-if="error" class="text-center py-4">
      <v-icon color="error">error_outline</v-icon>
      <div class="mt-2 text-sm">{{ error }}</div>
    </v-card-text>

    <v-card-text v-else-if="top3.length > 0" class="pt-0 pb-4">
      <!-- Top 3 Grid -->
      <div class="top3-grid">
        <div
          v-for="(voter, index) in top3"
          :key="voter.nickname"
          class="top3-item"
        >
          <div class="rank-card">
            <div class="rank-badge">
              {{ index + 1 }}
            </div>
            <img
              :src="`https://mineskin.eu/armor/bust/${encodeURIComponent(voter.nickname)}/100.png`"
              :alt="voter.nickname"
              class="voter-bust pixelated"
              @error="handleImageError"
            >
            <div class="rank-name">{{ voter.nickname }}</div>
            <div class="votes-caption">{{ voter.votes }} votes</div>
          </div>
        </div>
      </div>

      <!-- Voter List -->
      <div v-if="otherVoters.length > 0" class="voter-list">
        <div
          v-for="(voter, idx) in otherVoters"
          :key="voter.nickname"
          class="voter-row"
        >
          <div class="voter-info">
            <img
              :src="`https://mineskin.eu/armor/bust/${encodeURIComponent(voter.nickname)}/100.png`"
              :alt="voter.nickname"
              class="voter-head pixelated"
              @error="handleImageError"
            >
            <div class="voter-details">
              <div class="voter-name">{{ voter.nickname }}</div>
              <div class="voter-rank">#{{ idx + 4 }}</div>
            </div>
          </div>
          <div class="voter-votes">
            <div class="votes-number">{{ voter.votes }}</div>
          </div>
        </div>
      </div>
    </v-card-text>

    <v-card-text v-else class="text-center py-4 text-sm text-gray-400">
      No voters data available
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'

interface Voter {
  nickname: string
  votes: number
}

interface VotersResponse {
  source: string
  voters: Voter[]
  top3: Voter[]
}

const loading = ref(true)
const error = ref<string | null>(null)
const voters = ref<Voter[]>([])
const top3 = ref<Voter[]>([])

const otherVoters = computed(() => {
  return voters.value.slice(3)
})

async function fetchTopVoters() {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('https://gotcraft.dev/api/votes/top?limit=50')
    if (!response.ok) {
      throw new Error('Failed to fetch top voters')
    }
    const data: VotersResponse = await response.json()
    voters.value = data.voters || []
    top3.value = data.top3 || voters.value.slice(0, 3)
  } catch (e) {
    console.error('Error fetching top voters:', e)
    error.value = 'Failed to load voters'
  } finally {
    loading.value = false
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = 'https://mineskin.eu/armor/bust/steve/100.png'
}

onMounted(() => {
  fetchTopVoters()
})

// Auto-refresh every 5 minutes
const refreshInterval = setInterval(() => {
  if (!loading.value) {
    fetchTopVoters()
  }
}, 300000)

onUnmounted(() => {
  clearInterval(refreshInterval)
})
</script>

<style scoped>
.top-voters-card {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

/* Top 3 Grid */
.top3-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.top3-item {
  width: 100%;
}

.rank-card {
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid rgba(255,255,255,0.03);
  overflow: hidden;
  position: relative;
  z-index: 0;
  min-width: 0;
  padding: 1.25rem 1rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s ease;
}

.rank-card:hover {
  transform: translateY(-4px);
}

.rank-badge {
  box-shadow: 0 6px 18px rgba(0,0,0,0.45);
  z-index: 9999;
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: linear-gradient(to right, #FFD700, #00F542);
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: bold;
  color: #1a1a1a;
}

.voter-bust {
  width: 5rem;
  height: 5rem;
  position: relative;
  z-index: 1;
  display: block;
  margin-bottom: 0.75rem;
  border-radius: 0.375rem;
}

.rank-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.votes-caption {
  color: rgba(255,255,255,0.85);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Voter List */
.voter-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 28rem;
  overflow-y: auto;
  padding-right: 2.25rem;
}

.voter-row {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.voter-row:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.voter-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.voter-head {
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
}

.voter-details {
  display: flex;
  flex-direction: column;
}

.voter-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}

.voter-rank {
  font-size: 0.75rem;
  color: rgba(156, 163, 175, 1);
}

.voter-votes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.votes-number {
  min-width: 1.75rem;
  text-align: right;
  font-size: 0.875rem;
  font-weight: bold;
  color: #00F542;
}

/* Custom scrollbar */
.voter-list::-webkit-scrollbar {
  width: 0.875rem;
}

.voter-list::-webkit-scrollbar-track {
  background: transparent;
}

.voter-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #1ecf7a, #00b26a);
  border-radius: 999px;
  border: 2px solid rgba(0, 0, 0, 0.35);
}

.voter-list {
  scrollbar-width: thin;
  scrollbar-color: #00b26a transparent;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .top3-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .voter-bust {
    width: 4rem !important;
    height: 4rem !important;
  }

  .rank-card {
    padding: 1rem;
  }

  .rank-badge {
    top: 0.5rem;
    left: 0.5rem;
  }

  .rank-name {
    font-size: 0.9rem;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .top3-grid {
    gap: 0.5rem;
  }
}
</style>
