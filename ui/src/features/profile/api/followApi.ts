import type { UserProfile } from "../../../types/auth";
import type { PagedResponse } from "../../../types/api";
import { fetchJson, fetchOk } from "../../../lib/api-client";

export function followUser(userId: number): Promise<void> {
  return fetchOk(`/users/${userId}/follow`, { method: "POST" });
}

export function unfollowUser(userId: number): Promise<void> {
  return fetchOk(`/users/${userId}/follow`, { method: "DELETE" });
}

export function getFollowers(
  userId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<UserProfile>> {
  return fetchJson(`/users/${userId}/followers?page=${page}&size=${size}`);
}

export function getFollowing(
  userId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<UserProfile>> {
  return fetchJson(`/users/${userId}/following?page=${page}&size=${size}`);
}
