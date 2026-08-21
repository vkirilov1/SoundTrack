// SONG rooms are not supported for now - the backend rejects them on create
export type ChatTopicType = "ALBUM" | "ARTIST";

export type MemberStatus = "OWNER" | "MEMBER" | "PENDING" | "NONE";

export interface ChatUserSummary {
  id: number;
  username: string;
  profilePicture: string | null;
}

export interface ChatRoomInfo {
  id: number;
  name: string;
  topicType: ChatTopicType;
  topicId: number;
  topicName: string | null;
  topicImageUrl: string | null;
  creator: ChatUserSummary;
  createdAt: string;
  approvalRequired: boolean;
  maxCapacity: number;
  memberCount: number;
  members: ChatUserSummary[];
  myStatus: MemberStatus;
  pendingRequests: ChatUserSummary[];
}

export type ChatMessageType = "TEXT" | "JOIN" | "LEAVE" | "KICK";

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  senderUsername: string;
  senderProfilePicture: string | null;
  content: string;
  sentAt: string;
  messageType: ChatMessageType;
}

export type JoinStatus = "JOINED" | "REQUESTED";

export interface JoinRoomResult {
  status: JoinStatus;
  room: ChatRoomInfo;
}

export type ChatRoomEventType =
  "ROOM_CLOSED" | "JOIN_REQUEST" | "REQUEST_HANDLED";

export interface ChatRoomEvent {
  type: ChatRoomEventType;
  user: ChatUserSummary | null;
  userId: number | null;
}

export interface CreateRoomPayload {
  name: string;
  topicType: ChatTopicType;
  topicId: number;
  approvalRequired: boolean;
}

/** Outcome of a join attempt, flattened for UI decisions. */
export type JoinOutcome =
  | "joined"
  | "requested"
  | "conflict" // already in another room - caller should confirm leaving it
  | "gone" // room no longer exists
  | "full"
  | "error";
