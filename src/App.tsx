import TargetMode from "./components/target-mode/TargetMode";
import { ChatWidget } from "./components/ChatWidget";
import AdminPage from "./pages/Admin";
import Home from "./pages/Home";
import HumanResourcesPage from "./pages/HumanResources";
import StyleGuide from "./pages/StyleGuide";

function Page() {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";

  if (pathname === "/human-resources") return <HumanResourcesPage />;
  if (pathname === "/style") return <StyleGuide />;
  if (pathname === "/adm") return <AdminPage />;
  return <Home />;
}

export default function App() {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const showChat = pathname !== "/adm";

  return (
    <>
      <Page />
      {showChat ? <ChatWidget /> : null}
      <TargetMode />
    </>
  );
}
