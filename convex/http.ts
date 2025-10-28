import { httpRouter } from "convex/server";
import { auth } from "./auth.config";

/**
 * Convex HTTP 路由
 * 处理 OAuth 回调等 HTTP 端点
 */
const http = httpRouter();

// 注册 Convex Auth HTTP 路由
auth.addHttpRoutes(http);

export default http;

