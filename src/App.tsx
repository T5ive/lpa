import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ComparePage } from "@/pages/ComparePage";
import { HistoryPage } from "@/pages/HistoryPage";
import { MethodologyPage } from "@/pages/MethodologyPage";
import { OverviewPage } from "@/pages/OverviewPage";

/** เลื่อนกลับขึ้นบนเมื่อเปลี่ยนหน้า */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/method" element={<MethodologyPage />} />
          <Route path="*" element={<OverviewPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
