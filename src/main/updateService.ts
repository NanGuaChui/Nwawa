import { ipcMain, BrowserWindow, app } from 'electron';
import electronUpdater from 'electron-updater';
import { logger } from './logger';
import path from 'path';

const { autoUpdater } = electronUpdater;

// 配置日志
autoUpdater.logger = logger;
autoUpdater.autoDownload = false;

// 在开发环境中强制使用开发更新配置
if (!app.isPackaged) {
  autoUpdater.forceDevUpdateConfig = true;
  logger.info('已强制启用开发环境更新配置');
}

// 初始化自动更新配置
export function initAutoUpdater(mainWindow: BrowserWindow) {
  // 发送更新消息到渲染进程
  const sendUpdateMessage = (message: any) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      logger.info('发送更新消息:', message);
      mainWindow.webContents.send('update-message', message);
    }
  };

  // 确保设置了更新源URL
  if (app.isPackaged) {
    try {
      // 读取package.json中的配置信息
      const packageInfo = require(path.join(app.getAppPath(), 'package.json'));
      logger.info('应用信息:', {
        version: app.getVersion(),
        name: packageInfo.name,
        repository: packageInfo.repository,
        publish: packageInfo.build?.publish
      });

      // 输出当前autoUpdater配置
      logger.info('autoUpdater配置:', {
        autoDownload: autoUpdater.autoDownload,
        allowPrerelease: autoUpdater.allowPrerelease,
        currentVersion: autoUpdater.currentVersion,
        channel: autoUpdater.channel
      });
    } catch (err) {
      logger.error('读取package.json失败:', err);
    }
  } else {
    logger.info('开发模式下，自动更新可能无法正常工作');
  }

  // 检查更新
  ipcMain.handle('update:check-for-updates', async () => {
    logger.info('开始检查更新...');
    try {
      // 直接返回Promise，让错误被传递到渲染进程
      return await autoUpdater.checkForUpdates();
    } catch (error) {
      logger.error('检查更新失败:', error);
      sendUpdateMessage({ type: 'error', err: error });
      throw error; // 重新抛出以便在渲染进程中捕获
    }
  });

  // 下载更新
  ipcMain.handle('update:download-update', async () => {
    logger.info('开始下载更新...');
    try {
      return await autoUpdater.downloadUpdate();
    } catch (error) {
      logger.error('下载更新失败:', error);
      sendUpdateMessage({ type: 'error', err: error });
      throw error;
    }
  });

  // 安装更新
  ipcMain.handle('update:quit-and-install', () => {
    logger.info('准备退出并安装更新...');
    autoUpdater.quitAndInstall();
  });

  // 配置自动更新事件
  autoUpdater.on('checking-for-update', () => {
    logger.info('检查更新中...');
    sendUpdateMessage({ type: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    sendUpdateMessage({ type: 'available', info });
  });

  autoUpdater.on('update-not-available', (info) => {
    sendUpdateMessage({ type: 'not-available', info });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    sendUpdateMessage({ type: 'progress', progressObj });
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendUpdateMessage({ type: 'downloaded', info });
  });

  autoUpdater.on('error', (err) => {
    logger.error('自动更新错误:', err);
    sendUpdateMessage({ type: 'error', err });
  });

  // 检查是否可以手动设置更新服务器
  if (process.env.UPDATE_URL) {
    logger.info('手动设置更新服务器:', process.env.UPDATE_URL);
    try {
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: process.env.UPDATE_URL
      });
    } catch (err) {
      logger.error('设置更新服务器失败:', err);
    }
  }

  // 在开发环境中提供一个模拟的更新检查机制
  if (!app.isPackaged) {
    // 添加调试IPC
    ipcMain.handle('debug:simulate-update-available', () => {
      logger.info('模拟发现新版本');
      sendUpdateMessage({
        type: 'available',
        info: {
          version: '1.0.0-debug',
          releaseNotes: '# 调试版本\n这是一个模拟的更新通知。'
        }
      });
    });

    ipcMain.handle('debug:simulate-update-not-available', () => {
      logger.info('模拟未发现新版本');
      sendUpdateMessage({ type: 'not-available' });
    });
  }
}

// 封装一个手动检查更新的函数
export function checkForUpdates() {
  logger.info('手动检查更新...');
  return autoUpdater.checkForUpdates().catch((err) => {
    logger.error('手动检查更新失败:', err);
    throw err;
  });
}
