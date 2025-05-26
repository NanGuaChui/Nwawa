<script lang="ts" setup>
import { useAppStore } from '@renderer/stores/app';
import { useNovelStore } from '@renderer/stores/novel';
import { splitContentToLines } from '@renderer/utils/text-utils';
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

// 内容按行拆分
const contentLines = computed(() => {
  return splitContentToLines(novelStore.novelContent, appStore.maxCharsPerLine);
});

// 确保当前行索引在有效范围内
const validateLineIndex = () => {
  if (contentLines.value.length === 0) return;

  const maxIndex = contentLines.value.length - 1;
  if (appStore.currentLineIndex > maxIndex) {
    appStore.setCurrentLineIndex(maxIndex);
  }
};

// 当前显示内容
const currentDisplayContent = computed(() => {
  if (!appStore.singleLineMode) return novelStore.novelContent;

  if (contentLines.value.length === 0) return '';

  // 确保当前行索引在有效范围内
  validateLineIndex();
  return contentLines.value[appStore.currentLineIndex] || '';
});

// 当前行信息
const lineInfo = computed(() => {
  if (!appStore.singleLineMode || contentLines.value.length === 0) return '';
  return `${appStore.currentLineIndex + 1}/${contentLines.value.length}`;
});

watch(
  () => novelStore.novelContent,
  () => {
    scrollbarRef.value?.scrollTo({ top: 0 });
    // 仅当内容加载完成后验证行索引，不直接重置为0
    if (appStore.singleLineMode) {
      validateLineIndex();
    }
  },
  { immediate: true }
);

// 监听章节变化时重置行索引
watch(
  () => novelStore.currentIndex,
  () => {
    if (appStore.singleLineMode) {
      appStore.setCurrentLineIndex(0);
    }
  }
);

// 监听单行模式的最大字符数变化
watch(
  () => appStore.maxCharsPerLine,
  () => {
    if (appStore.singleLineMode) {
      // 字符数变化后可能会影响行数，需要验证行索引
      validateLineIndex();
    }
  }
);
</script>

<template>
  <div v-if="appStore.singleLineMode" :style="appStore.fontCss" class="line-clamp-1">
    {{ currentDisplayContent }}
  </div>
  <NScrollbar v-else ref="scrollbarRef" class="h-full">
    <NText v-if="novelStore.hasNovel" class="block text-center mb-2 opacity-60" :style="appStore.fontCss">
      {{ chapterInfo }}
      <span v-if="lineInfo" class="ml-2">({{ lineInfo }})</span>
    </NText>

    <NSpin :show="novelStore.loading">
      <div v-if="novelStore.error" class="text-red-500" :style="appStore.fontCss">
        {{ novelStore.error }}
      </div>
      <pre v-else class="whitespace-pre-wrap" :style="appStore.fontCss">
        {{ novelStore.novelContent }}
      </pre>
    </NSpin>
  </NScrollbar>
</template>

<style lang="scss" scoped></style>
