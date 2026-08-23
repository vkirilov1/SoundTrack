import { fetchJson } from "../../../lib/api-client";
import type { HomeFeed } from "../types";

export function getHomeFeed(): Promise<HomeFeed> {
  return fetchJson(`/home/feed`);
}
