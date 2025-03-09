import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Calendar from "@/pages/Calendar";
import Budget from "@/pages/Budget";
import Habits from "@/pages/Habits";
import Contacts from "@/pages/Contacts";
import Documents from "@/pages/Documents";
import Journal from "@/pages/Journal";
import Tools from "@/pages/Tools";
import Community from "@/pages/Community";
import Settings from "@/pages/Settings";
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";

function Router() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <PageLayout isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/budget" component={Budget} />
        <Route path="/habits" component={Habits} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/documents" component={Documents} />
        <Route path="/journal" component={Journal} />
        <Route path="/tools" component={Tools} />
        <Route path="/community" component={Community} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </PageLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
