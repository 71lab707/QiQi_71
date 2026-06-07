import type { Work } from '@/types';

/**
 * 将作品数据编码到 URL 中
 * 格式: #/play/{base64_data}
 */
export function encodeWorkToUrl(work: Work): string {
  const cleanWork: Record<string, unknown> = {
    t: work.title,
    a: work.author,
    s: work.startPageId,
    p: work.pages.map((page) => ({
      i: page.id,
      img: page.imageUrl,
      tl: page.textLines,
      b: page.buttons.map((btn) => ({
        i: btn.id,
        t: btn.text,
        tgt: btn.targetPageId,
      })),
    })),
  };

  const json = JSON.stringify(cleanWork);
  // 使用 base64 编码，再用 safe 字符集转换避免 URL 问题
  const encoded = btoa(encodeURIComponent(json));
  return encoded;
}

/**
 * 从 URL 中解码作品数据
 */
export function decodeWorkFromUrl(hash: string): Work | null {
  try {
    // 支持两种格式:
    // 1. #/play/{encoded_data}
    // 2. #/player/share?d={encoded_data} (兼容旧格式)

    let encoded = '';

    // 格式1: #/play/xxxxx
    const playMatch = hash.match(/#\/play\/(.+)/);
    if (playMatch) {
      encoded = playMatch[1];
    } else {
      // 格式2: #/player/share?d=xxxxx
      const qMatch = hash.match(/[?&]d=([^&#]+)/);
      if (qMatch) {
        encoded = qMatch[1];
      } else {
        return null;
      }
    }

    if (!encoded) return null;

    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json);

    // 还原为完整 Work 对象
    const work: Work = {
      id: 'share_' + Date.now(),
      title: (data.t as string) || '分享作品',
      author: (data.a as string) || '',
      startPageId: (data.s as string) || '',
      pages: (data.p as Array<Record<string, unknown>>).map((page: Record<string, unknown>) => ({
        id: page.i as string,
        imageUrl: (page.img as string) || '',
        textLines: (page.tl as string[]) || [],
        buttons: ((page.b as Array<Record<string, unknown>>) || []).map(
          (btn: Record<string, unknown>) => ({
            id: btn.i as string,
            text: (btn.t as string) || '',
            targetPageId: (btn.tgt as string) || '',
          })
        ),
        order: 0,
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 确保 startPageId 有效
    if (!work.startPageId && work.pages.length > 0) {
      work.startPageId = work.pages[0].id;
    }

    return work;
  } catch (e) {
    console.error('Failed to decode share data:', e);
    return null;
  }
}

/**
 * 判断是否为分享链接
 */
export function isShareUrl(hash: string): boolean {
  return hash.includes('#/play/') || hash.includes('d=');
}

/**
 * 生成完整的分享 URL
 */
export function generateShareUrl(work: Work): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const encoded = encodeWorkToUrl(work);
  return `${baseUrl}#/play/${encoded}`;
}
