<template>
  <div class="m-8 flex flex-col items-center justify-center">
    <div class="relative mt-8">
      <v-progress-circular
        color="primary"
        :size="60"
        :width="5"
        indeterminate
      />
    </div>
    <slot />
  </div>
</template>
<script setup lang="ts">
defineProps<{
  texts: (string| number)[]
  hint?: string
  secondaryHint?: boolean
}>()
</script>
