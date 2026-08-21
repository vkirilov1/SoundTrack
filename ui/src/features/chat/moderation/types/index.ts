export type ChatReportCategory =
  "HARASSMENT" | "SPAM" | "ILLEGAL_CONTENT" | "OTHER" | "ADMIN_ACTION";

export type ChatReportStatus = "OPEN" | "HANDLING" | "RESOLVED";

export type ChatReportResolution = "DISMISSED" | "ROOM_DELETED";

export interface ChatReport {
  id: number;
  reporterUsername: string | null;
  roomId: number;
  roomName: string;
  topicName: string | null;
  category: ChatReportCategory;
  status: ChatReportStatus;
  handledByUsername: string | null;
  resolvedByUsername: string | null;
  resolution: ChatReportResolution | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ChatReportMessage {
  senderUsername: string;
  content: string;
  sentAt: string;
}

export interface ChatReportDetail {
  report: ChatReport;
  messages: ChatReportMessage[];
}

export const REPORT_CATEGORY_LABELS: Record<ChatReportCategory, string> = {
  HARASSMENT: "Harassment",
  SPAM: "Spam",
  ILLEGAL_CONTENT: "Illegal content",
  OTHER: "Other",
  ADMIN_ACTION: "Admin action",
};
