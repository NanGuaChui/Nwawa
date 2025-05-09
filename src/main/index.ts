import { appConfig } from './config';
import { createWindow } from './main-window';
import { electronApp, optimizer, platform } from '@electron-toolkit/utils';
import { app, BrowserWindow } from 'electron';
import { initTrayIcon } from './trayIcon';
import { FileService } from './fileService';
import { registerIpcHandlers } from './ipcHandlers';
import { initAutoUpdater } from './updateService';

// 主窗口
let mainWindow: BrowserWindow;

// 应用准备就绪
app.whenReady().then(() => {
  // 设置user model
  electronApp.setAppUserModelId(appConfig.appUserModelId);

  // 在开发中默认使用 F12 打开或关闭 DevTools
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // 创建缓存目录
  FileService.createTempPath();

  // 创建窗口
  mainWindow = createWindow();

  // 初始化自动更新
  initAutoUpdater(mainWindow);

  // 初始化托盘图标
  initTrayIcon(app, mainWindow, {
    tooltipText: appConfig.appName,
    menuTemplate: {
      showLabel: '显示',
      exitLabel: '退出'
    }
  });

  // 注册IPC处理器
  registerIpcHandlers(mainWindow);

  // 激活应用（点击dock栏图标、任务栏图标）
  app.on('activate', () => {
    if (!mainWindow.isMinimized()) {
      mainWindow.show();
    }
  });
});

// 当所有窗口都关闭时退出，除了macOS
app.on('window-all-closed', () => {
  if (!platform.isMacOS) {
    app.quit();
  }
});

// 退出应用之前（手动关闭一些资源，防止出现意外关闭错误提示）
app.on('before-quit', async (e) => {
  e.preventDefault();
  // 销毁主窗口
  mainWindow.destroy();
  // 退出应用
  app.exit();
});
