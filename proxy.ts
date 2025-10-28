import { type NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 要求使用 proxy.ts 替代 middleware.ts
 * 
 * 注意：Convex Auth 认证逻辑在客户端 Provider 层处理（useAuth hook）
 * proxy 仅做路由级别的重定向与请求预处理
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 可选：添加请求日志、header 注入等
  // console.log(`[Proxy] ${request.method} ${pathname}`);

  // Convex Auth 在客户端完成认证检查，此处保持简单
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};

