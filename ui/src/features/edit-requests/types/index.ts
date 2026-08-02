export type EditRequestTargetType = "ALBUM" | "ARTIST";

export type EditRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface EditRequest {
  id: number;
  targetType: EditRequestTargetType;
  targetId: number;
  targetName: string;
  targetPhotoUrl: string | null;
  proposedDescription: string;
  status: EditRequestStatus;
  requestedByUsername: string;
  reviewedByUsername: string | null;
  reviewedAt: string | null;
  createdAt: string;
}
