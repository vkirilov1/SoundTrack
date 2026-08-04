import { keyframes } from "@emotion/react";
import { chakra } from "@chakra-ui/react";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

interface SpinnerProps {
  size?: number;
  label?: string;
}

function Spinner({ size = 28, label = "Loading" }: SpinnerProps) {
  return (
    <chakra.span
      role="status"
      aria-label={label}
      display="inline-block"
      w={`${size}px`}
      h={`${size}px`}
      border="3px solid"
      borderColor="border"
      borderTopColor="accent"
      borderRadius="full"
      css={{ animation: `${spin} 0.7s linear infinite` }}
    />
  );
}

export default Spinner;
