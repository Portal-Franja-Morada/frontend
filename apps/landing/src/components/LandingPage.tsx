import { useHomeData } from "../hooks/use-home-data";
import { FeaturedAgenda } from "./FeaturedAgenda";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { LatestNews } from "./LatestNews";
import { QuickTools } from "./QuickTools";
import { AccountDeletedBanner } from "./AccountDeletedBanner";
import { RegisterCta } from "./RegisterCta";

export function LandingPage() {
  const { events, news, eventsState, newsState, retry } = useHomeData();

  return (
    <>
      <Header currentPath="/" />
      <AccountDeletedBanner />
      <main>
        <Hero />
        <QuickTools />
        <FeaturedAgenda
          dataState={eventsState}
          events={events}
          onRetry={retry}
        />
        <LatestNews dataState={newsState} news={news} onRetry={retry} />
        <RegisterCta />
      </main>
      <Footer />
    </>
  );
}
