import { Box, Heading, Link, Text, chakra } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import chatExample from "../../../assets/chatExample.png";
import chatRowExample from "../../../assets/chatRowExample.png";
import reviewExample from "../../../assets/reviewExample.png";
import listExample from "../../../assets/listExample.png";
import favsListExample from "../../../assets/favsListExample.png";
import chartExample from "../../../assets/chartExample.png";
import FeatureRow from "./FeatureRow";

function ShowcaseSection() {
  return (
    <Box w="100%" maxW="contentWidth" mx="auto" py="64px" px="24px">
      <Heading as="h2" fontSize="28px" m="0">
        See what&rsquo;s inside
      </Heading>
      <Text mt="10px" fontSize="16px" color="text" maxW="480px">
        A quick peek inside SoundTrack.
      </Text>

      <FeatureRow
        title={
          <>
            Talk about it, <chakra.span color="accent">live</chakra.span>
          </>
        }
        description="Jump into chat rooms built around the albums and artists you care about. Share your thoughts with people, in real time."
        image={chatExample}
        imageAlt="A live chat room discussion"
        overlayImage={chatRowExample}
        overlayImageAlt="A chat room preview card"
      />

      <FeatureRow
        title={
          <>
            Rate and review <chakra.span color="accent">everything</chakra.span>
          </>
        }
        description="Tell your story with each piece, and see how other listeners felt too."
        image={reviewExample}
        imageAlt="A thoughtfully written review"
        layout="banner"
      />

      <FeatureRow
        title={
          <>
            Curate and <chakra.span color="accent">share</chakra.span>
          </>
        }
        description="Build ranked lists for any occasion - and share them with the world."
        image={listExample}
        imageAlt="A user-created list"
      />

      <FeatureRow
        title={
          <>
            Highlight your <chakra.span color="accent">favorites</chakra.span>
          </>
        }
        description="Pin the albums that shaped your taste to your profile, front and center for anyone who visits."
        image={favsListExample}
        imageAlt="A user's favorites list of albums"
        reverse
      />

      <FeatureRow
        title={
          <>
            Discover the <chakra.span color="accent">best</chakra.span>
          </>
        }
        description="Browse community-rated charts by year, genre, or all time - powered by real reviews."
        image={chartExample}
        imageAlt="A chart of the highest rated albums of all time"
        layout="banner"
      />

      <Box
        mt="24px"
        p="40px 24px"
        textAlign="center"
        bg="accentBg"
        borderRadius="lg"
      >
        <Heading as="h3" fontSize="22px" m="0">
          Ready to join in?
        </Heading>
        <Text mt="8px" fontSize="15px" color="text">
          Create an account and start building your own corner of SoundTrack.
        </Text>
        <Link
          asChild
          display="inline-block"
          mt="20px"
          bg="accent"
          color="white"
          fontSize="14px"
          fontWeight="600"
          textDecoration="none"
          px="28px"
          py="12px"
          borderRadius="md"
          transition="background 0.2s"
          _hover={{ bg: "accentHover", color: "white" }}
        >
          <RouterLink to="/register">Register</RouterLink>
        </Link>
      </Box>
    </Box>
  );
}

export default ShowcaseSection;
