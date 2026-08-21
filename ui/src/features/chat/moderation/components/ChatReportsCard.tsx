import { useCallback, useState } from "react";
import { chakra } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../../components/Pagination/Pagination";
import PagedSection from "../../../../components/PagedSection/PagedSection";
import { ApiError } from "../../../../lib/api-error";
import { usePagedList } from "../../../../hooks/usePagedList";
import { useChat } from "../../stores/useChat";
import {
  deleteChatRoom,
  dismissChatReport,
  getChatReports,
} from "../api/chatModerationApi";
import ChatReportRow from "./ChatReportRow";

type ActionStatus = "idle" | "working";

function ChatReportsCard() {
  const navigate = useNavigate();
  const { joinRoom } = useChat();

  const fetchReports = useCallback((page: number) => getChatReports(page), []);
  const {
    items: reports,
    setItems: setReports,
    page,
    totalPages,
    loading,
    listLoading,
    goToPage,
  } = usePagedList(fetchReports);

  const [actionStatus, setActionStatus] = useState<
    Record<number, ActionStatus>
  >({});
  const [joinErrors, setJoinErrors] = useState<Record<number, string>>({});

  function withStatus(key: number, action: () => Promise<void>) {
    setActionStatus((prev) => ({ ...prev, [key]: "working" }));
    return action().finally(() =>
      setActionStatus((prev) => ({ ...prev, [key]: "idle" })),
    );
  }

  async function handleJoin(roomId: number) {
    setJoinErrors((prev) => ({ ...prev, [roomId]: "" }));
    await withStatus(roomId, async () => {
      const outcome = await joinRoom(roomId);
      if (outcome === "joined") {
        navigate("/chats");
        return;
      }
      const messages: Partial<Record<typeof outcome, string>> = {
        gone: "This room no longer exists.",
        conflict:
          "You're already in another chat room - leave it first from the chat dock.",
        full: "This room is full.",
        forbidden: "Your access to chat rooms has been revoked.",
        error: "Something went wrong. Try again.",
        requested: "This room requires approval to join.",
      };
      setJoinErrors((prev) => ({
        ...prev,
        [roomId]: messages[outcome] ?? "Couldn't join this room.",
      }));
    });
  }

  async function handleDelete(roomId: number) {
    await withStatus(roomId, () =>
      deleteChatRoom(roomId)
        .then(() =>
          setReports((prev) =>
            prev.map((r) =>
              r.roomId === roomId
                ? { ...r, status: "RESOLVED", resolution: "ROOM_DELETED" }
                : r,
            ),
          ),
        )
        .catch((e: unknown) => {
          setJoinErrors((prev) => ({
            ...prev,
            [roomId]:
              e instanceof ApiError ? e.message : "Couldn't delete this room.",
          }));
        }),
    );
  }

  async function handleDismiss(reportId: number) {
    await withStatus(reportId, () =>
      dismissChatReport(reportId)
        .then((updated) =>
          setReports((prev) =>
            prev.map((r) => (r.id === reportId ? updated : r)),
          ),
        )
        .catch(() => {}),
    );
  }

  return (
    <>
      <PagedSection
        loading={loading}
        listLoading={listLoading}
        isEmpty={reports.length === 0}
        emptyMessage="No chat reports yet."
        spinnerLabel="Loading reports"
      >
        <chakra.ul mt="16px" listStyle="none" p="0" m="0">
          {reports.map((report) => (
            <ChatReportRow
              key={report.id}
              report={report}
              onJoinRoom={(roomId) => void handleJoin(roomId)}
              onDelete={(roomId) => void handleDelete(roomId)}
              onDismiss={(reportId) => void handleDismiss(reportId)}
              joinError={joinErrors[report.roomId] || undefined}
              actionPending={
                actionStatus[report.roomId] === "working" ||
                actionStatus[report.id] === "working"
              }
            />
          ))}
        </chakra.ul>
      </PagedSection>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </>
  );
}

export default ChatReportsCard;
