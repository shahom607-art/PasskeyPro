
"use client";

import { useState, useEffect } from "react";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Plus, Trash2, Globe, User, Eye, EyeOff } from "lucide-react";
import { useChromeStorage } from "@/hooks/use-chrome-storage";

type Credential = {
  id: string;
  website: string;
  username: string;
  password?: string;
};

export default function PopupVault() {
  const [credentials, setCredentials, loading] = useChromeStorage<Credential[]>('user-credentials', []);
  const [newCredential, setNewCredential] = useState<Omit<Credential, "id">>({ website: "", username: "", password: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  const handleAddCredential = () => {
    if (!newCredential.website || !newCredential.username || !newCredential.password) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill out all fields." });
      return;
    }
    const newCreds = [
      ...credentials,
      { ...newCredential, id: new Date().toISOString() },
    ];
    setCredentials(newCreds);
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
    toast({ title: "Copied!", description: "Password copied to clipboard." });
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="max-w-4xl mx-auto border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
        <div>
          <CardTitle>Password Vault</CardTitle>
          <CardDescription>
            Your locally stored credentials.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Credential</DialogTitle>
              <DialogDescription>
                Save a new login to your local vault.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={newCredential.website} onChange={(e) => setNewCredential({...newCredential, website: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={newCredential.username} onChange={(e) => setNewCredential({...newCredential, username: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={newCredential.password} onChange={(e) => setNewCredential({...newCredential, password: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" onClick={handleAddCredential}>Save Credential</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? <p>Loading vault...</p> : credentials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="text-lg font-medium">Your vault is empty.</p>
            <p>Click "Add" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {credentials.map((cred) => (
              <div key={cred.id} className="rounded-lg border p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-semibold truncate">
                  <Globe className="h-5 w-5 text-muted-foreground shrink-0"/> {cred.website}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                  <User className="h-4 w-4 shrink-0"/> {cred.username}
                </div>
                 <div className="flex items-center gap-2 text-sm font-mono">
                  <span className="flex-1 truncate">
                    {revealedPasswords[cred.id] ? cred.password : '••••••••••••'}
                  </span>
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePasswordVisibility(cred.id)} aria-label="Toggle password visibility">
                      {revealedPasswords[cred.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(cred.password)} aria-label="Copy password">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(cred.id)} aria-label="Delete credential">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
