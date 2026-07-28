import { lazy, Suspense } from "react";
import Home from "./pages/Home";
const ChatWidget = lazy(async () => import("./components/ChatWidget").then((module) => ({ default: module.ChatWidget })));
const TargetMode = lazy(() => import("./components/target-mode/TargetMode"));
const AdminPage = lazy(() => import("./pages/Admin"));
const HumanResourcesPage = lazy(() => import("./pages/HumanResources"));
const ServicesPageLazy = lazy(() => import("./pages/Services"));
const StyleGuide = lazy(() => import("./pages/StyleGuide"));
const ContactPageLazy = lazy(() => import("./pages/Contact"));
const TalentPreviewPageLazy = lazy(() => import("./pages/TalentPreview"));
const PrivacyTermsPage = lazy(() => import("./pages/PrivacyTerms"));
const VideoPageLazy = lazy(() => import("./pages/Video"));
const AboutMePageLazy = lazy(() => import("./pages/AboutMe"));

function Page() {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";

  if (pathname === "/human-resources") return <HumanResourcesPage />;
  if (pathname === "/services") return <ServicesPageLazy />;
  if (pathname === "/style") return <StyleGuide />;
  if (pathname === "/talent-preview") return <TalentPreviewPageLazy />;
  if (pathname === "/about-me") return <AboutMePageLazy />;
  if (pathname === "/contact") return <ContactPageLazy />;
  if (pathname === "/video") return <Home />;
  if (pathname === "/adm") return <AdminPage />;
  if (pathname === "/privacy" || pathname === "/terms") return <PrivacyTermsPage />;
  return <VideoPageLazy />;
}

export default function App() {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const showChat = pathname !== "/adm";

  return (
    <Suspense fallback={null}>
      <Page />
      {showChat ? <ChatWidget /> : null}
      <TargetMode />
    </Suspense>
  );
}
