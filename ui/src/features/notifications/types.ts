export type NotificationType = "FOLLOW" | "REVIEW_DELETED" | "PHOTO_RESET";

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
