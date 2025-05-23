import { app } from 'electron';
import { join } from 'path';

export const appConfig = {
  appUserModelId: 'cn.sgao.Nwawa',
  appName: '认真上班', // 添加应用名称
  logsPath: join(app.getPath('userData'), 'logs'),
  tempPath: join(app.getPath('userData'), 'temp'),
  resourcesPath: join(__dirname, '../../resources')
};

export const mainWindowConfig = {
  minWidth: 100,
  minHeight: 20,
  width: 520,
  height: 225
};
