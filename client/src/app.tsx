import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SearchOverlay } from "@/components/search";
import { ProtectedRoute } from "@/components/protected-route";
import { HomePage } from "@/pages/home";
import { PostPage } from "@/pages/post";
import { ArchivePage } from "@/pages/archive";
import { AboutPage } from "@/pages/about";
import { AdminLogin } from "@/pages/admin/login";
import { AdminDashboard } from "@/pages/admin/dashboard";
import { AdminEditor } from "@/pages/admin/editor";
import { AdminSettings } from "@/pages/admin/settings";
import { AdminBackup } from "@/pages/admin/backup";
import { AdminPages } from "@/pages/admin/pages";
import { AdminComments } from "@/pages/admin/comments";
import { AdminMedia } from "@/pages/admin/media";
import { DynamicPage } from "@/pages/dynamic-page";
import { NotFoundPage } from "@/pages/not-found";

/** 将 HTML 字符串安全注入到容器中（支持 script 标签执行） */
function injectHtml(container: HTMLElement, html: string) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  Array.from(temp.childNodes).forEach((node) => {
    if (node instanceof HTMLScriptElement) {
      // script 需要重新创建才能执行
      const script = document.createElement("script");
      if (node.src) script.src = node.src;
      else script.textContent = node.textContent;
      Array.from(node.attributes).forEach((a) => script.setAttribute(a.name, a.value));
      container.appendChild(script);
    } else {
      container.appendChild(node.cloneNode(true));
    }
  });
}

export function App() {
  const [location] = useLocation();
  const isEditorPage = location.startsWith("/admin/editor");

  // 注入自定义 header/footer 代码（仅执行一次）
  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((s) => {
        if (s.custom_header) {
          const container = document.createElement("div");
          container.id = "monolith-custom-header";
          injectHtml(container, s.custom_header);
          // 将子节点移入 head
          Array.from(container.childNodes).forEach((n) => document.head.appendChild(n));
        }
        if (s.custom_footer) {
          const container = document.createElement("div");
          container.id = "monolith-custom-footer";
          injectHtml(container, s.custom_footer);
          document.body.appendChild(container);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <SearchOverlay />
      {isEditorPage ? (
        /* 编辑器全屏布局 — 不受 main 容器限制 */
        <main className="mx-auto w-full px-[16px] flex-1 flex flex-col">
          <Switch>
            <Route path="/admin/editor/:slug?">
              <ProtectedRoute>
                <AdminEditor />
              </ProtectedRoute>
            </Route>
          </Switch>
        </main>
      ) : (
        <main className="mx-auto w-full max-w-[1440px] px-[20px] lg:px-[40px] flex-1 flex flex-col">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/posts/:slug" component={PostPage} />
            <Route path="/archive" component={ArchivePage} />
            <Route path="/about" component={AboutPage} />
            {/* 登录页不需要守卫 */}
            <Route path="/admin/login" component={AdminLogin} />
            {/* 以下所有后台页面均需认证 */}
            <Route path="/admin/settings">
              <ProtectedRoute><AdminSettings /></ProtectedRoute>
            </Route>
            <Route path="/admin/backup">
              <ProtectedRoute><AdminBackup /></ProtectedRoute>
            </Route>
            <Route path="/admin/pages">
              <ProtectedRoute><AdminPages /></ProtectedRoute>
            </Route>
            <Route path="/admin/comments">
              <ProtectedRoute><AdminComments /></ProtectedRoute>
            </Route>
            <Route path="/admin/media">
              <ProtectedRoute><AdminMedia /></ProtectedRoute>
            </Route>
            <Route path="/admin">
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            </Route>
            <Route path="/page/:slug" component={DynamicPage} />
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </main>
      )}
      {!isEditorPage && <Footer />}
    </>
  );
}
