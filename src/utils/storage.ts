import type { Work } from '@/types';

const STORAGE_KEY = 'bianjiqi_works';

// 获取所有作品
export function getAllWorks(): Work[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 根据ID获取作品
export function getWorkById(id: string): Work | null {
  const works = getAllWorks();
  return works.find((w) => w.id === id) || null;
}

// 保存作品
export function saveWork(work: Work): void {
  const works = getAllWorks();
  const index = works.findIndex((w) => w.id === work.id);
  if (index >= 0) {
    works[index] = work;
  } else {
    works.push(work);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
}

// 删除作品
export function deleteWork(id: string): void {
  const works = getAllWorks().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
}
