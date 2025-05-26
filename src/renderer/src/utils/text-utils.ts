/**
 * 将文本内容按照最大字符数和换行符拆分成行
 * @param content 文本内容
 * @param maxChars 每行最大字符数
 * @returns 拆分后的行数组
 */
export function splitContentToLines(content: string, maxChars: number): string[] {
  const paragraphs = (content || '').split('\n').filter((line) => line.trim() !== '');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push('');
      continue;
    }

    let remaining = paragraph;
    while (remaining.length > 0) {
      lines.push(remaining.slice(0, maxChars));
      remaining = remaining.slice(maxChars);
    }
  }

  return lines;
}
