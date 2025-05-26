import { defineStore } from 'pinia';

export const useAppStore = defineStore('app-store', {
  persist: {
    // 从 omit 列表中移除 currentLineIndex，确保它被持久化
    omit: ['bgOpacity', 'mouseOpacity']
  },
  state: () => {
    return {
      bgOpacity: 1,
      mouseOpacity: false,
      autoCheckUpdate: true,
      mouseOutTime: 10,
      singleLineMode: false,
      maxCharsPerLine: 50,
      currentLineIndex: 0,
      textAttr: {
        fontSize: 11,
        color: 'rgba(0,0,0,0.6)'
      }
    };
  },
  getters: {
    fontCss: (state) => {
      return {
        fontSize: state.textAttr.fontSize + 'px',
        color: state.textAttr.color
      };
    },
    // 添加计算背景颜色的getter
    bgColor: (state) => {
      return `rgba(255, 255, 255, ${state.bgOpacity})`;
    }
  },
  actions: {
    setBgOpacity(bgOpacity: number) {
      this.bgOpacity = bgOpacity;
    },
    setMouseOpacity(mouseOpacity: boolean) {
      this.mouseOpacity = mouseOpacity;
    },
    setMouseOutTime(time: number) {
      this.mouseOutTime = Math.max(1, Math.min(60, time)); // 限制在1-60秒范围内
    },
    setTextAttr(values) {
      const { mouseOutTime, maxCharsPerLine, ...textAttr } = values;
      this.textAttr = { ...textAttr };
      this.mouseOutTime = mouseOutTime || 10;
      if (maxCharsPerLine) {
        this.maxCharsPerLine = maxCharsPerLine;
      }
    },
    setSingleLineMode(value: boolean) {
      // 只有在首次启用单行模式时才重置行索引
      const oldValue = this.singleLineMode;
      this.singleLineMode = value;

      // 只有从关闭状态切换到开启状态时才重置行索引
      if (value && !oldValue) {
        this.currentLineIndex = 0;
      }
    },
    setMaxCharsPerLine(value: number) {
      this.maxCharsPerLine = Math.max(10, Math.min(200, value)); // 限制在10-200之间
    },
    setCurrentLineIndex(value: number) {
      this.currentLineIndex = Math.max(0, value);
    }
  }
});
