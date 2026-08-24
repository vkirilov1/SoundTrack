import { Box, Heading, Link, Text, chakra } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import PageContainer from "../../components/PageContainer/PageContainer";
import ScreenshotFrame from "../../features/home/components/ScreenshotFrame";
import chatExample from "../../assets/chatExample.png";

function AboutRoute() {
  return (
    <PageContainer maxW="760px">
      <Heading as="h1" fontSize="30px" m="0">
        About SoundTrack
      </Heading>

      <Text mt="20px" fontSize="15px" lineHeight="1.7" color="ink">
        SoundTrack is a place to rate and review the music you listen to, keep
        track of what you love, and talk about it with people who get it.
      </Text>

      <Box as="section" mt="40px">
        <Heading as="h2" fontSize="20px" m="0" mb="12px">
          What you can do here
        </Heading>
        <Text fontSize="14px" lineHeight="1.7" color="ink">
          Rate and review albums, build ranked lists for any occasion, favorite
          the songs and albums that shaped your taste, follow other listeners
          whose opinions you trust, and browse charts by year, genre, or all
          time - all built on real reviews.
        </Text>
      </Box>

      <Box as="section" mt="40px">
        <Heading as="h2" fontSize="20px" m="0" mb="12px">
          <chakra.span color="accent">Live chat</chakra.span>, the part that's
          ours
        </Heading>
        <Text fontSize="14px" lineHeight="1.7" color="ink" maxW="480px">
          Most music sites let you leave a review and walk away. SoundTrack adds
          chat rooms built around a specific album or artist - jump in the
          moment you want to talk about something, with people who are into the
          same thing right now.
        </Text>
        <Text
          mt="10px"
          fontSize="14px"
          lineHeight="1.7"
          color="ink"
          maxW="480px"
        >
          Rooms are temporary by design: one exists while its conversation is
          alive, and closes once it isn't - no permanent chat log to scroll
          through, just the moment.
        </Text>

        <Box mt="24px" maxW="360px">
          <ScreenshotFrame
            src={chatExample}
            alt="A live chat room discussing King Crimson's In the Court of the Crimson King"
          />
        </Box>
      </Box>

      <Box as="section" mt="40px">
        <Heading as="h2" fontSize="20px" m="0" mb="12px">
          Where the data comes from
        </Heading>
        <Text fontSize="14px" lineHeight="1.7" color="ink">
          Album and artist information, including cover art, is sourced from
          MusicBrainz and the Cover Art Archive - open, community- maintained
          music databases. See our{" "}
          <Link asChild color="accent" textDecoration="underline">
            <RouterLink to="/terms">Terms of Use</RouterLink>
          </Link>{" "}
          for the details.
        </Text>
      </Box>

      <Text mt="40px" fontSize="14px" lineHeight="1.7" color="text">
        Curious?{" "}
        <Link asChild color="accent" textDecoration="underline">
          <RouterLink to="/register">Create an account</RouterLink>
        </Link>{" "}
        and see what people are listening to right now.
      </Text>
    </PageContainer>
  );
}

export default AboutRoute;
