
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Plus, Trash2, Globe, User } from "lucide-react";

type Credential = {
  id: string;
  website: string;
  username: string;
  password?: string;
};

export default function PasswordVault() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [newCredential, setNewCredential] = useState<Omit<Credential, "id">>({ website: "", username: "", password: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddCredential = () => {
    if (!newCredential.website || !newCredential.username || !newCredential.password) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill out all fields." });
      return;
    }
    setCredentials([
      ...credentials,
      { ...newCredential, id: new Date().toISOString() },
    ]);
    setNewCredential({ website: "", username: "", password: "" });
    setIsDialogOpen(false);
    toast({ title: "Success", description: "Credential added to your vault." });
  };
  
  const handleDelete = (id: string) => {
    setCredentials(credentials.filter((c) => c.id !== id));
    toast({ title: "Deleted", description: "Credential has been removed." });
  };
  
  const copyToClipboard = (text: string | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Password has been copied to clipboard." });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Password Vault</CardTitle>
          <CardDescription>
            Your locally stored credentials. Data is not saved on any server and will be lost on refresh.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Credential</DialogTitle>
              <DialogDescription>
                Save a new login to your local vault.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="website" className="text-right">Website</Label>
                <Input id="website" value={newCredential.website} onChange={(e) => setNewCredential({...newCredential, website: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Username</Label>
                <Input id="username" value={newCredential.username} onChange={(e) => setNewCredential({...newCredential, username: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Password</Label>
                <Input id="password" type="password" value={newCredential.password} onChange={(e) => setNewCredential({...newCredential, password: e.target.value})} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddCredential}>Save credential</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {credentials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="text-lg font-medium">Your vault is empty.</p>
            <p>Click "Add Credential" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentials.map((cred) => (
              <Card key={cred.id} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg truncate">
                        <Globe className="h-5 w-5 text-muted-foreground shrink-0"/> {cred.website}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2 truncate">
                        <User className="h-4 w-4 text-muted-foreground shrink-0"/> {cred.username}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-end gap-1 mt-auto p-2 border-t">
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(cred.password)} aria-label="Copy password">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(cred.id)} aria-label="Delete credential">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
