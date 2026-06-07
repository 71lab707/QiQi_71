// 按钮数据
export interface TeaseButton {
  id: string;
  text: string;           // 按钮显示文字
  targetPageId: string;   // 跳转目标页面ID（'end' 表示结束）
}

// 页面数据（仿 Milovana WebTease 的单页结构）
export interface TeasePage {
  id: string;
  imageUrl: string;       // 图片URL或Base64
  textLines: string[];    // 分条文字数组（逐条显示）
  buttons: TeaseButton[]; // 页面按钮列表
  order: number;          // 页面顺序
}

// 作品/Tease 数据结构
export interface Work {
  id: string;
  title: string;          // 作品名称（标题）
  author: string;         // 作者姓名
  pages: TeasePage[];     // 页面数组
  startPageId: string;    // 起始页ID
  createdAt: number;
  updatedAt: number;
}
