"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Search, X, FileText, Loader2 } from "lucide-react";

type SearchResult = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverColor: string;
  createdAt: string;
  tags: string[];
};

const API_BASE = "";

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 全局快捷键 Ctrl+K / ⌘K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // 打开时自动聚焦
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // 防抖搜索
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setSelectedIndex(0);
      }
    } catch {
      /* 静默处理 */
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      setOpen(false);
      window.location.href = `/posts/${results[selectedIndex].slug}`;
    }
  };

  // 高亮关键词
  const highlightText = (text: string, q: string) => {
    if (!q.trim()) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-500/30 text-foreground rounded-sm px-[2px]">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] animate-fade-in"
      onClick={() => setOpen(false)}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* 搜索面板 */}
      <div
        className="relative w-full max-w-[580px] mx-[16px] rounded-[16px] bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索输入框 */}
        <div className="flex items-center gap-[12px] px-[20px] py-[16px] border-b border-border/30">
          <Search className="h-[18px] w-[18px] text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索文章标题、内容..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {loading && <Loader2 className="h-[16px] w-[16px] text-muted-foreground animate-spin" />}
          <button
            onClick={() => setOpen(false)}
            className="h-[28px] w-[28px] flex items-center justify-center rounded-[6px] bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-[14px] w-[14px]" />
          </button>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-[400px] overflow-y-auto">
          {query.trim() && !loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-[48px] text-muted-foreground">
              <Search className="h-[32px] w-[32px] mb-[12px] opacity-40" />
              <p className="text-[14px]">未找到相关文章</p>
              <p className="text-[12px] mt-[4px] opacity-60">试试其他关键词</p>
            </div>
          )}

          {results.map((result, index) => (
            <Link
              key={result.slug}
              href={`/posts/${result.slug}`}
              onClick={() => setOpen(false)}
              className={`flex items-start gap-[12px] px-[20px] py-[14px] transition-colors duration-150 cursor-pointer ${
                index === selectedIndex
                  ? "bg-accent/60"
                  : "hover:bg-accent/30"
              }`}
            >
              <div className={`mt-[2px] h-[36px] w-[36px] shrink-0 rounded-[8px] bg-gradient-to-br ${result.coverColor || "from-gray-500/20 to-gray-600/20"} flex items-center justify-center`}>
                <FileText className="h-[16px] w-[16px] text-muted-foreground/80" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-medium text-foreground truncate">
                  {highlightText(result.title, query)}
                </h4>
                {result.excerpt && (
                  <p className="text-[12px] text-muted-foreground mt-[4px] line-clamp-2">
                    {highlightText(result.excerpt, query)}
                  </p>
                )}
                {result.tags.length > 0 && (
                  <div className="flex gap-[6px] mt-[6px]">
                    {result.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-[6px] py-[1px] rounded-full bg-muted/60 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="flex items-center justify-between px-[20px] py-[10px] border-t border-border/20 text-[11px] text-muted-foreground/50">
          <div className="flex items-center gap-[12px]">
            <span className="flex items-center gap-[4px]">
              <kbd className="px-[4px] py-[1px] rounded bg-muted/40 font-mono text-[10px]">↑↓</kbd>
              导航
            </span>
            <span className="flex items-center gap-[4px]">
              <kbd className="px-[4px] py-[1px] rounded bg-muted/40 font-mono text-[10px]">↵</kbd>
              打开
            </span>
            <span className="flex items-center gap-[4px]">
              <kbd className="px-[4px] py-[1px] rounded bg-muted/40 font-mono text-[10px]">Esc</kbd>
              关闭
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 导航栏中的搜索触发按钮 */
export function SearchTrigger() {
  const triggerSearch = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
  };

  return (
    <button
      onClick={triggerSearch}
      className="inline-flex items-center justify-center h-[32px] w-[32px] rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 transition-all duration-200 cursor-pointer"
      title="搜索 (Ctrl+K)"
    >
      <Search className="h-[16px] w-[16px]" />
    </button>
  );
}
