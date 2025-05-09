<script lang="ts" setup>
import { useAppStore } from '@renderer/stores/app';
import { ref, onMounted, onUnmounted } from 'vue';
import EmptyUpload from './EmptyUpload.vue';
import { useNovelStore } from '@renderer/stores/novel';
import NovelContent from './NovelContent.vue';
import Setting from '@renderer/views/setting/Index.vue';
import ReaderControls from '@renderer/views/reader/ReaderControls.vue';
import { useKeyboardNavigation } from '@renderer/composables/useKeyboardNavigation';
import { toggleWin } from '@renderer/utils/ipc-util';

const appStore = useAppStore();
const novelStore = useNovelStore();

const readerRef = ref<HTMLElement | null>(null);
const settingRef = ref<InstanceType<typeof Setting> | null>(null);
const hideTimer = ref<number | null>(null);

// 使用键盘导航composable
useKeyboardNavigation();

const openSetting = () => {
  settingRef.value?.toggle();
};

// 鼠标移出事件处理
const handleMouseLeave = () => {
  if (appStore.mouseOpacity) {
    // 设置X秒后隐藏窗口
    hideTimer.value = window.setTimeout(() => {
      toggleWin();
    }, appStore.mouseOutTime * 1000);
  }
};

// 鼠标移入事件处理
const handleMouseEnter = () => {
  if (appStore.mouseOpacity) {
    // 清除计时器
    if (hideTimer.value !== null) {
      clearTimeout(hideTimer.value);
      hideTimer.value = null;
    }
  }
};

onMounted(() => {
  // 加载小说列表
  novelStore.refresh();

  // 设置拖放事件处理
  if (readerRef.value) {
    readerRef.value.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
  }

  // 为body添加鼠标事件监听
  document.body.addEventListener('mouseenter', handleMouseEnter);
  document.body.addEventListener('mouseleave', handleMouseLeave);
});

onUnmounted(() => {
  // 清除事件监听
  document.body.removeEventListener('mouseenter', handleMouseEnter);
  document.body.removeEventListener('mouseleave', handleMouseLeave);

  // 清除计时器
  if (hideTimer.value !== null) {
    clearTimeout(hideTimer.value);
    hideTimer.value = null;
  }
});
</script>

<template>
  <div
    ref="readerRef"
    class="h-screen flex flex-col"
    :class="{ 'opacity-0 hover:opacity-100 transition-opacity': appStore.mouseOpacity }"
  >
    <ReaderControls :on-open-setting="openSetting" />

    <div class="flex-1 transition rounded overflow-y-auto" :style="{ backgroundColor: appStore.bgColor }">
      <NovelContent v-if="novelStore.hasNovel" />
      <EmptyUpload v-else />
    </div>
  </div>
  <Setting ref="settingRef" />
</template>

<style lang="scss" scoped></style>
