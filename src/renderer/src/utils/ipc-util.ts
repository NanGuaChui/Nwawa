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
 * 移除当前小说
 */
export const setWindoSize = (width: number, height: number) => {
  return window.electron.ipcRenderer.invoke('set-window-size', { width, height });
};
