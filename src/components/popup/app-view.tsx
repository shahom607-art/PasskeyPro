
"use client";

import type { User } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KeyRound, ShieldCheck, Lock, LogOut, User as UserIcon } from "lucide-react";

import PasswordGenerator from "@/components/dashboard/password-generator";
import BreachChecker from "@/components/dashboard/breach-checker";
import PopupVault from "@/components/popup/vault";

type SerializableUser = Pick<User, 'displayName' | 'email' | 'photoURL' | 'uid'>;

interface AppViewProps {
  user: SerializableUser;
  onSignOut: () => void;
}

export default function AppView({ user, onSignOut }: AppViewProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex-shrink-0 w-full border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">PassKey Pro</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
                <AvatarFallback>
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">
                  {user.displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-hidden">
        <Tabs defaultValue="vault" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none">
            <TabsTrigger value="generator">
              <KeyRound className="mr-2 h-4 w-4" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="breach-check">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Breach
            </TabsTrigger>
            <TabsTrigger value="vault">
              <Lock className="mr-2 h-4 w-4" />
              Vault
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="generator">
              <PasswordGenerator />
            </TabsContent>
            <TabsContent value="breach-check">
              <BreachChecker />
            </TabsContent>
            <TabsContent value="vault">
              <PopupVault />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
