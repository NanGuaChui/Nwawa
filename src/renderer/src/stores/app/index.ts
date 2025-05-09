import { defineStore } from 'pinia';

export const useAppStore = defineStore('app-store', {
  persist: {
    omit: ['bgOpacity', 'mouseOpacity']
  },
  state: () => {
    return {
      bgOpacity: 1,
      mouseOpacity: false,
      autoCheckUpdate: true,
      mouseOutTime: 10,
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
      const { mouseOutTime, ...textAttr } = values;
      this.textAttr = { ...textAttr };
      this.mouseOutTime = mouseOutTime || 10;
    }
  }
});
