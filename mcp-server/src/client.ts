/* ──────────────────────────────────────────────
   Monolith MCP 服务器 — HTTP 客户端
   封装认证逻辑与请求方法，自动管理 JWT 生命周期
   ────────────────────────────────────────────── */

/** 缓存的认证令牌与过期时间 */
let cachedToken: string | null = null;
let tokenExpiresAt = 0; // Unix 时间戳（秒）

/** 解析 JWT Payload */
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/** 从环境变量读取配置 */
function getConfig() {
  const apiUrl = process.env.MONOLITH_API_URL;
  const password = process.env.MONOLITH_PASSWORD;

  if (!apiUrl || !password) {
    throw new Error(
      "缺少环境变量 MONOLITH_API_URL 或 MONOLITH_PASSWORD，请在 MCP 配置中设置。"
    );
  }

  return { apiUrl: apiUrl.replace(/\/$/, ""), password };
}

/** 登录获取 JWT Token */
async function login(): Promise<string> {
  const { apiUrl, password } = getConfig();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`登录失败 (${res.status}): ${body}`);
    }

    const data = (await res.json()) as { token: string };
    cachedToken = data.token;
    
    // 解析 JWT 获取 exp 字段，提前 5 分钟刷新
    const payload = parseJwt(data.token);
    if (payload && payload.exp) {
      tokenExpiresAt = payload.exp - 300;
    } else {
      // 回退策略：默认 7 天
      tokenExpiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 3600 - 300;
    }

    console.error("[Monolith MCP] 认证成功，JWT Token 已缓存。");
    return cachedToken;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** 获取有效的 Token（自动登录/续签） */
async function getToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }
  return login();
}

/** 通用请求方法 */
export async function apiRequest<T = unknown>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
    auth?: boolean; // 默认 true，公开 API 可设为 false
    timeoutMs?: number; // 请求超时时间
  } = {},
  isRetry = false
): Promise<T> {
  const { method = "GET", body, query, auth = true, timeoutMs = 15000 } = options;
  const { apiUrl } = getConfig();

  // 构建完整 URL
  let url = `${apiUrl}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  // 构建请求头
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = await getToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 发起请求
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // 处理 401: Token 失效时重试一次
    if (res.status === 401 && auth && !isRetry) {
      console.error("[Monolith MCP] Token 失效，尝试重新登录并重试请求...");
      cachedToken = null; // 清除缓存强制重新登录
      return apiRequest(path, options, true);
    }

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API 请求失败 ${method} ${path} (${res.status}): ${errorText}`);
    }

    // 空响应兼容
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await res.json()) as T;
    }

    return (await res.text()) as unknown as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`API 请求超时 ${method} ${path} (${timeoutMs}ms)`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
