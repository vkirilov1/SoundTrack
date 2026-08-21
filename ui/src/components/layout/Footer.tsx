import { Box, Flex, HStack, Image, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import logo from "../../assets/SoundTrackLogo.png";

const FOOTER_LINKS = ["Contact Us", "About", "Blog", "FAQ"];

const LEGAL_LINKS: { label: string; to?: string }[] = [
  { label: "Terms of Use", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Legal Policies" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "#",
    path: "M8 2h8a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6m0 2a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4zm8.5 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  },
  {
    label: "X",
    href: "#",
    path: "M3 3h4.6l4 5.4L16.4 3H20l-6.4 7.9L20.6 21H16l-4.4-5.9L6.2 21H2.6l6.8-8.4z",
  },
  {
    label: "Facebook",
    href: "#",
    path: "M14 8.5V6.8c0-.8.5-1 .9-1H16V2.5h-2.4C11 2.5 10.5 4.6 10.5 6.6v1.9H8.5v3.2h2v9.8h3.5v-9.8h2.4l.4-3.2z",
  },
  {
    label: "TikTok",
    href: "#",
    path: "M16.6 5.82a4.28 4.28 0 0 1-3.02-3.66h-3.02v13.13a2.6 2.6 0 0 1-4.68 1.57 2.6 2.6 0 0 1 2.6-4.13v-3.06a5.66 5.66 0 0 0-4.6 8.94 5.66 5.66 0 0 0 10.28-3.32V9.01a7.3 7.3 0 0 0 4.24 1.35V7.34a4.28 4.28 0 0 1-1.8-1.52",
  },
];

function Footer() {
  return (
    <Box as="footer" bg="inkBlack" mt="40px">
      <Flex
        w="100%"
        maxW="contentWidth"
        mx="auto"
        px="24px"
        py="40px"
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align="flex-start"
        gap="24px"
      >
        <VStack align="flex-start" gap="10px">
          <Image src={logo} alt="SoundTrack" h="40px" w="auto" />
          <HStack gap="14px">
            {SOCIAL_LINKS.map(({ label, href, path }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                color="white"
                opacity="0.75"
                display="inline-flex"
                transition="opacity 0.2s"
                _hover={{ color: "white", opacity: 1 }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={path} />
                </svg>
              </Link>
            ))}
          </HStack>
        </VStack>

        <VStack align={{ base: "flex-start", sm: "flex-end" }} gap="20px">
          <HStack as="nav" gap="24px">
            {FOOTER_LINKS.map((label) => (
              <Link
                key={label}
                href="*"
                color="white"
                fontSize="13px"
                textDecoration="none"
                opacity="0.85"
                _hover={{ color: "white", opacity: 1 }}
              >
                {label}
              </Link>
            ))}
          </HStack>
          <Text color="white" opacity="0.6" fontSize="12px" textAlign="right">
            SoundTrack Limited © 2026. All rights reserved
            {LEGAL_LINKS.map(({ label, to }) => (
              <Text as="span" key={label}>
                {" · "}
                {to ? (
                  <Link
                    asChild
                    color="white"
                    textDecoration="none"
                    _hover={{ color: "white", textDecoration: "underline" }}
                  >
                    <RouterLink to={to}>{label}</RouterLink>
                  </Link>
                ) : (
                  <Link
                    href="#"
                    color="white"
                    textDecoration="none"
                    _hover={{ color: "white", textDecoration: "underline" }}
                  >
                    {label}
                  </Link>
                )}
              </Text>
            ))}
          </Text>
        </VStack>
      </Flex>
    </Box>
  );
}

export default Footer;
