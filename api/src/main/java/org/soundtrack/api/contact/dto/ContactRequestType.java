package org.soundtrack.api.contact.dto;

public enum ContactRequestType {
  BUG_REPORT("Bug report"),
  ACCOUNT_ISSUE("Account issue"),
  CONTENT_COPYRIGHT("Content or copyright complaint"),
  CHAT_APPEAL("Chat permissions appeal"),
  FEEDBACK("Feedback or suggestion"),
  OTHER("Other");

  private final String label;

  ContactRequestType(String label) {
    this.label = label;
  }

  public String getLabel() {
    return label;
  }
}
