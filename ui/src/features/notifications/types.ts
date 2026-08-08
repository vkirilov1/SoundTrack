export type NotificationType = "FOLLOW";

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
  read: boolean;
  createdAt: string;
}
