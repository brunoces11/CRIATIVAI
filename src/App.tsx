import TargetMode from "./components/target-mode/TargetMode";
import Home from "./pages/Home";
import HumanResourcesPage from "./pages/HumanResources";
import StyleGuide from "./pages/StyleGuide";

function Page() {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";

  if (pathname === "/human-resources") return <HumanResourcesPage />;
  if (pathname === "/style") return <StyleGuide />;
  return <Home />;
}

export default function App() {
  return (
    <>
      <Page />
      <TargetMode />
    </>
  );
}
