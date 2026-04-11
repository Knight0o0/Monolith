import { useEffect, useState, useMemo } from "react";
import { useParams } from "wouter";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchPost, type Post } from "@/lib/api";
import { renderMarkdown, extractHeadings } from "@/lib/markdown";
import { ArrowLeft, Eye } from "lucide-react";
import { TableOfContents, ReadingProgressBar } from "@/components/toc";
import { SeoHead } from "@/components/seo-head";
import { CommentsSection } from "@/components/comments";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

export function PostPage() {
  const params = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.slug) return;
    fetchPost(params.slug)
      .then(setPost)
      .catch(() => setError("文章未找到"))
      .finally(() => setLoading(false));
  }, [params.slug]);

  // 提取标题列表（用于 TOC）
  const headings = useMemo(() => {
    if (!post) return [];
    return extractHeadings(post.content);
  }, [post]);

  // 渲染 Markdown HTML
  const htmlContent = useMemo(() => {
    if (!post) return "";
    return renderMarkdown(post.content);
  }, [post]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[720px] py-[40px] sm:py-[56px] px-[16px] lg:px-0">
        <div className="animate-pulse space-y-[16px]">
          <div className="h-[20px] w-[100px] rounded bg-card/30" />
          <div className="h-[40px] w-3/4 rounded bg-card/30" />
          <div className="h-[16px] w-full rounded bg-card/30" />
          <div className="h-[16px] w-5/6 rounded bg-card/30" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <h1 className="text-[20px] text-muted-foreground">{error || "文章未找到"}</h1>
      </div>
    );
  }

  return (
    <>
      {/* SEO 元数据 */}
      <SeoHead
        title={post.title}
        description={post.excerpt || undefined}
        url={`/posts/${post.slug}`}
        type="article"
        publishedTime={post.createdAt}
        modifiedTime={post.updatedAt}
        tags={post.tags}
        breadcrumbs={[
          { name: "首页", url: "/" },
          { name: post.title, url: `/posts/${post.slug}` },
        ]}
      />

      {/* 阅读进度条 */}
      <ReadingProgressBar />

      {/* 三栏布局容器：文章 + TOC 侧边栏 */}
      <div className="post-layout mx-auto w-full max-w-[1100px] px-[16px] lg:px-[24px]">
        {/* 主内容区 */}
        <article className="post-content py-[32px] lg:py-[56px]">
          <Link href="/" className="mb-[32px] inline-flex items-center gap-[6px] text-[13px] text-muted-foreground/60 transition-all duration-200 hover:text-foreground hover:-translate-x-[2px] animate-fade-in">
            <ArrowLeft className="h-[14px] w-[14px]" />返回首页
          </Link>

          <header className="mb-[32px] animate-fade-in-up delay-1">
            <div className={`mb-[24px] h-[3px] w-[60px] rounded-full bg-gradient-to-r ${post.coverColor || "from-gray-500/20 to-gray-600/20"}`} />
            <div className="mb-[16px] flex flex-wrap items-center gap-[8px]">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="h-[22px] rounded-[4px] px-[8px] text-[12px] font-normal">{tag}</Badge>
              ))}
              <span className="text-[12px] text-muted-foreground/50">{formatDate(post.createdAt)}</span>
              <span className="text-[12px] text-muted-foreground/50 inline-flex items-center gap-[3px]"><Eye className="h-[12px] w-[12px]" />{post.viewCount ?? 0}</span>
            </div>
            <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] leading-[1.3] lg:text-[32px]">{post.title}</h1>
            <p className="mt-[16px] text-[15px] leading-[1.8] text-muted-foreground">{post.excerpt}</p>
          </header>

          {/* 移动端 TOC（显示在分隔线上方） */}
          {headings.length >= 2 && (
            <div className="mb-[24px] xl:hidden">
              <TableOfContents headings={headings} />
            </div>
          )}

          <Separator className="mb-[32px] bg-border/30" />

          {/* 文章正文，同时处理代码块复制逻辑 */}
          <div 
            className="prose-monolith animate-fade-in delay-3" 
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const btn = target.closest('.copy-code-btn');
              if (btn) {
                const wrapper = btn.closest('.code-block-wrapper');
                const codeNode = wrapper?.querySelector('code');
                if (codeNode && codeNode.textContent) {
                  navigator.clipboard.writeText(codeNode.textContent).then(() => {
                    const originalIcon = btn.getAttribute('data-copy-icon');
                    const checkIcon = btn.getAttribute('data-check-icon');
                    if (checkIcon && originalIcon) {
                      btn.innerHTML = checkIcon;
                      setTimeout(() => {
                        btn.innerHTML = originalIcon;
                      }, 2000);
                    }
                  }).catch(console.error);
                }
              }
            }}
          />

          <Separator className="mt-[48px] bg-border/30" />
          <div className="mt-[24px] flex items-center justify-between animate-fade-in delay-4">
            <Link href="/" className="inline-flex items-center gap-[6px] text-[13px] text-muted-foreground/60 transition-all duration-200 hover:text-foreground hover:-translate-x-[2px]">
              <ArrowLeft className="h-[14px] w-[14px]" />返回首页
            </Link>
            <span className="text-[12px] text-muted-foreground/40">发布于 {formatDate(post.createdAt)}</span>
          </div>

          {/* 评论区 */}
          <CommentsSection slug={post.slug} />
        </article>

        {/* 桌面端 TOC 侧边栏 */}
        {headings.length >= 2 && (
          <TableOfContents headings={headings} />
        )}
      </div>
    </>
  );
}
