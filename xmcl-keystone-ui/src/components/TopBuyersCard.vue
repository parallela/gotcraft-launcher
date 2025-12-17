<template>
  <v-card class="top-buyers-card" outlined>
    <v-card-title class="flex items-center gap-2 pb-2">
      <v-icon color="primary">emoji_events</v-icon>
      <span>Top Buyers</span>
    </v-card-title>

    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <div class="mt-2">Loading...</div>
    </v-card-text>

    <v-card-text v-else-if="error" class="text-center py-4">
      <v-icon color="error">error_outline</v-icon>
      <div class="mt-2 text-sm">{{ error }}</div>
    </v-card-text>

    <v-card-text v-else-if="topBuyers.length > 0" class="pt-0 pb-0 flex flex-col" style="overflow: visible; height: calc(100% - 56px);">
      <!-- Top 3 Podium -->
      <div class="podium-container">
        <div
          v-for="buyer in topBuyers"
          :key="buyer.user_id"
          :class="`podium-item rank-${buyer.rank}`"
        >
          <!-- Username -->
          <div class="buyer-username">
            {{ buyer.username }}
          </div>

          <!-- Minecraft Skin - Fixed size to prevent stretching -->
          <div :class="`skin-container rank-${buyer.rank}`">
            <img
              :src="`https://mc-heads.net/body/${buyer.username}/100`"
              :alt="buyer.username"
              class="pixelated skin-image"
              @error="handleImageError"
            >
          </div>

          <!-- Podium - properly positioned below skin -->
          <div :class="`podium-cube rank-${buyer.rank}`">
            <div class="podium-top">
              <div class="podium-label">
                <span class="top-text">TOP</span>
                <span class="rank-number">{{ buyer.rank }}</span>
                <v-icon :class="`trophy-icon rank-${buyer.rank}`" small>
                  emoji_events
                </v-icon>
              </div>
              <div class="podium-amount">
                <span class="votes-text">€{{ formatAmount(buyer.total_spent) }}</span>
              </div>
            </div>
            <div :class="`podium-front rank-${buyer.rank}`" />
          </div>
        </div>
      </div>

      <!-- Other Rankings - Full height scroll -->
      <div v-if="otherBuyers.length > 0" class="other-buyers-list flex-1">
        <div
          v-for="buyer in otherBuyers"
          :key="buyer.user_id"
          class="buyer-row"
        >
          <div class="buyer-info">
            <!-- Rank Badge -->
            <div class="rank-badge">
              <span>#{{ buyer.rank }}</span>
            </div>

            <!-- Player Head -->
            <img
              :src="`https://mc-heads.net/avatar/${buyer.username}/32`"
              :alt="buyer.username"
              class="player-head pixelated"
              @error="handleImageError"
            >

            <!-- Username -->
            <span class="buyer-name">{{ buyer.username }}</span>
          </div>

          <!-- Amount Spent -->
          <div class="buyer-stats">
            <span class="amount">€{{ formatAmount(buyer.total_spent) }}</span>
            <p class="purchases">{{ buyer.purchase_count }} purchases</p>
          </div>
        </div>
      </div>
    </v-card-text>

    <v-card-text v-else class="text-center py-4 text-sm text-gray-400">
      No data available
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'

interface Buyer {
  user_id: number
  username: string
  total_spent: number
  purchase_count: number
  rank?: number
}

const loading = ref(true)
const error = ref<string | null>(null)
const buyers = ref<Buyer[]>([])

const topBuyers = computed(() => {
  return buyers.value.slice(0, 3).map((buyer, index) => ({
    ...buyer,
    rank: index + 1,
  }))
})

const otherBuyers = computed(() => {
  return buyers.value.slice(3).map((buyer, index) => ({
    ...buyer,
    rank: index + 4,
  }))
})

async function fetchTopBuyers() {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('https://gotcraft.dev/api/purchases/top-buyers?limit=10')
    if (!response.ok) {
      throw new Error('Failed to fetch top buyers')
    }
    const data = await response.json()
    buyers.value = data.top_buyers || []
  } catch (e) {
    console.error('Error fetching top buyers:', e)
    error.value = 'Failed to load top buyers'
  } finally {
    loading.value = false
  }
}

function formatAmount(amount: number): string {
  return amount.toFixed(2)
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.src.includes('mc-heads.net/body')) {
    img.src = 'https://mc-heads.net/body/steve/100'
  } else if (img.src.includes('mc-heads.net/avatar')) {
    img.src = 'https://mc-heads.net/avatar/steve/32'
  }
}

onMounted(() => {
  fetchTopBuyers()
})

// Auto-refresh every 5 minutes
const refreshInterval = setInterval(() => {
  if (!loading.value) {
    fetchTopBuyers()
  }
}, 300000)

onUnmounted(() => {
  clearInterval(refreshInterval)
})
</script>

