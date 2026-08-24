import { chakra, type HTMLChakraProps } from "@chakra-ui/react";

const TONE_COLORS = {
  accent: { color: "accent", hoverColor: "accentHover" },
  danger: { color: "danger", hoverColor: "dangerHover" },
} as const;

interface TextButtonProps extends HTMLChakraProps<"button"> {
  tone?: keyof typeof TONE_COLORS;
}

function TextButton({ tone = "accent", ...rest }: TextButtonProps) {
  const { color, hoverColor } = TONE_COLORS[tone];

  return (
    <chakra.button
      type="button"
      bg="none"
      border="none"
      p="0"
      fontSize="13px"
      fontWeight="600"
      color={color}
      cursor="pointer"
      _hover={{ color: hoverColor }}
      _disabled={{ opacity: 0.7, cursor: "default" }}
      {...rest}
    />
  );
}

export default TextButton;
