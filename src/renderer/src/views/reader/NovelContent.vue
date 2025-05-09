<script lang="ts" setup>
import { useAppStore } from '@renderer/stores/app';
import { useNovelStore } from '@renderer/stores/novel';
import { NScrollbar, NSpin, NText } from 'naive-ui';
import { computed, ref, watch } from 'vue';

const appStore = useAppStore();
const novelStore = useNovelStore();

const scrollbarRef = ref<InstanceType<typeof NScrollbar> | null>(null);

// 当前章节信息
const chapterInfo = computed(() => {
  if (!novelStore.hasNovel) return '';
  return `${novelStore.currentIndex + 1}/${novelStore.chapterCount}: ${novelStore.currentNovel}`;
});

watch(
  () => novelStore.novelContent,
  () => scrollbarRef.value?.scrollTo({ top: 0 }),
  { immediate: true }
);
</script>

<template>
  <NScrollbar ref="scrollbarRef" class="h-full">
    <NText v-if="novelStore.hasNovel" class="block text-center mb-2 opacity-60" :style="appStore.fontCss">
      {{ chapterInfo }}
    </NText>

    <NSpin :show="novelStore.loading">
      <div v-if="novelStore.error" class="text-red-500" :style="appStore.fontCss">
        {{ novelStore.error }}
      </div>
      <pre v-else class="whitespace-pre-wrap" :style="appStore.fontCss">{{ novelStore.novelContent }}</pre>
    </NSpin>
  </NScrollbar>
</template>

<style lang="scss" scoped></style>
