import type { ReactNode } from "react";
import type { SubmitEvent } from "react";
import { Box, chakra } from "@chakra-ui/react";

interface AuthFormShellProps {
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

function AuthFormShell({ onSubmit, children }: AuthFormShellProps) {
  return (
    <Box
      as="section"
      w="100%"
      maxW="contentWidth"
      mx="auto"
      px="24px"
      pt="56px"
      pb="80px"
      display="flex"
      justifyContent="center"
    >
      <chakra.form
        onSubmit={onSubmit}
        noValidate
        w="100%"
        maxW="440px"
        display="flex"
        flexDirection="column"
        gap="20px"
      >
        {children}
      </chakra.form>
    </Box>
  );
}

export default AuthFormShell;
