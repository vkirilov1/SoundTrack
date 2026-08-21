package org.soundtrack.domain.model;

/** Extend as more actions get wired to trigger notifications. */
public enum NotificationType {
  FOLLOW,
  REVIEW_DELETED,
  PHOTO_RESET,
  CHAT_INVITE,
  CHAT_REQUEST_APPROVED
}
