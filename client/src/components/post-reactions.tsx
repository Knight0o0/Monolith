import { useState, useEffect, useRef } from "react";
import { fetchReactions, toggleReaction } from "@/lib/api";

const REACTION_TYPES = [
  { type: "like", emoji: "👍", label: "赞" },
  { type: "heart", emoji: "❤️", label: "喜欢" },
  { type: "celebrate", emoji: "🎉", label: "庆祝" },
  { type: "think", emoji: "🤔", label: "值得思考" },
];

interface PostReactionsProps {
  slug: string;
}

export function PostReactions({ slug }: PostReactionsProps) {
  const currentSlugRef = useRef(slug);
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [animating, setAnimating] = useState<string | null>(null);
  const [inFlight, setInFlight] = useState<Set<string>>(new Set());

  useEffect(() => {
    currentSlugRef.current = slug;
    let cancelled = false;
    
    // 显式重置状态，防止跨文章污染
    setCounts(new Map());
    setActiveTypes(new Set());

    fetchReactions(slug).then((data) => {
      if (!cancelled && currentSlugRef.current === slug) {
        setCounts(new Map(Object.entries(data || {})));
      }
    }).catch(() => {
      if (!cancelled) setCounts(new Map());
    });

    // 从 localStorage 恢复已点击状态
    const saved = localStorage.getItem(`reactions:${slug}`);
    if (saved) {
      try { setActiveTypes(new Set(JSON.parse(saved))); } catch { /* */ }
    }

    return () => { cancelled = true; };
  }, [slug]);

  const handleReaction = async (type: string) => {
    if (inFlight.has(type)) return;
    if (!REACTION_TYPES.some(r => r.type === type)) return;

    setInFlight(prev => new Set(prev).add(type));
    setAnimating(type);
    const clickedType = type;
    setTimeout(() => {
      setAnimating((prev) => (prev === clickedType ? null : prev));
    }, 600);

    try {
      const requestSlug = slug;
      const result = await toggleReaction(requestSlug, type);
      if (currentSlugRef.current !== requestSlug) return;
      
      setCounts(new Map(Object.entries(result.reactions || {})));

      // 更新本地标记
      setActiveTypes((prev) => {
        const next = new Set(prev);
        if (result.action === "added") {
          next.add(type);
        } else {
          next.delete(type);
        }
        localStorage.setItem(`reactions:${requestSlug}`, JSON.stringify([...next]));
        return next;
      });
    } catch {
      /* 静默 */
    } finally {
      setInFlight((prev) => {
        const next = new Set(prev);
        next.delete(type);
        return next;
      });
    }
  };

  const total = REACTION_TYPES.reduce((acc, { type }) => acc + (counts.get(type) || 0), 0);

  return (
    <div className="post-reactions">
      <p className="post-reactions__label">
        {total > 0 ? `${total} 个反应` : "留下你的反应"}
      </p>
      <div className="post-reactions__buttons">
        {REACTION_TYPES.map(({ type, emoji, label }) => (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            title={label}
            aria-label={label}
            aria-pressed={activeTypes.has(type)}
            disabled={inFlight.has(type)}
            className={`post-reactions__btn ${activeTypes.has(type) ? "post-reactions__btn--active" : ""} ${animating === type ? "post-reactions__btn--animate" : ""}`}
          >
            <span className="post-reactions__emoji">{emoji}</span>
            {(counts.get(type) ?? 0) > 0 && (
              <span className="post-reactions__count">{counts.get(type)}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
