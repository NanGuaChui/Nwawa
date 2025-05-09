import { onMounted, onUnmounted } from 'vue';
import { useNovelStore } from '@renderer/stores/novel';
import { toggleWin } from '@renderer/utils/ipc-util';

/**
 * 提供小说阅读器的键盘导航功能
 * @param options 自定义配置项
 * @returns 键盘导航相关方法
 */
export function useKeyboardNavigation(
  options: {
    onEscape?: () => void;
    onPrev?: () => void;
    onNext?: () => void;
  } = {}
) {
  const novelStore = useNovelStore();

  // 键盘快捷键处理
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        if (options.onPrev) {
          options.onPrev();
        } else if (novelStore.hasNovel) {
          novelStore.prevChapter();
        }
        break;
      case 'ArrowRight':
        if (options.onNext) {
          options.onNext();
        } else if (novelStore.hasNovel) {
          novelStore.nextChapter();
        }
        break;
      case 'Escape':
        if (options.onEscape) {
          options.onEscape();
        } else {
          toggleWin();
        }
        break;
    }
  };

  onMounted(() => {
    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    handleKeyDown
  };
}
