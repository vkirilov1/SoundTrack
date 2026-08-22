/**
 * FOLLOW - When the user gains a new follower
 * REVIEW_DELETED/PHOTO_RESET - Admin actions treated as system notifications
 * CHAT_INVITE/REQUEST_APPROVED - Handle Actions related to chats
 * CHAT_ACCESS_* - Admin actions treated as system notifications
 * ALBUM_SUGGESTION_* - Decision on a user's Drops album suggestion
 */
export type NotificationType =
  | "FOLLOW"
  | "REVIEW_DELETED"
  | "PHOTO_RESET"
  | "CHAT_INVITE"
  | "CHAT_REQUEST_APPROVED"
  | "CHAT_ACCESS_REVOKED"
  | "CHAT_ACCESS_RESTORED"
  | "ALBUM_SUGGESTION_APPROVED"
  | "ALBUM_SUGGESTION_REJECTED";

/** Notification types that reference a chat room via entityId */
export const CHAT_NOTIFICATION_TYPES: ReadonlySet<NotificationType> = new Set([
  "CHAT_INVITE",
  "CHAT_REQUEST_APPROVED",
]);

export interface NotificationActor {
  id: number;
  username: string;
  profilePictureUrl: string | null;
}

export interface AppNotification {
  id: number;
  type: NotificationType;
  actor: NotificationActor;
  entityId: number | null;
  context: string | null;
  read: boolean;
  createdAt: string;
}
