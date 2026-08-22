import { Box, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import PageContainer from "../../components/PageContainer/PageContainer";

interface MembersOnlyMessageProps {
  header: string;
  content: string;
}
function MembersOnlyMessage({ header, content }: MembersOnlyMessageProps) {
  return (
    <PageContainer>
      <Box textAlign="center" py="80px">
        <Text m="0" fontSize="22px" fontWeight="700" color="ink">
          {header}
        </Text>
        <Text m="0" mt="8px" fontSize="14px" color="text">
          {content}
        </Text>
        <Link
          asChild
          display="inline-block"
          mt="20px"
          bg="accent"
          color="white"
          fontSize="14px"
          fontWeight="600"
          px="24px"
          py="10px"
          borderRadius="full"
          textDecoration="none"
          _hover={{ bg: "accentHover", color: "white" }}
        >
          <RouterLink to="/login">Sign In</RouterLink>
        </Link>
      </Box>
    </PageContainer>
  );
}

export default MembersOnlyMessage;
