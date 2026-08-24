export type ContactRequestType =
  | "BUG_REPORT"
  | "ACCOUNT_ISSUE"
  | "CONTENT_COPYRIGHT"
  | "CHAT_APPEAL"
  | "FEEDBACK"
  | "OTHER";

export const CONTACT_REQUEST_TYPES: {
  value: ContactRequestType;
  label: string;
}[] = [
  { value: "BUG_REPORT", label: "Bug report" },
  { value: "ACCOUNT_ISSUE", label: "Account issue" },
  { value: "CONTENT_COPYRIGHT", label: "Content or copyright complaint" },
  { value: "CHAT_APPEAL", label: "Chat permissions appeal" },
  { value: "FEEDBACK", label: "Feedback or suggestion" },
  { value: "OTHER", label: "Other" },
];
