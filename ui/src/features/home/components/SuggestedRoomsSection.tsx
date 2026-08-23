import { Box, Heading, chakra } from "@chakra-ui/react";
import ConfirmActionModal from "../../../components/Modal/ConfirmActionModal";
import ChatRoomRow from "../../chat/components/ChatRoomRow";
import { actionLabelFor } from "../../chat/utils/actionLabel";
import { useRoomJoinHandler } from "../../chat/hooks/useRoomJoinHandler";
import type { ChatRoomInfo } from "../../chat/types";
import HomeEmptyState from "./HomeEmptyState";

interface SuggestedRoomsSectionProps {
  rooms: ChatRoomInfo[];
}

function SuggestedRoomsSection({ rooms }: SuggestedRoomsSectionProps) {
  const { rowErrors, conflictRoom, setConflictRoom, attemptJoin } =
    useRoomJoinHandler();

  return (
    <Box as="section">
      <Heading as="h2" fontSize="18px" fontWeight="700" color="ink" m="0">
        Might wanna <chakra.span color="accent">join</chakra.span>
      </Heading>

      {rooms.length === 0 ? (
        <HomeEmptyState message="No relevant chat rooms active. Review, favorite, or list an album to get matched with rooms about it." />
      ) : (
        <chakra.ul listStyle="none" m="16px 0 0" p="0">
          {rooms.map((room) => (
            <ChatRoomRow
              key={room.id}
              room={room}
              actionLabel={actionLabelFor(room)}
              actionDisabled={room.myStatus === "PENDING"}
              onAction={() => void attemptJoin(room)}
              error={rowErrors[room.id] || null}
            />
          ))}
        </chakra.ul>
      )}

      {conflictRoom && (
        <ConfirmActionModal
          title="Switch Chat Room"
          message="You are already in a chat room. Leave it and join this one?"
          confirmLabel="Leave & join"
          confirmingLabel="Switching…"
          onConfirm={() => attemptJoin(conflictRoom, true)}
          onClose={() => setConflictRoom(null)}
        />
      )}
    </Box>
  );
}

export default SuggestedRoomsSection;
