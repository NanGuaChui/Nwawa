import fs from 'fs/promises';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { appConfig } from './config';
import { logger } from './logger';
import { FileService } from './fileService';

export class NovelService {
  /**
   * 根据索引获取小说内容
   */
  static getNovelByIndex(fileName: string): string {
    const filePath = join(appConfig.tempPath, fileName);
    return readFileSync(filePath, 'utf-8');
  }

  /**
   * 获取小说章节列表
   */
  static getNovelList(): string[] | { success: boolean; message: string; error?: string } {
    try {
      const files = readdirSync(appConfig.tempPath);

      // 按文件名中的 index 排序
      return files
        .filter((file) => file.match(/_chapter(\d+)\.txt$/))
        .sort((a, b) => {
          const indexA = parseInt(a.match(/_chapter(\d+)\.txt$/)?.[1] || '0', 10);
          const indexB = parseInt(b.match(/_chapter(\d+)\.txt$/)?.[1] || '0', 10);
          return indexA - indexB;
        });
    } catch (error: any) {
      logger.error(`获取小说列表失败: ${error.message}`);
      return {
        success: false,
        message: '获取文件失败',
        error: error.message
      };
    }
  }

  /**
   * 处理文件并按章节保存
   */
  static async processFile(
    name: string,
    content: string
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // 使用正则表达式匹配章节
      const chapterRegex = /(?:^|\n)(第[一二三四五六七八九十百千0-9]+[章节卷篇])\s+/g;
      const parts: string[] = [];
      let match: RegExpExecArray | null;
      let lastIndex = 0;

      // 遍历匹配结果，按章节拆分
      while ((match = chapterRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.slice(lastIndex, match.index).trim());
        }
        lastIndex = match.index;
      }

      if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex).trim());
      }

      // 清空缓存目录
      FileService.clearCacheFiles();

      // 保存每个部分为单独的文件
      await Promise.all(
        parts.map(async (part, index) => {
          const filePath = join(appConfig.tempPath, `${name}_chapter${index + 1}.txt`);
          await fs.writeFile(filePath, part, 'utf-8');
        })
      );

      return { success: true, message: '文件已成功按章节拆分并保存' };
    } catch (error: any) {
      logger.error(`处理文件失败: ${error.message}`);
      return {
        success: false,
        message: '文件处理失败',
        error: error.message
      };
    }
  }

  /**
   * 删除所有小说文件
   */
  static removeAllNovels(): void {
    FileService.clearCacheFiles();
  }
}
