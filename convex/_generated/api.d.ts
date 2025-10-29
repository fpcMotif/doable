/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as chatConversations from "../chatConversations.js";
import type * as chatMessages from "../chatMessages.js";
import type * as comments from "../comments.js";
import type * as http from "../http.js";
import type * as invitations from "../invitations.js";
import type * as issues from "../issues.js";
import type * as labels from "../labels.js";
import type * as projects from "../projects.js";
import type * as teamMembers from "../teamMembers.js";
import type * as teams from "../teams.js";
import type * as workflowStates from "../workflowStates.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  chatConversations: typeof chatConversations;
  chatMessages: typeof chatMessages;
  comments: typeof comments;
  http: typeof http;
  invitations: typeof invitations;
  issues: typeof issues;
  labels: typeof labels;
  projects: typeof projects;
  teamMembers: typeof teamMembers;
  teams: typeof teams;
  workflowStates: typeof workflowStates;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
