import { useState, useEffect } from "react";
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
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [animating, setAnimating] = useState<string | null>(null);

  useEffect(() => {
    fetchReactions(slug).then(setCounts);
    // 从 localStorage 恢复已点击状态
    const saved = localStorage.getItem(`reactions:${slug}`);
    if (saved) {
      try { setActiveTypes(new Set(JSON.parse(saved))); } catch { /* */ }
    }
  }, [slug]);

  const handleReaction = async (type: string) => {
    setAnimating(type);
    setTimeout(() => setAnimating(null), 600);

    try {
      const result = await toggleReaction(slug, type);
      setCounts(result.reactions);

      // 更新本地标记
      setActiveTypes((prev) => {
        const next = new Set(prev);
        if (result.action === "added") {
          next.add(type);
        } else {
          next.delete(type);
        }
        localStorage.setItem(`reactions:${slug}`, JSON.stringify([...next]));
        return next;
      });
    } catch {
      /* 静默 */
    }
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

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
            className={`post-reactions__btn ${activeTypes.has(type) ? "post-reactions__btn--active" : ""} ${animating === type ? "post-reactions__btn--animate" : ""}`}
          >
            <span className="post-reactions__emoji">{emoji}</span>
            {(counts[type] ?? 0) > 0 && (
              <span className="post-reactions__count">{counts[type]}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
