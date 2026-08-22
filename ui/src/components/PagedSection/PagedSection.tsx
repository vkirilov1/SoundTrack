import type { ReactNode } from "react";
import { Box, Image, Text, VStack } from "@chakra-ui/react";
import missingResourcesIcon from "../../assets/MissingResources.png";
import Spinner from "../Spinner/Spinner";

interface PagedSectionProps {
  loading: boolean;
  listLoading: boolean;
  isEmpty: boolean;
  emptyMessage?: string;
  spinnerLabel: string;
  children: ReactNode;
}

function PagedSection({
  loading,
  listLoading,
  isEmpty,
  emptyMessage,
  spinnerLabel,
  children,
}: PagedSectionProps) {
  return (
    <Box position="relative">
      <Box
        transition="filter 0.15s ease"
        filter={listLoading ? "blur(4px)" : undefined}
        pointerEvents={listLoading ? "none" : undefined}
      >
        {loading ? (
          <VStack
            gap="8px"
            mt="16px"
            py="20px"
            fontSize="14px"
            color="text"
            textAlign="center"
          >
            <Spinner label={spinnerLabel} />
          </VStack>
        ) : isEmpty && emptyMessage ? (
          <VStack
            gap="8px"
            mt="16px"
            py="20px"
            fontSize="14px"
            color="text"
            textAlign="center"
          >
            <Image
              src={missingResourcesIcon}
              alt=""
              boxSize="40px"
              opacity="0.55"
            />
            <Text m="0">{emptyMessage}</Text>
          </VStack>
        ) : (
          children
        )}
      </Box>
      {listLoading && (
        <Box
          position="absolute"
          inset="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner label={spinnerLabel} />
        </Box>
      )}
    </Box>
  );
}

export default PagedSection;
