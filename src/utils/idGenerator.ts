// 生成唯一ID
export function generateId(): string {
  return `elem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 生成作品ID
export function generateWorkId(): string {
  return `work_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
