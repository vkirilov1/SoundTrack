import { Flex, Text } from "@chakra-ui/react";
import Avatar from "../../../components/Avatar/Avatar";
import PillButton from "../../../components/buttons/PillButton";
import { userPhotoUrl } from "../../../utils/images";
import type { UserProfile } from "../../../types/auth";

interface InviteUserRowProps {
  user: UserProfile;
  alreadyMember: boolean;
  invited: boolean;
  onInvite: (user: UserProfile) => void;
}

function InviteUserRow({
  user,
  alreadyMember,
  invited,
  onInvite,
}: InviteUserRowProps) {
  return (
    <Flex align="center" gap="10px" px="14px" py="8px">
      <Avatar
        src={userPhotoUrl(user.profilePictureUrl ?? "userDefault.png")}
        alt={user.username}
        size="30px"
      />
      <Text
        m="0"
        flex="1"
        minW="0"
        fontSize="13px"
        fontWeight="600"
        color="ink"
        truncate
      >
        {user.username}
      </Text>
      {alreadyMember ? (
        <Text m="0" fontSize="12px" color="text">
          In chat
        </Text>
      ) : (
        <PillButton
          onClick={() => onInvite(user)}
          disabled={invited}
          muted={invited}
          fontSize="12px"
          px="12px"
          py="5px"
        >
          {invited ? "Invited" : "Invite"}
        </PillButton>
      )}
    </Flex>
  );
}

export default InviteUserRow;
