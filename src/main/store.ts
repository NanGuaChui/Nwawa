// 初始化仓库
import { ipcMain } from 'electron';
import ElectronStore from 'electron-store'; // 修改为默认导入

const initStore = () => {
  // 存储相关
  const store: Record<string, any> = new ElectronStore(); // 使用默认导入的类实例化
  ipcMain.handle('get-store-value', (_event, key) => {
    return store.get(key);
  });
  ipcMain.on('get-store-value-sync', (event, key) => {
    event.returnValue = store.get(key);
  });
  ipcMain.handle('set-store-value', (_event, key, value) => {
    store.set(key, value);
  });
  ipcMain.handle('delete-store-value', (_event, key) => {
    store.delete(key);
  });
  return store;
};

// 直接导出初始化好的 store 实例
export const store = initStore();
