import { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isSitesFrontendOnly, openAssistantFallback } from "./lib/sitesRuntime";
import Home from "./pages/Home";

const ChatWidget = lazy(async () => import("./components/ChatWidget").then((module) => ({ default: module.ChatWidget })));
const TargetMode = lazy(() => import("./components/target-mode/TargetMode"));
const AdminPage = lazy(() => import("./pages/Admin"));
const HumanResourcesPage = lazy(() => import("./pages/HumanResources"));
const ServicesPageLazy = lazy(() => import("./pages/Services"));
const ResearchPageLazy = lazy(() => import("./pages/Research"));
const ConcatenatedPromptTechniquePageLazy = lazy(() => import("./pages/ConcatenatedPromptTechnique"));
const UxPromptDesignPageLazy = lazy(() => import("./pages/UxPromptDesign"));
const PromptAppPageLazy = lazy(() => import("./pages/PromptApp"));
const AwardsPageLazy = lazy(() => import("./pages/Awards"));
const LabPageLazy = lazy(() => import("./pages/Lab"));
const StyleGuide = lazy(() => import("./pages/StyleGuide"));
const ContactPageLazy = lazy(() => import("./pages/Contact"));
const TalentPreviewPageLazy = lazy(() => import("./pages/TalentPreview"));
const PrivacyTermsPage = lazy(() => import("./pages/PrivacyTerms"));
const VideoPageLazy = lazy(() => import("./pages/Video"));
const AboutMePageLazy = lazy(() => import("./pages/AboutMe"));
const HireMePageLazy = lazy(() => import("./pages/HireMe"));
const FoundingSdrPageLazy = lazy(() => import("./pages/FoundingSdr"));

function Page() {
  const pathname = (window.location.pathname.replace(/^\/en(?=\/|$)/, "") || "/").replace(/\/$/, "") || "/";

  if (isSitesFrontendOnly && pathname === "/adm") return <VideoPageLazy />;
  if (pathname === "/for-recrutiers" || pathname === "/human-resources") return <HumanResourcesPage />;
  if (pathname === "/founding-sdr") return <FoundingSdrPageLazy />;
  if (pathname === "/") return <VideoPageLazy />;
  if (pathname === "/services") return <ServicesPageLazy />;
  if (pathname === "/research") return <ResearchPageLazy />;
  if (pathname === "/contatenated-prompt-techique") return <ConcatenatedPromptTechniquePageLazy />;
  if (pathname === "/ux-prompt-design") return <UxPromptDesignPageLazy />;
  if (pathname === "/prompt-app") return <PromptAppPageLazy />;
  if (pathname === "/awards-prompt-engineering") return <AwardsPageLazy />;
  if (pathname === "/lab") return <LabPageLazy />;
  if (pathname === "/style") return <StyleGuide />;
  if (pathname === "/talent-preview") return <TalentPreviewPageLazy />;
  if (pathname === "/about-me") return <AboutMePageLazy />;
  if (pathname === "/hire-me") return <HireMePageLazy />;
  if (pathname === "/contact") return <ContactPageLazy />;
  if (pathname === "/video") return <Home />;
  if (pathname === "/adm") return <AdminPage />;
  if (pathname === "/privacy" || pathname === "/terms") return <PrivacyTermsPage />;
  return <VideoPageLazy />;
}

export default function App() {
  const { t } = useTranslation();
  const pathname = (window.location.pathname.replace(/^\/en(?=\/|$)/, "") || "/").replace(/\/$/, "") || "/";
  const showChat = !isSitesFrontendOnly && pathname !== "/adm";

  useEffect(() => {
    if (!isSitesFrontendOnly) return;

    const handleAssistantLaunch = () => {
      openAssistantFallback({
        subject: t("sitesFallback.subject"),
        lines: [
          t("sitesFallback.greeting"),
          "",
          t("sitesFallback.intro"),
          "",
          t("sitesFallback.context"),
          "-",
          "",
          t("sitesFallback.signoff"),
        ],
      });
    };

    window.addEventListener("criativai:open-chat", handleAssistantLaunch);
    return () => window.removeEventListener("criativai:open-chat", handleAssistantLaunch);
  }, [t]);

  return (
    <Suspense fallback={null}>
      <Page />
      {showChat ? <ChatWidget /> : null}
      {isSitesFrontendOnly ? null : <TargetMode />}
    </Suspense>
  );
}
