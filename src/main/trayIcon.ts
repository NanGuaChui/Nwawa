import { BrowserWindow, Menu, Tray } from 'electron';
import { join } from 'path';
import { appConfig } from './config';

interface TrayIconOptions {
  iconPath?: string;
  tooltipText?: string;
  menuTemplate?: {
    showLabel?: string;
    exitLabel?: string;
  };
}

export const initTrayIcon = (app: Electron.App, mainWindow: BrowserWindow, options?: TrayIconOptions) => {
  // 创建托盘图标
  const trayIconPath = options?.iconPath || join(__dirname, '../../resources/tray.png');
  const tray = new Tray(trayIconPath);

  // 设置托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    { label: options?.menuTemplate?.showLabel || '显示', click: () => mainWindow.show() },
    { label: options?.menuTemplate?.exitLabel || '退出', click: () => app.quit() }
  ]);
  tray.setToolTip(options?.tooltipText || appConfig.appName); // 使用配置中的应用名称
  tray.setContextMenu(contextMenu);

  // 点击托盘图标显示主窗口
  tray.on('click', () => {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
  });

  return tray; // 返回 tray 实例以便后续操作
};
