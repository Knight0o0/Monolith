import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchPosts, type PostMeta } from "@/lib/api";
import { AnimateIn } from "@/hooks/use-animate";
import { SeoHead } from "@/components/seo-head";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

export function ArchivePage() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts().then(setPosts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const grouped: Record<string, PostMeta[]> = {};
  for (const post of posts) {
    const year = new Date(post.createdAt).getFullYear().toString();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(post);
  }
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="mx-auto w-full max-w-[720px] py-[32px] lg:py-[56px] px-[16px] lg:px-0">
      <SeoHead title="归档" description={`共 ${posts.length} 篇文章，按时间倒序排列。`} url="/archive" breadcrumbs={[{ name: "首页", url: "/" }, { name: "归档", url: "/archive" }]} />
      <div className="animate-fade-in-up">
        <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em]">归档</h1>
        <p className="mt-[8px] text-[14px] text-muted-foreground">共 {posts.length} 篇文章，按时间倒序排列。</p>
      </div>
      <Separator className="my-[24px] bg-border/30" />

      {loading ? (
        <div className="space-y-[12px]">{[1, 2, 3, 4].map((i) => <div key={i} className="h-[44px] animate-pulse rounded bg-card/20" />)}</div>
      ) : (
        years.map((year, yi) => (
          <AnimateIn key={year} delay={`delay-${Math.min(yi, 4)}`} className="mb-[32px]">
            <h2 className="mb-[16px] text-[20px] font-semibold tracking-[-0.01em] text-muted-foreground/40">{year}</h2>
            <div className="flex flex-col gap-[4px]">
              {grouped[year].map((post) => (
                <Link key={post.slug} href={`/posts/${post.slug}`} className="group flex items-baseline gap-[12px] rounded-md py-[10px] px-[12px] -mx-[12px] transition-all duration-200 hover:bg-accent/30 hover:translate-x-[4px]">
                  <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground/40 w-[90px]">{formatDate(post.createdAt).replace(/\d{4}年/, "")}</span>
                  <span className="text-[15px] text-foreground transition-colors duration-200 group-hover:text-foreground/80">{post.title}</span>
                  <div className="ml-auto hidden shrink-0 gap-[4px] sm:flex">
                    {post.tags.slice(0, 1).map((tag) => (
                      <Badge key={tag} variant="outline" className="h-[20px] rounded-[3px] px-[6px] text-[11px] font-normal text-muted-foreground/50">{tag}</Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </AnimateIn>
        ))
      )}
    </div>
  );
}
