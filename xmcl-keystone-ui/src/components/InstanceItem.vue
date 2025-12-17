<script setup lang="ts">
import { RuntimeVersions } from '@xmcl/instance';
import { BuiltinImages } from '../constant'

defineProps<{
  icon?: string
  name: string
  runtime: RuntimeVersions
  value?: boolean
  description?: string
}>()

defineEmits(['input', 'select'])

</script>

<template>
  <v-list-item
    ripple
    @click="$emit('select')"
  >
    <v-list-item-avatar>
      <v-img
        :src="icon ? icon : ''"
      />
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title>{{ name }}</v-list-item-title>
      <v-list-item-subtitle class="flex gap-1 flex-wrap">
        <span
          v-if="runtime.minecraft"
          class="version-badge minecraft"
        >
          <img
            :src="BuiltinImages.minecraft"
            alt="minecraft"
            class="version-icon"
          >
          {{ runtime.minecraft }}
        </span>
        <span
          v-if="runtime.optifine"
          class="version-badge optifine"
        >
          {{ runtime.optifine }}
        </span>
      </v-list-item-subtitle>
      <v-list-item-subtitle v-if="description" class="mt-1">
        {{ description }}
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action v-if="value !== undefined">
      <v-checkbox
        :input-value="value"
        readonly
        @input="$emit('input', $event)"
      />
    </v-list-item-action>
  </v-list-item>
</template>

<style scoped>
.version-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}

.version-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.version-badge.minecraft {
  border-color: rgba(87, 142, 47, 0.3);
}

.version-badge.optifine {
  border-color: rgba(200, 200, 200, 0.3);
}
</style>
