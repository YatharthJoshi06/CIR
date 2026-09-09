import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/component/ui/toaster";
import { TooltipProvider } from "@/component/ui/tooltip";
// import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
// import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Cases from "@/pages/cases";
import CasesNew from "@/pages/cases-new";
import CaseDetail from "@/pages/case-detail";
import Alerts from "@/pages/alerts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      {/* <Route path="/login" component={Login} /> */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/cases/new" component={CasesNew} />
      <Route path="/cases/:id" component={CaseDetail} />
      <Route path="/cases" component={Cases} />
      <Route path="/alerts" component={Alerts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          {/* <AuthProvider> */}
            <Router />
          {/* </AuthProvider> */}
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;