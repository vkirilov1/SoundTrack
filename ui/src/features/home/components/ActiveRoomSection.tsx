import { Box, Heading, chakra } from "@chakra-ui/react";
import ChatRoomRow from "../../chat/components/ChatRoomRow";
import { actionLabelFor } from "../../chat/utils/actionLabel";
import { useRoomJoinHandler } from "../../chat/hooks/useRoomJoinHandler";
import type { ChatRoomInfo } from "../../chat/types";

interface ActiveRoomSectionProps {
  room: ChatRoomInfo;
}

function ActiveRoomSection({ room }: ActiveRoomSectionProps) {
  const { rowErrors, attemptJoin } = useRoomJoinHandler();

  return (
    <Box as="section">
      <Heading as="h2" fontSize="18px" fontWeight="700" color="ink" m="0">
        Jump back <chakra.span color="accent">in</chakra.span>
      </Heading>

      <chakra.ul listStyle="none" m="16px 0 0" p="0">
        <ChatRoomRow
          room={room}
          actionLabel={actionLabelFor(room)}
          onAction={() => void attemptJoin(room)}
          error={rowErrors[room.id] || null}
        />
      </chakra.ul>
    </Box>
  );
}

export default ActiveRoomSection;
