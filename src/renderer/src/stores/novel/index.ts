import { getNovelByIndex, getNovelList } from '@renderer/utils/ipc-util';
import { defineStore } from 'pinia';

export const useNovelStore = defineStore('novel-store', {
  persist: {
    omit: ['novelList', 'loading', 'error']
  },
  state: () => {
    return {
      currentIndex: 0,
      novelList: [] as string[],
      novelContent: '',
      loading: false,
      error: null as string | null
    };
  },
  getters: {
    hasNovel: (state) => state.novelList.length > 0,
    currentNovel: (state) => state.novelList[state.currentIndex] || null,
    isFirstChapter: (state) => state.currentIndex === 0,
    isLastChapter: (state) => state.currentIndex === state.novelList.length - 1,
    // 新增：获取章节总数
    chapterCount: (state) => state.novelList.length
  },
  actions: {
    setIndex(index: number) {
      // 确保索引在有效范围内
      if (index < 0) {
        this.currentIndex = 0;
      } else if (index >= this.novelList.length) {
        this.currentIndex = Math.max(0, this.novelList.length - 1);
      } else {
        this.currentIndex = index;
      }
    },
    async refresh() {
      this.loading = true;
      this.error = null;

      try {
        const novelList = await getNovelList();
        this.novelList = novelList;

        // 如果有章节但当前索引超出范围，重置为0
        if (novelList.length > 0 && this.currentIndex >= novelList.length) {
          this.currentIndex = 0;
        }

        // 有章节时自动加载内容
        if (novelList.length > 0) {
          await this.loadByIndex();
        }
      } catch (err) {
        console.error('获取小说列表失败:', err);
        this.error = String(err);
        this.novelList = [];
      } finally {
        this.loading = false;
      }
    },
    async loadByIndex() {
      if (!this.novelList.length) return;

      this.loading = true;
      this.error = null;
      // 确保索引在有效范围内
      this.setIndex(this.currentIndex);

      try {
        const fileName = this.novelList[this.currentIndex];
        if (!fileName) {
          throw new Error('无效的章节');
        }
        this.novelContent = await getNovelByIndex(fileName);
      } catch (err) {
        console.error('加载小说内容失败:', err);
        this.error = String(err);
        this.novelContent = `加载失败: ${this.error}`;
      } finally {
        this.loading = false;
      }
    },
    async prevChapter() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      } else {
        // 循环到最后一章
        this.currentIndex = this.novelList.length - 1;
      }
      await this.loadByIndex();
    },
    async nextChapter() {
      if (this.currentIndex < this.novelList.length - 1) {
        this.currentIndex++;
      } else {
        // 循环到第一章
        this.currentIndex = 0;
      }
      await this.loadByIndex();
    }
  }
});
