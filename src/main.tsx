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
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </LotteryDataProvider>
    </ThemeProvider>
  </StrictMode>,
);
