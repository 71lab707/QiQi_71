import { useEffect, useRef, useState } from 'react';
import { useWorkStore } from '@/store/useWorkStore';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  Eye,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Type,
  MousePointerClick,
  PenLine,
  FileText,
  ArrowRight,
  GripVertical,
  X,
  PanelLeftClose,
  PanelLeft,
  Share2,
  Check,
} from 'lucide-react';
import { encodeWorkToUrl, generateShareUrl } from '@/utils/urlShare';

export default function EditorPage() {
  const {
    currentWork,
    editingPageId,
    setTitle,
    setAuthor,
    addPage,
    deletePage,
    duplicatePage,
    updatePage,
    setEditingPage,
    movePage,
    addTextLine,
    updateTextLine,
    deleteTextLine,
    moveTextLine,
    addButton,
    updateButton,
    deleteButton,
    persist,
    createNewWork,
  } = useWorkStore();

  const navigate = useNavigate();
  const imageInputRef = useRef<HTMLInputElement>(null);

  // 移动端：侧边栏展开状态
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentWork.id) {
      createNewWork();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => persist(), 3000);
    return () => clearInterval(timer);
  }, [persist]);

  const currentPage = currentWork.pages.find((p) => p.id === editingPageId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPageId) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updatePage(editingPageId, { imageUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePreview = () => {
    persist();
    navigate(`/player/${currentWork.id}`);
  };

  // 生成分享链接
  const handleShare = () => {
    persist();
    const url = generateShareUrl(currentWork);
    setShareUrl(url);
    setShowShareModal(true);
    setCopied(false);
  };

  // 复制分享链接
  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 选择页面后关闭移动端侧栏
  const handleSelectPage = (pageId: string) => {
    setEditingPage(pageId);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-200">
      {/* ====== 顶部栏（响应式）====== */}
      <header className="h-12 sm:h-14 bg-black border-b border-gray-800 flex items-center justify-between px-3 sm:px-5 shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* 移动端：侧边栏切换按钮 */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700 shrink-0"
          >
            {sidebarOpen ? <X className="w-4 h-4 text-gray-400" /> : <PanelLeft className="w-4 h-4 text-gray-400" />}
          </button>

          <div className="w-8 h-8 rounded-lg bg-gray-800 hidden sm:flex items-center justify-center border border-gray-700 shrink-0">
            <PenLine className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm font-semibold text-gray-300 tracking-wide hidden sm:inline">
            编辑器
          </span>
        </div>

        {/* 作品名称 / 作者（移动端精简） */}
        <div className="hidden sm:flex items-center gap-3">
          <input
            type="text"
            value={currentWork.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="作品名称"
            className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500 w-44 transition-colors"
          />
          <input
            type="text"
            value={currentWork.author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="作者姓名"
            className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500 w-36 transition-colors"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {currentWork.title && (
            <span className="text-xs text-gray-500 max-w-[80px] truncate sm:hidden">{currentWork.title}</span>
          )}
          <button
            onClick={persist}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded-md text-xs transition-colors border border-gray-700 min-h-[36px]"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">保存</span>
          </button>
          <button
            onClick={handlePreview}
            className="flex items-center gap-1 px-3 sm:px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs font-medium transition-colors min-h-[36px]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">预览</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-3 sm:px-4 py-1.5 bg-blue-700/80 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors min-h-[36px]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">分享</span>
          </button>
        </div>
      </header>

      {/* ====== 主编辑区 ====== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ====== 左侧页面列表（响应式）====== */}
        <>
          {/* 遮罩层（移动端） */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-30 sm:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`absolute sm:relative z-40 sm:z-auto w-56 bg-black/95 sm:bg-black/40 border-r border-gray-800/50 flex flex-col shrink-0 transition-transform duration-200 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
            } h-full`}
          >
            {/* 页面列表头部 */}
            <div className="px-3 py-3 border-b border-gray-800/50 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                页面 ({currentWork.pages.length})
              </span>
              <button
                onClick={() => { addPage(); setSidebarOpen(false); }}
                className="w-7 h-7 rounded bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors min-h-[36px]"
                title="添加页面"
              >
                <Plus className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>

            {/* 页面列表内容 */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {currentWork.pages.map((page, index) => (
                <div
                  key={page.id}
                  onClick={() => handleSelectPage(page.id)}
                  className={`group relative rounded-lg border p-2.5 cursor-pointer transition-all ${
                    editingPageId === page.id
                      ? 'bg-gray-800/70 border-gray-600'
                      : 'bg-gray-900/30 border-gray-800/50 hover:border-gray-700 hover:bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-mono text-gray-600 mt-0.5 shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 truncate">
                        {page.textLines[0]?.substring(0, 30) || '(空页面)'}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {page.imageUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-600">
                            <ImageIcon className="w-2.5 h-2.5" />图
                          </span>
                        )}
                        {page.textLines.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-600">
                            <Type className="w-2.5 h-2.5" />{page.textLines.length}行
                          </span>
                        )}
                        {page.buttons.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-600">
                            <MousePointerClick className="w-2.5 h-2.5" />{page.buttons.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); movePage(page.id, 'up'); }}
                      disabled={index === 0}
                      className="w-6 h-6 rounded flex items-center justify-center bg-gray-700/80 hover:bg-gray-600 text-gray-400 transition-colors disabled:opacity-30 min-h-[28px]"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); movePage(page.id, 'down'); }}
                      disabled={index === currentWork.pages.length - 1}
                      className="w-6 h-6 rounded flex items-center justify-center bg-gray-700/80 hover:bg-gray-600 text-gray-400 transition-colors disabled:opacity-30 min-h-[28px]"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicatePage(page.id); }}
                      className="w-6 h-6 rounded flex items-center justify-center bg-gray-700/80 hover:bg-blue-600 text-gray-400 hover:text-white transition-colors min-h-[28px]"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                      className="w-6 h-6 rounded flex items-center justify-center bg-gray-700/80 hover:bg-red-600 text-gray-400 hover:text-white transition-colors min-h-[28px]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {page.id === currentWork.startPageId && (
                    <div className="absolute top-1 left-1.5">
                      <span className="text-[9px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded font-mono">START</span>
                    </div>
                  )}
                </div>
              ))}

              {currentWork.pages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                  <FileText className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs">点击 + 添加页面</p>
                </div>
              )}
            </div>

            {/* 移动端底部关闭提示 */}
            <div className="sm:hidden px-3 py-2 border-t border-gray-800/50 text-center">
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-xs text-gray-500 w-full py-1.5 rounded bg-gray-800/50 active:bg-gray-700"
              >
                点击空白处或此处关闭
              </button>
            </div>
          </aside>
        </>

        {/* ====== 中间编辑区（响应式全宽）====== */}
        <main className="flex-1 overflow-y-auto">
          {currentPage ? (
            <div className="max-w-2xl mx-auto py-4 sm:py-6 px-4 sm:px-6 space-y-5 sm:space-y-6">
              {/* 移动端：当前页指示 + 作品信息 */}
              <div className="sm:hidden flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 px-2 py-1.5 rounded bg-gray-900/50 border border-gray-800/50"
                >
                  <PanelLeft className="w-3.5 h-3.5" />
                  切换页面 ({currentWork.pages.indexOf(currentPage) + 1}/{currentWork.pages.length})
                </button>
              </div>

              {/* 移动端：作品名/作者输入（在编辑区顶部显示） */}
              <div className="sm:hidden flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={currentWork.title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="作品名称"
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                />
                <input
                  type="text"
                  value={currentWork.author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="作者姓名"
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                />
              </div>

              {/* ---- 图片编辑区 ---- */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <ImageIcon className="w-3.5 h-3.5" />
                  页面图片
                </label>

                {currentPage.imageUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border border-gray-800 bg-gray-950">
                    <img src={currentPage.imageUrl} alt="" className="w-full max-h-[35vh] sm:max-h-[40vh] object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm transition-colors">
                        <ImageIcon className="w-4 h-4 inline mr-1.5" />
                        更换
                        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <button
                        onClick={() => updatePage(currentPage.id, { imageUrl: '' })}
                        className="px-4 py-2 bg-red-900/70 hover:bg-red-800 text-red-200 rounded-lg text-sm transition-colors"
                      >
                        移除
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-36 sm:h-44 rounded-lg border-2 border-dashed border-gray-800 hover:border-gray-600 cursor-pointer transition-colors bg-gray-900/20"
                  >
                    <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <ImageIcon className="w-8 h-8 text-gray-700 mb-2" />
                    <span className="text-sm text-gray-500">点击上传图片</span>
                    <span className="text-xs text-gray-600 mt-1">JPG / PNG / GIF</span>
                  </label>
                )}
              </div>

              {/* ---- 分条文字编辑区 ---- */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Type className="w-3.5 h-3.5" />
                    文字 ({currentPage.textLines.length} 条)
                  </label>
                  <button
                    onClick={() => addTextLine(currentPage.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded-md text-xs transition-colors min-h-[36px]"
                  >
                    <Plus className="w-3 h-3" />
                    添加一行
                  </button>
                </div>

                <div className="space-y-2">
                  {currentPage.textLines.map((line, index) => (
                    <div
                      key={index}
                      className="group flex items-start gap-2 bg-gray-900/40 border border-gray-800/60 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3"
                    >
                      <div className="flex flex-col items-center gap-1 pt-1.5 sm:pt-1 shrink-0">
                        <GripVertical className="w-3.5 h-3.5 text-gray-700 cursor-grab" />
                        <span className="text-[9px] font-mono text-gray-700">{index + 1}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={line}
                          onChange={(e) =>
                            updateTextLine(currentPage.id, index, e.target.value)
                          }
                          className="w-full bg-transparent border-b border-transparent hover:border-gray-700 focus:border-gray-500 focus:bg-gray-800/50 rounded-t px-2 py-1.5 text-sm text-gray-200 focus:outline-none transition-all placeholder:text-gray-600"
                          placeholder={`第 ${index + 1} 行...`}
                        />
                      </div>

                      <div className="flex items-center gap-0.5 pt-1.5 sm:pt-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveTextLine(currentPage.id, index, 'up')}
                          disabled={index === 0}
                          className="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-20 min-h-[32px]"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveTextLine(currentPage.id, index, 'down')}
                          disabled={index === currentPage.textLines.length - 1}
                          className="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-20 min-h-[32px]"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTextLine(currentPage.id, index)}
                          className="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors min-h-[32px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {currentPage.textLines.length === 0 && (
                    <div className="text-center py-8 text-gray-700 text-sm border border-dashed border-gray-800/50 rounded-lg">
                      点击上方「添加一行」开始编写文字
                    </div>
                  )}
                </div>
              </div>

              {/* ---- 按钮编辑区 ---- */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    按钮 ({currentPage.buttons.length})
                  </label>
                  <button
                    onClick={() => addButton(currentPage.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded-md text-xs transition-colors min-h-[36px]"
                  >
                    <Plus className="w-3 h-3" />
                    添加按钮
                  </button>
                </div>

                <div className="space-y-2">
                  {currentPage.buttons.map((btn) => (
                    <div key={btn.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-gray-900/40 border border-gray-800/60 rounded-lg px-3 sm:px-4 py-3">
                      <div className="flex-1 min-w-0 w-full">
                        <label className="text-[10px] text-gray-600 block mb-1">按钮文字</label>
                        <input
                          type="text"
                          value={btn.text}
                          onChange={(e) =>
                            updateButton(currentPage.id, btn.id, { text: e.target.value })
                          }
                          className="w-full bg-gray-800/80 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500 transition-colors"
                          placeholder="按钮文字..."
                        />
                      </div>

                      <div className="w-full sm:w-40 shrink-0">
                        <label className="text-[10px] text-gray-600 block mb-1">跳转到</label>
                        <select
                          value={btn.targetPageId}
                          onChange={(e) =>
                            updateButton(currentPage.id, btn.id, { targetPageId: e.target.value })
                          }
                          className="w-full bg-gray-800/80 border border-gray-700/50 rounded-lg px-2 py-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500 transition-colors appearance-none"
                        >
                          <option value="">-- 选择 --</option>
                          <option value="end">结束</option>
                          {currentWork.pages
                            .filter((p) => p.id !== currentPage.id)
                            .map((p) => {
                              const idx = currentWork.pages.indexOf(p) + 1;
                              return (
                                <option key={p.id} value={p.id}>
                                  第{idx}页
                                </option>
                              );
                            })}
                        </select>
                      </div>

                      <button
                        onClick={() => deleteButton(currentPage.id, btn.id)}
                        className="shrink-0 self-end sm:self-center w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {currentPage.buttons.length === 0 && (
                    <div className="text-center py-6 text-gray-700 text-sm border border-dashed border-gray-800/50 rounded-lg">
                      暂无按钮，点击上方添加交互选项
                    </div>
                  )}
                </div>
              </div>

              {/* ---- 实时预览 ---- */}
              <div className="pt-4 border-t border-gray-800/50">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  <Eye className="w-3.5 h-3.5" />
                  预览效果
                </label>
                <div className="rounded-xl border border-gray-800/60 bg-black/40 p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="text-center">
                    <h3 className="text-base sm:text-lg font-bold text-white">{currentWork.title || '未命名作品'}</h3>
                    {currentWork.author && (
                      <p className="text-xs text-gray-500 mt-0.5">by {currentWork.author}</p>
                    )}
                  </div>

                  {currentPage.imageUrl && (
                    <div className="rounded overflow-hidden border border-gray-800/40">
                      <img src={currentPage.imageUrl} alt="" className="w-full max-h-[160px] sm:max-h-[200px] object-contain bg-gray-950" />
                    </div>
                  )}

                  {currentPage.textLines.length > 0 && (
                    <div className="space-y-1.5 sm:space-y-2">
                      {currentPage.textLines.slice(0, Math.min(3, currentPage.textLines.length)).map((line, i) => (
                        <p key={i} className="text-xs sm:text-sm text-gray-400 text-center whitespace-pre-wrap">
                          {i < 2 ? line : i === 2 ? '...（点击继续）' : ''}
                        </p>
                      ))}
                      {currentPage.textLines.length > 3 && (
                        <p className="text-[11px] text-gray-700 text-center">共 {currentPage.textLines.length} 行</p>
                      )}
                    </div>
                  )}

                  {currentPage.buttons.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      {currentPage.buttons.map((btn) => (
                        <span key={btn.id} className="px-4 sm:px-5 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs border border-gray-700">
                          {btn.text}
                          {btn.targetPageId && <ArrowRight className="w-3 h-3 inline ml-1 text-gray-600" />}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* 未选中页面 */
            <div className="h-full flex flex-col items-center justify-center text-gray-600 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-900/50 flex items-center justify-center mb-4 border border-gray-800/30">
                <FileText className="w-7 h-7 text-gray-700" />
              </div>
              <p className="text-sm">从左侧选择或创建一个页面</p>
              <button
                onClick={() => { addPage(); setSidebarOpen(false); }}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors border border-gray-700 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                创建第一个页面
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ====== 分享弹窗 ====== */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70" onClick={() => setShowShareModal(false)}>
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">分享作品</h3>
              <button onClick={() => setShowShareModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-3">复制以下链接，发送给任何人即可直接播放：</p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-gray-300 font-mono truncate focus:outline-none"
              />
              <button
                onClick={handleCopyShareUrl}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium transition-colors min-h-[40px] shrink-0 ${
                  copied
                    ? 'bg-green-700/80 text-white'
                    : 'bg-blue-700/80 hover:bg-blue-600 text-white'
                }`}
              >
                {copied ? <><Check className="w-3.5 h-3.5" />已复制</> : <><Copy className="w-3.5 h-3.5" />复制</>}
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-950/60 rounded-lg">
              <p className="text-[11px] text-gray-600 leading-relaxed">
                此链接包含完整的作品数据，无需登录即可打开。链接较长是正常的（数据编码在 URL 中）。
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors min-h-[40px]"
              >
                <Eye className="w-3.5 h-3.5" />在新窗口预览
              </a>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg text-xs transition-colors min-h-[40px]"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
