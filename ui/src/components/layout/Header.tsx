import { Box, Flex, HStack, Image, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import logo from "../../assets/SoundTrackLogo.png";
import SearchBar from "../../features/search/components/SearchBar";
import { useAuth } from "../../features/auth/stores/useAuth";

const NAV_LINKS = ["Charts", "Chats", "Drops"];

function Header() {
  const { user, logout } = useAuth();

  return (
    <Box as="header" bg="inkBlack">
      <Flex
        w="100%"
        maxW="contentWidth"
        mx="auto"
        px="24px"
        py="18px"
        align="center"
        gap="40px"
      >
        <Link asChild display="flex" alignItems="center" lineHeight="0">
          <RouterLink to="/">
            <Image src={logo} alt="SoundTrack" h="50px" w="auto" />
          </RouterLink>
        </Link>

        <Flex flex="1" align="center" justify="flex-end" gap="32px">
          <SearchBar />

          <HStack as="nav" gap="28px" display={{ base: "none", sm: "flex" }}>
            {NAV_LINKS.map((label) => (
              <Link
                key={label}
                href="*"
                color="white"
                fontSize="14px"
                textDecoration="none"
                opacity="0.85"
                transition="opacity 0.2s"
                _hover={{ color: "white", opacity: 1 }}
              >
                {label}
              </Link>
            ))}
          </HStack>

          {user ? (
            <HStack gap="12px">
              <Link
                asChild
                color="white"
                fontSize="14px"
                fontWeight="600"
                textDecoration="none"
                whiteSpace="nowrap"
                _hover={{ color: "gray.200" }}
              >
                <RouterLink to={`/profile/${user.id}`}>
                  {user.username}
                </RouterLink>
              </Link>
              <Link
                asChild
                bg="transparent"
                border="1px solid rgba(255, 255, 255, 0.3)"
                color="white"
                fontSize="13px"
                px="16px"
                py="9px"
                borderRadius="full"
                textDecoration="none"
                whiteSpace="nowrap"
                transition="background 0.2s, border-color 0.2s"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.1)",
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                <RouterLink to="/" onClick={() => logout()}>
                  Log out
                </RouterLink>
              </Link>
            </HStack>
          ) : (
            <Link
              asChild
              bg="white"
              color="inkBlack"
              fontSize="13px"
              fontWeight="600"
              textDecoration="none"
              px="20px"
              py="10px"
              borderRadius="full"
              whiteSpace="nowrap"
              transition="background 0.2s"
              _hover={{ bg: "#d9d9d9", color: "inkBlack" }}
            >
              <RouterLink to="/login">Sign In</RouterLink>
            </Link>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
