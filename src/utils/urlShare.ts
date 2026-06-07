import type { Work } from '@/types';

const SHARE_PREFIX = 'share_data=';

/**
 * 将作品数据编码到 URL 参数中（Base64 + 压缩）
 */
export function encodeWorkToUrl(work: Work): string {
  // 移除不需要持久化的字段
  const cleanWork = {
    ...work,
    updatedAt: Date.now(),
  };

  const json = JSON.stringify(cleanWork);
  const encoded = btoa(encodeURIComponent(json));
  return `${SHARE_PREFIX}${encoded}`;
}

/**
 * 从 URL 参数中解码作品数据
 */
export function decodeWorkFromUrl(hash: string): Work | null {
  try {
    // 从 hash 中提取参数部分
    const paramStart = hash.indexOf('?');
    if (paramStart === -1) return null;

    const params = hash.substring(paramStart + 1);
    const dataMatch = params.match(/data=(.+)/);
    if (!dataMatch) return null;

    const encoded = dataMatch[1];
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * 判断是否为分享链接
 */
export function isShareUrl(hash: string): boolean {
  return hash.includes(SHARE_PREFIX) || hash.includes('data=');
}
