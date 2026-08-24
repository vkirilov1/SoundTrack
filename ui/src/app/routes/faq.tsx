import { useMemo, useState, type ReactNode } from "react";
import { Accordion, Box, Heading, Input, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import PageContainer from "../../components/PageContainer/PageContainer";
import SearchIcon from "../../components/icons/SearchIcon";

interface FaqItem {
  id: string;
  question: string;
  answer: ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "rate-album",
    question: "How do I rate and review an album?",
    answer:
      "Open any album's page and pick a rating (in half-star increments). You should also add a written review alongside it.",
  },
  {
    id: "create-list",
    question: "How do I create a list?",
    answer:
      "Go to your profile's Lists tab and click the ➕ button below your lists. Name it, and optionally search for albums to add right there.",
  },
  {
    id: "favorite",
    question: "How do I favorite an album or song?",
    answer: "Click the heart icon on any album or song page.",
  },
  {
    id: "follow",
    question: "How do I follow another user?",
    answer:
      "Visit their profile and click Follow. Reviews from people you follow are pinned to the top when you're browsing an album they've reviewed.",
  },
  {
    id: "join-chat",
    question: "How do I join a live chat room?",
    answer:
      "Head to Chats and browse rooms built around an album or artist you're into, then click Join. Some rooms require the owner to approve your request first.",
  },
  {
    id: "create-chat",
    question: "How do I start my own chat room?",
    answer:
      "From Chats, click the ➕ button and pick an album or artist as the topic. The room stays open as long as you're in it - it closes automatically once you leave.",
  },
  {
    id: "suggest-edit",
    question:
      "How do I suggest a correction to an album or artist description?",
    answer:
      'Look for the "Suggest an edit" link near the description on any album or artist page. Propose your text and an admin will review it - you\'ll be notified either way.',
  },
  {
    id: "suggest-album",
    question: "How do I suggest a new album be added?",
    answer:
      "On the Drops page, use the ➕ button to tell us what's missing and we'll look into adding it.",
  },
  {
    id: "forgot-password",
    question: "I forgot my password - now what?",
    answer:
      'On the login page, click "Forgotten Password?" and enter your email. We\'ll send you a link to choose a new one.',
  },
  {
    id: "delete-account",
    question: "How do I delete my account?",
    answer:
      "Open your profile settings and find the Danger Zone at the bottom, then Delete Account. You'll have 30 days to undo it via an emailed link before it's permanently erased.",
  },
  {
    id: "chat-privacy",
    question: "Is chat private?",
    answer:
      "No - anything you send is visible to everyone currently in the room, and can be reported. Once a room closes, its messages are gone for good (aside from a short snippet kept for review if it was reported).",
  },
  {
    id: "chat-appeal",
    question: "My chat permissions were revoked - can I appeal?",
    answer: (
      <>
        Yes. If you think a chat moderation action was a mistake,{" "}
        <Link asChild color="accent" textDecoration="underline">
          <RouterLink to="/contact?type=CHAT_APPEAL">contact us</RouterLink>
        </Link>{" "}
        and we'll take a look.
      </>
    ),
  },
];

function FaqRoute() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        (typeof item.answer === "string" &&
          item.answer.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <PageContainer maxW="680px">
      <Heading as="h1" fontSize="30px" m="0" textAlign="center">
        Frequently Asked Questions
      </Heading>

      <Box position="relative" mt="24px" mb="28px">
        <Box
          position="absolute"
          left="16px"
          top="50%"
          transform="translateY(-50%)"
          color="text"
          opacity="0.6"
          pointerEvents="none"
        >
          <SearchIcon size={16} />
        </Box>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a question"
          pl="42px"
          h="46px"
          borderRadius="full"
          borderColor="border"
          bg="bg"
          _focus={{ outline: "none", borderColor: "accent" }}
        />
      </Box>

      {filtered.length === 0 ? (
        <Text textAlign="center" color="text" fontSize="14px">
          No questions match "{query}".
        </Text>
      ) : (
        <Accordion.Root collapsible defaultValue={[FAQ_ITEMS[0].id]}>
          <Box display="flex" flexDirection="column" gap="10px">
            {filtered.map((item) => (
              <Accordion.Item
                key={item.id}
                value={item.id}
                bg="bg"
                border="1px solid"
                borderColor="border"
                borderRadius="lg"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
                overflow="hidden"
              >
                <Accordion.ItemTrigger
                  px="20px"
                  py="16px"
                  fontSize="15px"
                  fontWeight="600"
                  color="ink"
                  cursor="pointer"
                >
                  {item.question}
                  <Accordion.ItemIndicator color="text" />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Accordion.ItemBody
                    px="20px"
                    pb="16px"
                    fontSize="14px"
                    lineHeight="1.65"
                    color="text"
                  >
                    {item.answer}
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Box>
        </Accordion.Root>
      )}
    </PageContainer>
  );
}

export default FaqRoute;
