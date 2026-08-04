import { Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

interface AuthSwitchLinkProps {
  prompt: string;
  linkText: string;
  to: string;
}

function AuthSwitchLink({ prompt, linkText, to }: AuthSwitchLinkProps) {
  return (
    <Text fontSize="14px" color="ink" m="0">
      {prompt}{" "}
      <Link asChild textDecoration="underline">
        <RouterLink to={to}>{linkText}</RouterLink>
      </Link>
      .
    </Text>
  );
}

export default AuthSwitchLink;
