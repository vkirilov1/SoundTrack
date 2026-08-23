import type { ChatRoomInfo } from "../types";

export function actionLabelFor(room: ChatRoomInfo): string {
  switch (room.myStatus) {
    case "OWNER":
    case "MEMBER":
      return "Open";
    case "PENDING":
      return "Requested";
    default:
      return "Join";
  }
}
