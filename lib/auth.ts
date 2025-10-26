import { auth as clerkAuth } from "@clerk/nextjs/server";

export async function getAuthUser() {
  const { userId } = await clerkAuth();
  return userId;
}

export async function requireAuth() {
  const { userId } = await clerkAuth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getAuthHeaders() {
  const { getToken } = await import("@clerk/nextjs/server");
  const token = await getToken();
  
  if (!token) {
    return {};
  }
  
  return {
    Authorization: `Bearer ${token}`,
  };
}

