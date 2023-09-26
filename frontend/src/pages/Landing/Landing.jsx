import Layout from "@components/Layout/Layout";
import Hero from "@components/Hero/Hero";
import MobileHero from "@components/Mobile/Hero/Hero";
import { Navigate } from "react-router-dom";
import modelsData from "@config/Models/Models.json";

export default function Landing() {
  const token = localStorage.getItem("JwtToken");
  if (token) {
    return <Navigate to={`/playground/${modelsData[0].name.toLowerCase()}`} />;
  }
  const isMobile = window.innerWidth <= 1100;

  return (
    <>
      {isMobile ? (
        <MobileHero />
      ) : (
        <Layout home>
          <Hero />
        </Layout>
      )}
    </>
  );
}
