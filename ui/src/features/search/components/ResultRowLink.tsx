import type { ReactNode } from "react";
import { Link, Text, chakra, type TextProps } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

interface ResultRowLinkProps {
  to: string;
  onNavigate: () => void;
  children: ReactNode;
}

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

interface ResultRowButtonProps {
  onSelect: () => void;
  children: ReactNode;
}

export function ResultRowButton({ onSelect, children }: ResultRowButtonProps) {
  return (
    <chakra.button
      type="button"
      onClick={onSelect}
      w="100%"
      display="flex"
      alignItems="center"
      gap="10px"
      px="6px"
      py="8px"
      bg="none"
      border="none"
      borderRadius="md"
      color="inherit"
      textAlign="left"
      cursor="pointer"
      _hover={{ bg: "border" }}
    >
      {children}
    </chakra.button>
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
