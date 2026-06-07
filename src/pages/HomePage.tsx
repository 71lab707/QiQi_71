import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllWorks, deleteWork } from '@/utils/storage';
import { encodeWorkToUrl } from '@/utils/urlShare';
import type { Work } from '@/types';
import {
  PenLine,
  Play,
  Trash2,
  Plus,
  Clock,
  FileText,
  Sparkles,
} from 'lucide-react';

interface WorkItem {
  id: string;
  title: string;
  author: string;
  pagesCount: number;
  updatedAt: number;
}

// 预设示例作品
const SAMPLE_WORKS = [
  {
    id: 'sample_demo',
    title: '示例作品 - 互动故事',
    author: 'QiQi Lab',
    pagesCount: 4,
    description: '体验分页式互动故事的完整流程',
    jsonFile: '/samples/demo.json',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [sampleLoaded, setSampleLoaded] = useState<Record<string, Work | null>>({});

  const loadWorks = () => {
    const allWorks = getAllWorks();
    setWorks(
      allWorks.map((w) => ({
        id: w.id,
        title: w.title || '未命名作品',
        author: w.author || '匿名作者',
        pagesCount: w.pages.length,
        updatedAt: w.updatedAt,
      }))
    );
  };

  // 加载预设示例作品
  useEffect(() => {
    SAMPLE_WORKS.forEach(async (sample) => {
      try {
        const res = await fetch(sample.jsonFile);
        if (res.ok) {
          const data: Work = await res.json();
          setSampleLoaded((prev) => ({ ...prev, [sample.id]: data }));
        }
      } catch {
        // 加载失败静默处理
      }
    });
  }, []);

  useEffect(() => {
    loadWorks();
  }, []);

  const handleDelete = (id: string) => {
    deleteWork(id);
    loadWorks();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 点击示例作品 → 生成分享链接并跳转
  const handlePlaySample = async (sampleId: string) => {
    const workData = sampleLoaded[sampleId];
    if (!workData) return;

    const baseUrl = window.location.origin + window.location.pathname;
    const encoded = encodeWorkToUrl(workData);
    navigate(`#/player/share?${encoded}`);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gray-800/[0.03] blur-[140px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #444 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* 头部 */}
        <header className="text-center mb-12 sm:mb-14">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-900 border border-gray-800 mb-4 sm:mb-5">
            <PenLine className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            互动作品工坊
          </h1>
          <p className="text-sm text-gray-500 max-w-xs sm:max-w-md mx-auto leading-relaxed">
            创建分页式互动故事，每页包含图片、文字与导航按钮
          </p>

          <button
            onClick={() => navigate('/editor')}
            className="mt-6 sm:mt-7 inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-gray-700 min-h-[48px]"
          >
            <Plus className="w-4 h-4" />
            创建新作品
          </button>
        </header>

        {/* ====== 示例作品 ====== */}
        <section className="mb-12">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-600 mb-4 px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500/50" />
            示例作品
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_WORKS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => handlePlaySample(sample.id)}
                className="group relative bg-gradient-to-b from-blue-950/20 to-gray-950/40 border border-blue-900/20 rounded-xl p-4 sm:p-5 hover:border-blue-700/40 hover:bg-blue-950/30 transition-all duration-200 cursor-pointer active:bg-blue-950/40"
              >
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[9px] bg-blue-900/40 text-blue-400/70 px-2 py-0.5 rounded font-mono">DEMO</span>
                </div>

                <h3 className="text-sm font-medium text-gray-300 pl-14 truncate mb-1">
                  {sample.title}
                </h3>

                <p className="text-xs text-gray-500 mb-2">{sample.author}</p>
                <p className="text-[11px] text-gray-600 mb-3">{sample.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-800/30">
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
                    <FileText className="w-3 h-3" />
                    {sample.pagesCount} 页
                  </span>
                  <Play className="w-4 h-4 text-blue-500/60 group-hover:text-blue-400 transition-colors fill-blue-500/30 group-hover:fill-blue-400/50" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====== 我的作品 ====== */}
        <section>
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-600 mb-4 px-1">
            我的作品
          </h2>

          {works.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <FileText className="w-11 h-11 sm:w-12 sm:h-12 text-gray-800 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">还没有任何作品</p>
              <p className="text-gray-700 text-xs mt-1">点击上方按钮开始创作，或先体验示例作品</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {works.map((work) => (
                <div
                  key={work.id}
                  onClick={() => navigate(`/player/${work.id}`)}
                  className="group relative bg-gray-950/60 border border-gray-800/40 rounded-xl p-4 sm:p-5 hover:border-gray-700/60 hover:bg-gray-900/40 transition-all duration-200 cursor-pointer active:bg-gray-800/30"
                >
                  {/* 操作按钮 - 移动端始终可见 */}
                  <div className={`absolute top-2.5 right-2.5 flex gap-1 ${'sm:hidden'}`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/editor'); }}
                      className="w-8 h-8 rounded-lg bg-gray-800/80 flex items-center justify-center transition-colors"
                    >
                      <PenLine className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(work.id); }}
                      className="w-8 h-8 rounded-lg bg-gray-800/80 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>

                  {/* 桌面端悬浮操作 */}
                  <div className="absolute top-2.5 right-2.5 hidden sm:flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/editor'); }}
                      className="w-7 h-7 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    >
                      <PenLine className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(work.id); }}
                      className="w-7 h-7 rounded-md bg-gray-800 hover:bg-red-900/50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>

                  <h3 className="text-sm font-medium text-gray-300 pr-12 sm:pr-14 truncate mb-1">
                    {work.title}
                  </h3>

                  <p className="text-xs text-gray-600 mb-3">{work.author}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-800/40">
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
                      <FileText className="w-3 h-3" />
                      {work.pagesCount} 页
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-700">
                      <Clock className="w-3 h-3" />
                      {formatTime(work.updatedAt)}
                    </span>
                  </div>

                  <Play className="absolute bottom-4 right-4 w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 fill-gray-600 hidden sm:block" />

                  <Play className="sm:hidden absolute bottom-3.5 right-3.5 w-3.5 h-3.5 text-gray-700 fill-gray-700" />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
