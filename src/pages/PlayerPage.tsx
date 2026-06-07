import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getWorkById } from '@/utils/storage';
import { decodeWorkFromUrl, isShareUrl } from '@/utils/urlShare';
import type { Work, TeaseButton } from '@/types';
import { ArrowLeft, RotateCcw, Home, ChevronDown, Hand, Menu, PenLine, FileText } from 'lucide-react';

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [work, setWork] = useState<Work | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isShareMode, setIsShareMode] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [revealedLines, setRevealedLines] = useState(0);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const prevPageIdRef = useRef<string>('');

  // 移动端工具栏折叠状态
  const [toolbarExpanded, setToolbarExpanded] = useState(false);

  useEffect(() => {
    // 优先从 URL 分享数据加载
    if (id === 'share' || isShareUrl(location.hash)) {
      const shareWork = decodeWorkFromUrl(location.hash);
      if (shareWork) {
        setWork(shareWork);
        setCurrentPageId(shareWork.startPageId);
        setHistory([shareWork.startPageId]);
        setIsShareMode(true);
      }
      setLoaded(true);
      return;
    }

    // 从 localStorage 加载
    if (id) {
      const found = getWorkById(id);
      if (found) {
        setWork(found);
        setCurrentPageId(found.startPageId);
        setHistory([found.startPageId]);
      }
      setLoaded(true);
    }
  }, [id, location.hash]);

  const currentPage = work?.pages.find((p) => p.id === currentPageId);

  useEffect(() => {
    if (currentPage && currentPage.id !== prevPageIdRef.current) {
      prevPageIdRef.current = currentPage.id;
      setRevealedLines(0);
      setButtonsVisible(false);
      setToolbarExpanded(false);
    }
  }, [currentPage?.id]);

  const handleButtonClick = useCallback(
    (btn: TeaseButton) => {
      if (btn.targetPageId === 'end') {
        setShowEndScreen(true);
        return;
      }
      const targetPage = work?.pages.find((p) => p.id === btn.targetPageId);
      if (targetPage) {
        setCurrentPageId(btn.targetPageId);
        setHistory((prev) => [...prev, btn.targetPageId]);
      }
    },
    [work]
  );

  // 点击/触摸推进
  const handleAdvance = useCallback(() => {
    if (!currentPage) return;
    const totalLines = currentPage.textLines.length;
    if (revealedLines < totalLines) {
      setRevealedLines((prev) => prev + 1);
      return;
    }
    if (!buttonsVisible && currentPage.buttons.length > 0) {
      setButtonsVisible(true);
    }
  }, [currentPage, revealedLines, buttonsVisible]);

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentPageId(newHistory[newHistory.length - 1]);
    }
  };

  const handleRestart = () => {
    if (work) {
      setCurrentPageId(work.startPageId);
      setHistory([work.startPageId]);
      setShowEndScreen(false);
    }
  };

  // 加载中
  if (!loaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  // 未找到
  if (!work) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gray-500 gap-5 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
          <FileText className="w-7 h-7 text-gray-700" />
        </div>
        <div>
          <p className="text-lg text-gray-400 mb-1">作品不存在或链接已失效</p>
          <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
            请使用编辑器创建作品后，通过「分享」按钮生成可播放的链接
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <button
            onClick={() => navigate('/editor')}
            className="px-6 py-3 bg-blue-700/80 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors min-h-[48px]"
          >
            去创作
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors min-h-[48px]"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 结束画面
  if (showEndScreen) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 safe-bottom">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-b from-red-900/10 to-transparent blur-[100px]" />
        </div>
        <div className="relative z-10 text-center w-full max-w-sm">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            结束
          </h2>
          <p className="text-gray-500 mb-8">感谢体验此作品</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <button
              onClick={handleRestart}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors border border-gray-700 min-h-[48px] w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              重新开始
            </button>
            <button
              onClick={handleBack}
              disabled={history.length <= 1}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm transition-colors border min-h-[48px] w-full sm:w-auto ${
                history.length > 1
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                  : 'bg-gray-900/50 text-gray-600 border-gray-800 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              上一步
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors border border-gray-700 min-h-[48px] w-full sm:w-auto"
            >
              <Home className="w-4 h-4" />
              首页
            </button>
            <button
              onClick={() => navigate('/editor')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors border border-gray-700 min-h-[48px] w-full sm:w-auto"
            >
              <PenLine className="w-4 h-4" />
              编辑作品
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====== 主播放页面 ======
  return (
    <div className="min-h-screen bg-black relative overflow-hidden select-none touch-action-none">
      {/* ====== 顶部工具栏（响应式）====== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800/50 safe-top">
        {/* 桌面端：完整工具栏 */}
        <div className="hidden sm:flex max-w-4xl mx-auto px-4 h-12 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              返回
            </button>
            <span className="text-gray-700 hidden md:inline">|</span>
            <h1 className="text-sm font-medium text-gray-300 truncate hidden md:block">
              {work.title || '未命名作品'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={history.length <= 1}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
                history.length > 1
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-700 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              上一步
            </button>
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重来
            </button>
            <button
              onClick={() => navigate('/editor')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded text-xs transition-colors"
            >
              <PenLine className="w-3.5 h-3.5" />
              编辑
            </button>
          </div>
        </div>

        {/* 移动端：紧凑栏 + 展开菜单 */}
        <div className="sm:hidden flex items-center justify-between px-3 h-11">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-400 hover:text-white rounded"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="max-w-[120px] truncate">{work.title || '返回'}</span>
          </button>

          <button
            onClick={() => setToolbarExpanded(!toolbarExpanded)}
            className="flex items-center gap-1 px-2 py-1.5 text-gray-400 hover:text-white rounded min-h-[36px]"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* 移动端展开菜单 */}
        {toolbarExpanded && (
          <div className="sm:hidden border-t border-gray-800/50 px-3 py-2 flex gap-2 animate-fade-in">
            <button
              onClick={handleBack}
              disabled={history.length <= 1}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-colors ${
                history.length > 1
                  ? 'bg-gray-800 text-gray-300 active:bg-gray-700'
                  : 'bg-gray-900/50 text-gray-600'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />上一步
            </button>
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs active:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />重来
            </button>
            <button
              onClick={() => navigate('/editor')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs active:bg-gray-700 transition-colors"
            >
              <PenLine className="w-3.5 h-3.5" />编辑
            </button>
          </div>
        )}
      </header>

      {/* ====== 主内容区（点击区域）====== */}
      <main
        className="pt-11 sm:pt-12 min-h-screen flex flex-col cursor-pointer"
        onClick={handleAdvance}
        onTouchStart={(e) => {
          // 防止触摸按钮时冒泡到主区域
          if ((e.target as HTMLElement).closest('button')) return;
          handleAdvance();
        }}
      >
        {/* 作品标题 */}
        <section className="text-center pt-6 sm:pt-8 pb-3 sm:pb-4 px-4 pointer-events-none">
          <h1
            className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 leading-tight animate-fade-in px-2"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            {work.title || '未命名作品'}
          </h1>
          {work.author && (
            <p className="text-xs sm:text-sm text-gray-500">
              by <span className="text-gray-400">{work.author}</span>
            </p>
          )}
        </section>

        {/* 内容展示区 */}
        <section className="flex-1 flex flex-col items-center px-3 sm:px-4 pb-8 safe-bottom">
          {currentPage ? (
            <div className="w-full max-w-2xl flex flex-col items-center">
              {/* 图片区域 */}
              {currentPage.imageUrl && (
                <div className="w-full mb-4 sm:mb-5 rounded overflow-hidden border border-gray-800/60 shadow-2xl shadow-black/50 pointer-events-auto animate-fade-in">
                  <img
                    src={currentPage.imageUrl}
                    alt=""
                    className="w-full max-h-[40vh] sm:max-h-[50vh] object-contain bg-gray-950"
                    draggable={false}
                  />
                </div>
              )}

              {/* 文字行区域 */}
              {currentPage.textLines.length > 0 && (
                <div className="w-full mb-5 sm:mb-6 px-1 sm:px-2 space-y-2 sm:space-y-3 pointer-events-auto">
                  {currentPage.textLines.map((line, index) => (
                    <div
                      key={index}
                      className={`transition-all duration-400 ease-out ${
                        index < revealedLines
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-3'
                      }`}
                    >
                      <p
                        className={`text-sm sm:text-base md:text-lg leading-relaxed text-center whitespace-pre-wrap px-1 ${
                          index < revealedLines ? 'text-gray-200' : 'text-transparent'
                        }`}
                      >
                        {line}
                      </p>
                    </div>
                  ))}

                  {/* 继续提示：还有文字 */}
                  {!buttonsVisible && revealedLines < currentPage.textLines.length && (
                    <div className="flex justify-center pt-2 sm:pt-3 animate-bounce-slow">
                      <Hand className="w-5 h-5 text-gray-600" />
                      <ChevronDown className="w-4 h-4 text-gray-600 mt-0.5" />
                    </div>
                  )}

                  {/* 继续提示：等待显示按钮 */}
                  {!buttonsVisible &&
                    revealedLines >= currentPage.textLines.length &&
                    currentPage.buttons.length > 0 && (
                    <div className="flex justify-center pt-2 sm:pt-3 animate-pulse-soft">
                      <span className="text-xs text-gray-600">点击继续</span>
                    </div>
                  )}
                </div>
              )}

              {/* 按钮区域 */}
              {buttonsVisible && currentPage.buttons.length > 0 && (
                <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-auto pt-4 animate-fade-in pointer-events-auto px-2">
                  {currentPage.buttons.map((btn) => (
                    <button
                      key={btn.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleButtonClick(btn);
                      }}
                      className="px-6 sm:px-7 py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-200 hover:text-white rounded-lg sm:rounded text-sm font-medium transition-all duration-150 border border-gray-700 hover:border-gray-600 min-w-[100px] sm:min-w-[120px] min-h-[44px]"
                    >
                      {btn.text}
                    </button>
                  ))}
                </div>
              )}

              {/* 空状态 */}
              {currentPage.textLines.length === 0 &&
                currentPage.buttons.length === 0 && (
                <p className="text-gray-700 text-sm mt-12">(此页面为空)</p>
              )}

              {/* 无文字有按钮 */}
              {currentPage.textLines.length === 0 &&
                currentPage.buttons.length > 0 && (
                <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-auto pt-8 pointer-events-auto px-2">
                  {currentPage.buttons.map((btn) => (
                    <button
                      key={btn.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleButtonClick(btn);
                      }}
                      className="px-6 sm:px-7 py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-200 hover:text-white rounded-lg sm:rounded text-sm font-medium transition-all duration-150 border border-gray-700 hover:border-gray-600 min-w-[100px] sm:min-w-[120px] min-h-[44px]"
                    >
                      {btn.text}
                    </button>
                  ))}
                </div>
              )}

              {/* 页码 */}
              <p className="mt-5 sm:mt-6 text-[11px] text-gray-700 font-mono pointer-events-none">
                {work.pages.findIndex((p) => p.id === currentPageId) + 1} / {work.pages.length}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
              <p className="text-sm px-4 text-center">该作品暂无内容</p>
            </div>
          )}
        </section>
      </main>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

      {/* 安全区域顶部适配 */}
      <style>{`
        .safe-top { padding-top: env(safe-area-inset-top); }
      `}</style>
    </div>
  );
}
