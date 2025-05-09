<script setup lang="ts">
import { NConfigProvider } from 'naive-ui';
import NaiveProvider from '@renderer/components/NaiveProvider.vue';
</script>

<template>
  <NConfigProvider class="max-h-full">
    <NaiveProvider>
      <RouterView />
    </NaiveProvider>
  </NConfigProvider>
</template>
