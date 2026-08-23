import { useAuth } from "../../../features/auth/stores/useAuth";
import HomeFeed from "../../../features/home/components/HomeFeed";
import Hero from "./components/Hero";
import ConnectSection from "./components/ConnectSection";

function Home() {
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) {
    return (
      <>
        <Hero />
        <ConnectSection />
      </>
    );
  }

  return <HomeFeed />;
}

export default Home;
