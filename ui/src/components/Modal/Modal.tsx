import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Box } from "@chakra-ui/react";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  maxW?: string;
}

/**
 * Renders straight to document.body via a portal rather than in place, so it's never clipped or
 * z-index-fought by whatever scrollable/positioned container happens to render it.
 */
function Modal({ onClose, children, maxW = "640px" }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <Box
      position="fixed"
      inset="0"
      zIndex="1000"
      bg="rgba(8, 6, 13, 0.55)"
      display="flex"
      alignItems="flex-start"
      justifyContent="center"
      overflowY="auto"
      p={{ base: "16px", sm: "40px 20px" }}
      onClick={onClose}
    >
      <Box
        bg="bg"
        borderRadius="lg"
        boxShadow="0 24px 64px rgba(0, 0, 0, 0.35)"
        w="100%"
        maxW={maxW}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </Box>
    </Box>,
    document.body,
  );
}

export default Modal;
