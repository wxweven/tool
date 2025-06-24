import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { navItems } from "./nav-items";
import MainNavigation from "./components/MainNavigation";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";

const queryClient = new QueryClient();

const App = () => (
  <FavoritesProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
      </TooltipProvider>
    </QueryClientProvider>
  </FavoritesProvider>
);

export default App;
