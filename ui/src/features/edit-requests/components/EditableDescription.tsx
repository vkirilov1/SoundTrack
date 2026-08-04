import { useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import { useAuth } from "../../auth/stores/useAuth";
import { useReadMore } from "../../../hooks/useReadMore";
import TextButton from "../../../components/buttons/TextButton";
import type { EditRequestTargetType } from "../types";
import AdminDescriptionEditButton from "./AdminDescriptionEditButton";
import SuggestEditLink from "./SuggestEditLink";

interface EditableDescriptionProps {
  text: string | null;
  emptyText?: string;
  targetType: EditRequestTargetType;
  targetId: number;
  onSave: (text: string) => Promise<unknown>;

  maxW?: string;
  align?: "left" | "center";
}

function EditableDescription({
  text,
  emptyText = "No description yet.",
  targetType,
  targetId,
  onSave,
  maxW,
  align = "left",
}: EditableDescriptionProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const [editing, setEditing] = useState(false);
  const { displayText, showToggle, expanded, toggle } = useReadMore(text);
  const centered = align === "center";

  return (
    <>
      {!editing &&
        (displayText ? (
          <Text
            maxW={maxW}
            mx={centered ? "auto" : undefined}
            fontSize="14px"
            lineHeight="1.6"
            color="text"
            textAlign="left"
            overflowWrap="break-word"
            wordBreak="break-word"
          >
            {displayText}
          </Text>
        ) : (
          <Text
            maxW={maxW}
            mx={centered ? "auto" : undefined}
            fontSize="14px"
            fontStyle="italic"
            color="text"
            opacity="0.7"
            textAlign="left"
          >
            {emptyText}
          </Text>
        ))}

      <Box
        mt="10px"
        w="100%"
        maxW={maxW}
        mx={centered ? "auto" : undefined}
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        justifyContent={centered ? "center" : "flex-start"}
        gap="16px"
      >
        {!editing && showToggle && (
          <TextButton onClick={toggle}>
            {expanded ? "Show less" : "Read more"}
          </TextButton>
        )}

        {isAdmin ? (
          <AdminDescriptionEditButton
            currentDescription={text}
            onSaveDescription={onSave}
            onEditingChange={setEditing}
          />
        ) : (
          currentUser && (
            <SuggestEditLink
              targetType={targetType}
              targetId={targetId}
              currentDescription={text}
              onEditingChange={setEditing}
            />
          )
        )}
      </Box>
    </>
  );
}

export default EditableDescription;
