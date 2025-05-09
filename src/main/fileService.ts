import fs from 'fs/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { appConfig } from './config';
import { logger } from './logger';

export class FileService {
  /**
   * 创建临时目录
   */
  static createTempPath(): void {
    try {
      if (!existsSync(appConfig.tempPath)) {
        mkdirSync(appConfig.tempPath);
      }
    } catch (e: any) {
      if (e.code !== 'EEXIST') {
        logger.error(`创建临时目录失败: ${e.message}`);
      }
    }
  }

  /**
   * 保存网络文件到临时目录
   */
  static async saveFileByUrl(url: string, fileName: string): Promise<string> {
    this.createTempPath();

    const fetchResp = await fetch(url);
    const blob = await fetchResp.blob();

    const filePath = join(appConfig.tempPath, fileName);
    const buffer = Buffer.from(await blob.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return filePath;
  }

  /**
   * 保存Base64数据为文件
   */
  static async saveFileByBase64(base64: string, fileName: string): Promise<string> {
    this.createTempPath();

    // 去除base64数据前缀
    const commaIndex = base64.indexOf(',');
    if (commaIndex > -1) {
      base64 = base64.slice(commaIndex + 1);
    }

    const filePath = join(appConfig.tempPath, fileName);
    await fs.writeFile(filePath, Buffer.from(base64, 'base64'));

    return filePath;
  }

  /**
   * 复制文件到临时目录
   */
  static async saveFileByPath(path: string, fileName: string): Promise<string> {
    this.createTempPath();
    const filePath = join(appConfig.tempPath, fileName);
    await fs.copyFile(path, filePath);

    return filePath;
  }

  /**
   * 读取本地图片为Base64
   */
  static readLocalImageBase64(path: string): string {
    const data = readFileSync(path);
    return Buffer.from(data).toString('base64');
  }

  /**
   * 清理缓存文件
   */
  static clearCacheFiles(excludeFiles: string[] = []): void {
    try {
      const files = readdirSync(appConfig.tempPath);
      if (files.length === 0) return;

      files.forEach((file) => {
        const filePath = join(appConfig.tempPath, file);
        if (!excludeFiles.includes(filePath)) {
          unlinkSync(filePath);
        }
      });
    } catch (error: any) {
      logger.error(`清理缓存文件失败: ${error.message}`);
    }
  }

  /**
   * 获取缓存文件列表
   */
  static getCacheFiles(): { name: string; data: string }[] {
    try {
      const files = readdirSync(appConfig.tempPath);
      if (files.length === 0) return [];

      return files.map((file) => ({
        name: file,
        data: readFileSync(join(appConfig.tempPath, file)).toString('base64')
      }));
    } catch (error: any) {
      logger.error(`获取缓存文件失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 添加缓存文件
   */
  static addCacheFiles(cacheFiles: { name: string; data: string }[]): boolean {
    if (!cacheFiles || cacheFiles.length === 0) return false;

    let success = false;
    cacheFiles.forEach((file) => {
      try {
        writeFileSync(join(appConfig.tempPath, file.name), Buffer.from(file.data, 'base64'));
        success = true;
      } catch (error: any) {
        logger.error(`添加缓存文件失败: ${error.message}`);
      }
    });

    return success;
  }
}
