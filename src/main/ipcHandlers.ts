import { BrowserWindow, clipboard, dialog, ipcMain, shell } from 'electron';
import { platform } from '@electron-toolkit/utils';
import * as vm from 'vm';
import { appConfig } from './config';
import { logger } from './logger';
import { FileService } from './fileService';
import { NovelService } from './novelService';

export const registerIpcHandlers = (mainWindow: BrowserWindow): void => {
  // 获取系统类型
  ipcMain.on('process-platform', (event) => {
    event.returnValue = platform;
  });

  // 打开开发者控制台
  ipcMain.handle('open-dev-tools', () => {
    mainWindow.webContents.openDevTools();
  });

  // 获取版本信息
  ipcMain.handle('get-app-version', (_, app) => {
    return app.getVersion();
  });

  // 文件操作相关
  ipcMain.handle('save-file-by-url', async (_, url: string, fileName: string) => {
    return await FileService.saveFileByUrl(url, fileName);
  });

  ipcMain.handle('save-file-by-base64', async (_, base64: string, fileName: string) => {
    return await FileService.saveFileByBase64(base64, fileName);
  });

  ipcMain.handle('save-file-by-path', async (_, path: string, fileName: string) => {
    return await FileService.saveFileByPath(path, fileName);
  });

  ipcMain.handle('read-local-image-base64', (_, path: string) => {
    return FileService.readLocalImageBase64(path);
  });

  ipcMain.handle('clear-cache-files', (_, images: string[]) => {
    FileService.clearCacheFiles(images);
  });

  ipcMain.handle('get-cache-files', () => {
    return FileService.getCacheFiles();
  });

  ipcMain.handle('add-cache-files', (_, cacheFiles: { name: string; data: string }[]) => {
    return FileService.addCacheFiles(cacheFiles);
  });

  // 小说相关
  ipcMain.handle('get-novel-by-index', (_, { fileName }) => {
    return NovelService.getNovelByIndex(fileName);
  });

  ipcMain.handle('get-novel-list', () => {
    return NovelService.getNovelList();
  });

  ipcMain.handle('process-file', async (_, { name, content }: { name: string; content: string }) => {
    return await NovelService.processFile(name, content);
  });

  ipcMain.handle('remove-novel', () => {
    NovelService.removeAllNovels();
  });

  // 系统操作相关
  ipcMain.handle('open-cache-dir', () => {
    return shell.openPath(appConfig.tempPath);
  });

  ipcMain.handle('open-log-dir', () => {
    return shell.openPath(appConfig.logsPath);
  });

  ipcMain.handle('set-proxy', (_, proxyUrl: string) => {
    return mainWindow?.webContents.session.setProxy({ proxyRules: proxyUrl });
  });

  ipcMain.handle('clipboard-write-text', (_, text: string) => {
    clipboard.writeText(text);
  });

  ipcMain.handle('select-file-and-read', (_, extensions = ['*']) => {
    const result = dialog.showOpenDialogSync(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Select File', extensions }]
    });
    if (result && result[0]) {
      return FileService.readLocalImageBase64(result[0]);
    }
    return null;
  });

  ipcMain.handle('execute-js', (_, jsCode: string) => {
    try {
      const context = vm.createContext(Object.assign({ fetch: fetch }, global));
      return vm.runInContext(jsCode, context);
    } catch (error: any) {
      logger.error(`执行JS脚本失败: ${error.message}`);
      return { error: error.message };
    }
  });

  ipcMain.handle('show-item-in-folder', (_, filePath: string) => {
    return shell.showItemInFolder(filePath);
  });

  ipcMain.handle('toggle-win', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  ipcMain.handle('set-window-size', (_, { width, height }) => {
    mainWindow.setSize(width, height, true);
  });
};
