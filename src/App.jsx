import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { navItems } from "./nav-items";
import MainNavigation from "./components/MainNavigation";
import { FavoritesProvider } from "./context/FavoritesContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FavoritesProvider>
        <Toaster />
        <HashRouter>
          <MainNavigation />
          <div className="pt-4">
            <Routes>
              {navItems.map(({ to, page }) => (
                <Route key={to} path={to} element={page} />
              ))}
            </Routes>
          </div>
        </HashRouter>
        <Analytics />
      </FavoritesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
