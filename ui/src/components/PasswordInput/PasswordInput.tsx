import { useState } from "react";
import { Box, chakra, Input, type InputProps } from "@chakra-ui/react";

interface PasswordInputProps extends Omit<
  InputProps,
  "value" | "onChange" | "type"
> {
  value: string;
  onChange: (value: string) => void;
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M6.5 6.6C3.7 8.4 1.5 12 1.5 12s3.5 7 10.5 7a10.4 10.4 0 0 0 4.2-.85M10.6 5.1A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a13.2 13.2 0 0 1-3.5 4.5" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

function PasswordInput({ value, onChange, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Box position="relative" display="flex" w="100%">
      <Input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        w="100%"
        pr="40px"
        {...rest}
      />
      <chakra.button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={-1}
        position="absolute"
        top="50%"
        right="8px"
        transform="translateY(-50%)"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        w="28px"
        h="28px"
        bg="none"
        border="none"
        borderRadius="full"
        color="text"
        cursor="pointer"
        _hover={{ color: "ink", bg: "border" }}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </chakra.button>
    </Box>
  );
}

export default PasswordInput;
