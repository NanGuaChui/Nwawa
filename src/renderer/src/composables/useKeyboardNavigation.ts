import { onMounted, onUnmounted } from 'vue';
import { useNovelStore } from '@renderer/stores/novel';
import { useAppStore } from '@renderer/stores/app';
import { toggleWin } from '@renderer/utils/ipc-util';
import { splitContentToLines } from '@renderer/utils/text-utils';

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
    onUp?: () => void;
    onDown?: () => void;
  } = {}
) {
  const novelStore = useNovelStore();
  const appStore = useAppStore();

  // 键盘快捷键处理
  const handleKeyDown = async (event: KeyboardEvent) => {
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
      case 'ArrowUp':
        if (options.onUp) {
          options.onUp();
        } else if (appStore.singleLineMode && novelStore.hasNovel) {
          if (appStore.currentLineIndex > 0) {
            appStore.setCurrentLineIndex(appStore.currentLineIndex - 1);
          } else if (!novelStore.isFirstChapter) {
            // 如果是第一行且有上一章，切换到上一章最后一行
            await novelStore.prevChapter();
            setTimeout(() => {
              const lines = splitContentToLines(novelStore.novelContent, appStore.maxCharsPerLine);
              appStore.setCurrentLineIndex(Math.max(0, lines.length - 1));
            }, 100);
          }
        }
        break;
      case 'ArrowDown':
        if (options.onDown) {
          options.onDown();
        } else if (appStore.singleLineMode && novelStore.hasNovel) {
          const lines = splitContentToLines(novelStore.novelContent, appStore.maxCharsPerLine);
          if (appStore.currentLineIndex < lines.length - 1) {
            appStore.setCurrentLineIndex(appStore.currentLineIndex + 1);
          } else if (!novelStore.isLastChapter) {
            // 如果是最后一行且有下一章，切换到下一章第一行
            await novelStore.nextChapter();
            appStore.setCurrentLineIndex(0);
          }
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
