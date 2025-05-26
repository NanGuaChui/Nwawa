/**
 * 处理文件内容
 * @param name 文件名
 * @param content 文件内容
 */
export const processFile = (name: string, content: string | ArrayBuffer | null) => {
  return window.electron.ipcRenderer.invoke('process-file', { name, content });
};

/**
 * 获取小说列表
 * @returns Promise<string[]> 小说文件名列表
 */
export const getNovelList = (): Promise<string[]> => {
  return window.electron.ipcRenderer.invoke('get-novel-list');
};

/**
 * 根据文件名获取小说内容
 * @param fileName 文件名
 * @returns Promise<string> 小说内容
 */
export const getNovelByIndex = (fileName: string): Promise<string> => {
  return window.electron.ipcRenderer.invoke('get-novel-by-index', { fileName });
};

/**
 * 切换窗口状态
 */
export const toggleWin = () => {
  return window.electron.ipcRenderer.invoke('toggle-win');
};

/**
 * 移除当前小说
 */
export const removeNovel = () => {
  return window.electron.ipcRenderer.invoke('remove-novel');
};

/**
 * 设置窗口大小
 * @param widthOrOptions 窗口宽度或配置对象
 * @param height 窗口高度 (当第一个参数为宽度时使用)
 * @returns Promise
 */
export const setWindowSize = (widthOrPresets: number | 'normal' | 'single', height?: number) => {
  // 预设尺寸
  const presets: Record<string, { width: number; height: number }> = {
    normal: { width: 300, height: 280 },
    single: { width: 300, height: 70 }
  };

  let params: { width: number; height: number };

  // 处理不同类型的参数
  if (typeof widthOrPresets === 'number' && height !== undefined) {
    // 直接传入宽高: setWindowSize(300, 200)
    params = { width: widthOrPresets, height };
  } else {
    // 传入预设模式名称: setWindowSize('normal')
    params = presets[widthOrPresets] || presets.normal;
  }

  return window.electron.ipcRenderer.invoke('set-window-size', params);
};
