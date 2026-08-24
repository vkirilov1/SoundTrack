import { useSearchParams } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { useAuth } from "../../../features/auth/stores/useAuth";
import HomeFeed from "../../../features/home/components/HomeFeed";
import Hero from "../../../features/home/components/Hero";
import ShowcaseSection from "../../../features/home/components/ShowcaseSection";
import FormSuccessBanner from "../../../components/FormErrorBanner/FormSuccessBanner";

function Home() {
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const accountDeleted = searchParams.get("accountDeleted") === "1";

  if (!isLoading && !user) {
    return (
      <>
        {accountDeleted && (
          <Box w="100%" maxW="contentWidth" mx="auto" pt="24px" px="24px">
            <FormSuccessBanner>
              Your account has been deleted. Check your email for a link to
              restore it within 30 days.
            </FormSuccessBanner>
          </Box>
        )}
        <Hero />
        <ShowcaseSection />
      </>
    );
  }

  return <HomeFeed />;
}

export default Home;