<style scoped>
.top-buyers-card {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  overflow: visible;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

/* Podium Container - Fixed height and full width */
.podium-container {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1rem;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  width: 100%;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: float-in 0.6s ease-out;
}

.buyer-username {
  margin-bottom: 0.75rem;
  text-align: center;
  font-weight: bold;
  color: white;
  font-size: 0.875rem;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Skin Container - Fixed to prevent floating and stretching */
.skin-container {
  position: relative;
  width: 50px;
  height: 100px;
  margin-bottom: 0.5rem;
  transform-style: preserve-3d;
  animation: gentle-float 3s ease-in-out infinite;
}

.skin-container.rank-1 { animation-delay: 0s; }
.skin-container.rank-2 { animation-delay: 0.2s; }
.skin-container.rank-3 { animation-delay: 0.4s; }

.skin-image {
  width: 50px;
  height: 100px;
  object-fit: contain;
  position: relative;
  z-index: 10;
  display: block;
}

/* Animations */
@keyframes gentle-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Podium Cube - properly positioned */
.podium-cube {
  position: relative;
  width: 140px;
  perspective: 1000px;
  margin-top: -0.5rem;
}

.podium-top {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem 0.5rem 0 0;
  text-align: center;
  position: relative;
  z-index: 10;
}

.podium-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: bold;
  font-size: 1rem;
}

.top-text {
  color: white;
}

.podium-amount {
  margin-top: 0.5rem;
}

.podium-front {
  height: 60px;
  border-radius: 0 0 0.5rem 0.5rem;
  position: relative;
}

/* Rank 1 - Gold/Orange */
.rank-1 .podium-top {
  background: linear-gradient(135deg, orange 0%, #ff8c00 100%);
  border: 1px solid gold;
}

.rank-1 .podium-front {
  background: linear-gradient(180deg, orange 0%, #ff8c00 100%);
  height: 80px;
  box-shadow: 0 10px 40px rgba(255, 165, 0, 0.4);
  border-color: gold;
}

.rank-1 .rank-number {
  color: gold;
  font-size: 1.25rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.rank-1 .trophy-icon {
  color: #FFD700 !important;
}

.rank-1 .votes-text {
  color: gold;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Rank 2 - Silver */
.rank-2 .podium-top {
  background: linear-gradient(135deg, silver 0%, #a8a8a8 100%);
  border-color: #d3d3d3;
  box-shadow: 0 0 15px rgba(192, 192, 192, 0.3);
}

.rank-2 .podium-front {
  background: linear-gradient(180deg, silver 0%, #a8a8a8 100%);
  height: 70px;
  box-shadow: 0 8px 30px rgba(192, 192, 192, 0.4);
  border-color: #d3d3d3;
}

.rank-2 .rank-number {
  color: #1a1a1a;
  font-size: 1.125rem;
  font-weight: 700;
}

.rank-2 .trophy-icon {
  color: #C0C0C0 !important;
}

.rank-2 .votes-text {
  color: #1a1a1a;
  font-weight: 700;
}

/* Rank 3 - Bronze/Copper */
.rank-3 .podium-top {
  background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
  border-color: #CD7F32;
}

.rank-3 .podium-front {
  background: linear-gradient(180deg, #CD7F32 0%, #B87333 100%);
  height: 60px;
  box-shadow: 0 6px 20px rgba(205, 127, 50, 0.4);
  border-color: #CD7F32;
}

.rank-3 .rank-number {
  color: white;
  font-size: 1.125rem;
  font-weight: 700;
}

.rank-3 .trophy-icon {
  color: #CD7F32 !important;
}

.rank-3 .votes-text {
  color: white;
  font-weight: 700;
}

/* Order for visual effect */
.podium-item.rank-2 {
  order: 1;
}

.podium-item.rank-1 {
  order: 2;
  margin-bottom: 1rem;
}

.podium-item.rank-3 {
  order: 3;
}

/* Other Buyers List - Take full remaining height and width */
.other-buyers-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  overflow-x: visible;
  padding: 0 1rem 1rem 1rem;
  flex: 1;
  min-height: 0;
  width: 100%;
}

.buyer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(0, 245, 66, 0.2);
  transition: all 0.2s;
  position: relative;
  z-index: 1;
  min-width: 0;
  flex-shrink: 0;
}

.buyer-row:hover {
  border-color: rgba(0, 245, 66, 0.4);
  transform: scale(1.02);
  background: rgba(255, 255, 255, 0.04);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 245, 66, 0.2);
}

.buyer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  background: rgba(128, 128, 128, 0.2);
  border: 1px solid rgba(0, 245, 66, 0.3);
}

.rank-badge span {
  color: #d1d5db;
  font-weight: bold;
  font-size: 0.875rem;
}

.player-head {
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  border: 2px solid rgba(0, 245, 66, 0.3);
}

.buyer-name {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.buyer-stats {
  text-align: right;
}

.amount {
  color: #00F542;
  font-weight: bold;
  font-size: 1rem;
}

.purchases {
  color: #9ca3af;
  font-size: 0.75rem;
  margin: 0;
}

/* Custom scrollbar - Match TopVotersCard width */
.other-buyers-list::-webkit-scrollbar {
  width: 0.875rem;
}

.other-buyers-list::-webkit-scrollbar-track {
  background: transparent;
}

.other-buyers-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #00F542, #00b26a);
  border-radius: 999px;
  border: 2px solid rgba(0, 0, 0, 0.35);
}

.other-buyers-list {
  scrollbar-width: thin;
  scrollbar-color: #00b26a transparent;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .podium-container {
    gap: 0.5rem;
  }

  .skin-container {
    width: 40px;
    height: 80px;
  }

  .skin-image {
    width: 40px;
    height: 80px;
  }

  .podium-cube {
    width: 110px;
  }

  .buyer-username {
    font-size: 0.75rem;
    max-width: 100px;
  }

  .podium-label {
    font-size: 0.875rem;
  }

  .rank-number {
    font-size: 1rem !important;
  }

  .buyer-row {
    padding: 0.5rem 0.75rem;
  }
}
</style>
