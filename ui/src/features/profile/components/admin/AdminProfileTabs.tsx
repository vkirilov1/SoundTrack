import { useState } from "react";
import { Box, Tabs } from "@chakra-ui/react";
import RequestsCard from "../../../edit-requests/components/RequestsCard";
import ChatReportsCard from "../../../chat/moderation/components/ChatReportsCard";
import SubmittedAlbumsCard from "../../../drops/moderation/components/SubmittedAlbumsCard";

type AdminTab = "edit-requests" | "chat-reports" | "submitted-albums";

function AdminProfileTabs() {
  const [adminTab, setAdminTab] = useState<AdminTab>("edit-requests");

  return (
    <Tabs.Root
      value={adminTab}
      onValueChange={(details) => setAdminTab(details.value as AdminTab)}
      variant="line"
      lazyMount
      unmountOnExit
      mt="32px"
    >
      <Tabs.List justifyContent="center" gap="32px" borderColor="border">
        <Tabs.Trigger
          value="edit-requests"
          fontSize="15px"
          color="text"
          px="4px"
          py="8px"
          pb="14px"
          cursor="pointer"
          _selected={{
            color: "ink",
            fontWeight: "600",
            "--indicator-color": "var(--chakra-colors-accent)",
          }}
        >
          Edit Requests
        </Tabs.Trigger>
        <Tabs.Trigger
          value="chat-reports"
          fontSize="15px"
          color="text"
          px="4px"
          py="8px"
          pb="14px"
          cursor="pointer"
          _selected={{
            color: "ink",
            fontWeight: "600",
            "--indicator-color": "var(--chakra-colors-accent)",
          }}
        >
          Chat Reports
        </Tabs.Trigger>
        <Tabs.Trigger
          value="submitted-albums"
          fontSize="15px"
          color="text"
          px="4px"
          py="8px"
          pb="14px"
          cursor="pointer"
          _selected={{
            color: "ink",
            fontWeight: "600",
            "--indicator-color": "var(--chakra-colors-accent)",
          }}
        >
          Submitted Albums
        </Tabs.Trigger>
      </Tabs.List>

      <Box mt="32px" display="flex" justifyContent="center">
        <Box w="100%" maxW="600px" minW="0">
          <Tabs.Content value="edit-requests">
            <RequestsCard />
          </Tabs.Content>
          <Tabs.Content value="chat-reports">
            <ChatReportsCard />
          </Tabs.Content>
          <Tabs.Content value="submitted-albums">
            <SubmittedAlbumsCard />
          </Tabs.Content>
        </Box>
      </Box>
    </Tabs.Root>
  );
}

export default AdminProfileTabs;
