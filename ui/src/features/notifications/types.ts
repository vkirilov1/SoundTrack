export type NotificationType =
  | "FOLLOW"
  | "REVIEW_DELETED"
  | "PHOTO_RESET"
  | "CHAT_INVITE"
  | "CHAT_REQUEST_APPROVED";

/** Notification types that reference a chat room via entityId - see useNotifications. */
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
