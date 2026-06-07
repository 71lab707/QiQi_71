import type { Work } from '@/types';

const SHARE_KEY = 'd';

/**
 * 将作品数据编码到 URL 参数中（Base64）
 */
export function encodeWorkToUrl(work: Work): string {
  const cleanWork = {
    ...work,
    updatedAt: Date.now(),
  };

  const json = JSON.stringify(cleanWork);
  const encoded = btoa(encodeURIComponent(json));
  return `${SHARE_KEY}=${encoded}`;
}

/**
 * 从 URL 参数中解码作品数据
 */
export function decodeWorkFromUrl(hash: string): Work | null {
  try {
    // 从 hash 中提取参数部分: #/player/share?d=xxxxx
    const paramStart = hash.indexOf('?');
    if (paramStart === -1) return null;

    const paramsStr = hash.substring(paramStart + 1);
    // 匹配 d=xxxxx
    const match = paramsStr.match(new RegExp(`${SHARE_KEY}=(.+)`));
    if (!match) return null;

    const encoded = match[1];
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode share data:', e);
    return null;
  }
}

/**
 * 判断是否为分享链接
 */
export function isShareUrl(hash: string): boolean {
  return hash.includes(`${SHARE_KEY}=`);
}
