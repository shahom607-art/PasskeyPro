import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import PasswordGenerator from "@/components/dashboard/password-generator";
import BreachChecker from "@/components/dashboard/breach-checker";
import PasswordVault from "@/components/dashboard/password-vault";

export default function DashboardPage() {
  return (
    <Tabs defaultValue="generator" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:w-[600px] mx-auto">
        <TabsTrigger value="generator">
          <KeyRound className="mr-2 h-4 w-4" />
          Generator
        </TabsTrigger>
        <TabsTrigger value="breach-check">
          <ShieldCheck className="mr-2 h-4 w-4" />
          Breach Check
        </TabsTrigger>
        <TabsTrigger value="vault">
          <Lock className="mr-2 h-4 w-4" />
          Vault
        </TabsTrigger>
      </TabsList>
      <TabsContent value="generator">
        <PasswordGenerator />
      </TabsContent>
      <TabsContent value="breach-check">
        <BreachChecker />
      </TabsContent>
      <TabsContent value="vault">
        <PasswordVault />
      </TabsContent>
    </Tabs>
  );
}
