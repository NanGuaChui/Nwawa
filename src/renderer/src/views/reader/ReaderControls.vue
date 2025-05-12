<script lang="ts" setup>
import { useAppStore } from '@renderer/stores/app';
import { useNovelStore } from '@renderer/stores/novel';
import { removeNovel } from '@renderer/utils/ipc-util';
import IconButton from '@renderer/components/IconButton.vue';
import { computed } from 'vue';
import UpdateNotification from './UpdateNotification.vue';

const props = defineProps<{ onOpenSetting: () => void }>();

const appStore = useAppStore();
const novelStore = useNovelStore();

const switchOpacity = () => {
  appStore.setBgOpacity(appStore.bgOpacity === 0 ? 1 : 0);
};

const switchMouseOpacity = () => {
  appStore.setMouseOpacity(!appStore.mouseOpacity);
};

const onPrev = () => {
  if (novelStore.hasNovel) {
    novelStore.prevChapter();
  }
};

const onNext = () => {
  if (novelStore.hasNovel) {
    novelStore.nextChapter();
  }
};

const switchNovel = async () => {
  await removeNovel();
  novelStore.setIndex(0);
  novelStore.refresh();
};

// 按钮配置中心化管理
const buttons = computed(() => [
  { icon: 'ri:settings-4-line', text: '设置', onClick: props.onOpenSetting },
  { icon: 'ri:checkbox-multiple-blank-line', text: '切换文件', onClick: switchNovel },
  {
    icon: 'ri:mouse-line',
    class: appStore.mouseOpacity ? '!text-green-400' : '',
    text: appStore.mouseOpacity ? '关闭鼠标移出淡出' : '开启鼠标移出淡出',
    onClick: switchMouseOpacity
  },
  { icon: 'ri:a-b', text: '背景色', class: appStore.bgOpacity !== 1 ? '!text-green-400' : '', onClick: switchOpacity },
  { icon: 'ri:arrow-left-line', text: '上一页', onClick: onPrev },
  { icon: 'ri:arrow-right-line', text: '下一页', onClick: onNext },
  { icon: 'ri:drag-move-line', text: '拖动窗口', class: 'drap' }
]);
</script>

<template>
  <div class="controls flex self-end items-center p-1 opacity-0 transition-opacity">
    <UpdateNotification />
    <IconButton
      v-for="(btn, index) in buttons"
      :key="index"
      :style="appStore.fontCss"
      :icon="btn.icon"
      :text="btn.text"
      :btn-class="btn.class"
      @click="btn.onClick"
    />
  </div>
</template>
