import type { SubmitEvent } from "react";
import { Box, chakra, Text } from "@chakra-ui/react";
import type { AddStatus } from "../hooks/useAddToListMenu";
import type { UserListSummary } from "../../../types/list";
import PrimaryButton from "../../../components/buttons/PrimaryButton";

interface AddToListMenuProps {
  lists: UserListSummary[] | null;
  listsLoading: boolean;
  addStatus: Record<number, AddStatus>;
  menuError: string | null;
  newListName: string;
  onNewListNameChange: (value: string) => void;
  creatingList: boolean;
  onAddToList: (listId: number) => void;
  onCreateList: (event: SubmitEvent<HTMLFormElement>) => void;
}

function AddToListMenu({
  lists,
  listsLoading,
  addStatus,
  menuError,
  newListName,
  onNewListNameChange,
  creatingList,
  onAddToList,
  onCreateList,
}: AddToListMenuProps) {
  return (
    <Box
      position="absolute"
      top="calc(100% + 8px)"
      left="0"
      zIndex="10"
      w="240px"
      bg="bg"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
      boxShadow="0 12px 28px rgba(0, 0, 0, 0.12)"
      p="10px"
    >
      {listsLoading ? (
        <Text m="4px 2px" fontSize="13px" color="text">
          Loading your lists…
        </Text>
      ) : lists && lists.length > 0 ? (
        <chakra.ul listStyle="none" m="0" p="0" maxH="200px" overflowY="auto">
          {lists.map((list) => {
            const status = addStatus[list.id] ?? "idle";
            return (
              <li key={list.id}>
                <chakra.button
                  type="button"
                  onClick={() => onAddToList(list.id)}
                  disabled={status === "adding" || status === "added"}
                  w="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="8px"
                  font="inherit"
                  fontSize="13px"
                  color="ink"
                  bg="none"
                  border="none"
                  borderRadius="md"
                  p="8px"
                  cursor="pointer"
                  textAlign="left"
                  _hover={
                    status === "adding" || status === "added"
                      ? undefined
                      : { bg: "border" }
                  }
                  _disabled={{ cursor: "default" }}
                >
                  <Box
                    as="span"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {list.name}
                  </Box>
                  <Box as="span" flexShrink="0" fontSize="11px" color="accent">
                    {status === "adding"
                      ? "Adding…"
                      : status === "added"
                        ? "Added ✓"
                        : ""}
                  </Box>
                </chakra.button>
              </li>
            );
          })}
        </chakra.ul>
      ) : (
        <Text m="4px 2px" fontSize="13px" color="text">
          You don't have any lists yet.
        </Text>
      )}

      {menuError && (
        <Text m="6px 2px 0" fontSize="12px" color="danger">
          {menuError}
        </Text>
      )}

      <chakra.form
        onSubmit={onCreateList}
        mt="8px"
        pt="8px"
        borderTop="1px solid"
        borderColor="border"
        display="flex"
        gap="6px"
      >
        <chakra.input
          type="text"
          placeholder="New list name"
          value={newListName}
          maxLength={255}
          onChange={(event) => onNewListNameChange(event.target.value)}
          flex="1"
          minW="0"
          font="inherit"
          fontSize="12px"
          color="ink"
          bg="bg"
          border="1px solid"
          borderColor="border"
          borderRadius="md"
          px="8px"
          py="6px"
          outline="none"
          _focus={{ borderColor: "accent" }}
        />
        <PrimaryButton
          type="submit"
          disabled={creatingList || !newListName.trim()}
          flexShrink="0"
          fontSize="12px"
          px="12px"
          py="6px"
          h="auto"
        >
          Create
        </PrimaryButton>
      </chakra.form>
    </Box>
  );
}

export default AddToListMenu;
