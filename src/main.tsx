import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LotteryDataProvider } from "@/features/lottery/hooks/useLotteryData";
import { ThemeProvider } from "@/lib/theme";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <LotteryDataProvider>
        <TooltipProvider>
          {/* BASE_URL ตาม VITE_BASE — บน GitHub Pages คือ /lpa/ เพื่อให้ลิงก์ภายใน (เช่น "/") ชี้ถูก subpath */}
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </LotteryDataProvider>
    </ThemeProvider>
  </StrictMode>,
);
