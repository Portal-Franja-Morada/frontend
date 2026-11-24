import { useEffect, useState } from "react";
import type { DataState } from "../lib/data-state";
import { readDataStateFromUrl } from "../lib/data-state";
import { FeaturedAgenda } from "./FeaturedAgenda";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { LatestNews } from "./LatestNews";
import { QuickTools } from "./QuickTools";
import { RegisterCta } from "./RegisterCta";

type LandingPageProps = {
  dataState?: DataState;
};

export function LandingPage({
  dataState: dataStateFromServer = "ok",
}: LandingPageProps) {
  const [dataState, setDataState] = useState<DataState>(dataStateFromServer);

  useEffect(() => {
    setDataState(readDataStateFromUrl());
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <QuickTools />
        <FeaturedAgenda dataState={dataState} />
        <LatestNews dataState={dataState} />
        <RegisterCta />
      </main>
      <Footer />
    </>
  );
}
