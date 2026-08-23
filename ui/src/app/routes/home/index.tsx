import { useAuth } from "../../../features/auth/stores/useAuth";
import HomeFeed from "../../../features/home/components/HomeFeed";
import Hero from "../../../features/home/components/Hero";
import ShowcaseSection from "../../../features/home/components/ShowcaseSection";

function Home() {
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) {
    return (
      <>
        <Hero />
        <ShowcaseSection />
      </>
    );
  }

  return <HomeFeed />;
}

export default Home;
