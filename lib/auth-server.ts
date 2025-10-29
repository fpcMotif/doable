import { headers } from "next/headers";
import { auth } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getUserId() {
  const session = await getSession();
  return session?.user?.id;
}

export async function requireUserId() {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getUser() {
  const session = await getSession();
  return session?.user || null;
}
