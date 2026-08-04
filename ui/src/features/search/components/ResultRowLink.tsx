import type { ReactNode } from "react";
import { Link, Text, type TextProps } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

interface ResultRowLinkProps {
  to: string;
  onNavigate: () => void;
  children: ReactNode;
}

/** The row shell (link + hover background) shared by every search result row variant. */
function ResultRowLink({ to, onNavigate, children }: ResultRowLinkProps) {
  return (
    <Link
      asChild
      display="flex"
      alignItems="center"
      gap="10px"
      px="6px"
      py="8px"
      borderRadius="md"
      color="inherit"
      textDecoration="none"
      _hover={{ bg: "border" }}
    >
      <RouterLink to={to} onClick={onNavigate}>
        {children}
      </RouterLink>
    </Link>
  );
}

export function ResultTitle(props: TextProps) {
  return (
    <Text
      as="span"
      fontSize="14px"
      fontWeight="600"
      color="ink"
      overflow="hidden"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
      {...props}
    />
  );
}

export default ResultRowLink;
