
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw } from "lucide-react";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const { toast } = useToast();

  const generatePassword = () => {
    const lowerCharset = "abcdefghijklmnopqrstuvwxyz";
    const upperCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numberCharset = "0123456789";
    const symbolCharset = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let charset = lowerCharset;
    if (includeUppercase) charset += upperCharset;
    if (includeNumbers) charset += numberCharset;
    if (includeSymbols) charset += symbolCharset;

    if (charset.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one character type.",
      });
      return;
    }

    let newPassword = "";
    if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        for (let i = 0; i < length; i++) {
            newPassword += charset[array[i] % charset.length];
        }
    } else {
        for (let i = 0; i < length; i++) {
            newPassword += charset[Math.floor(Math.random() * charset.length)];
        }
        toast({
            variant: "destructive",
            title: "Insecure Generator",
            description: "Crypto API not available. Using a less secure password generator.",
        });
    }

    setPassword(newPassword);
  };
  
  useEffect(() => {
    generatePassword();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, includeUppercase, includeNumbers, includeSymbols]);

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast({
      title: "Copied!",
      description: "Password has been copied to clipboard.",
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
        <CardDescription>
          Create strong and secure passwords to protect your accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="relative">
            <Input
              type="text"
              readOnly
              value={password}
              placeholder="Your generated password will appear here"
              className="pr-24 text-lg font-mono h-12"
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={copyToClipboard} aria-label="Copy password">
                <Copy className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={generatePassword} aria-label="Generate new password">
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="length">Password Length</Label>
              <span className="text-lg font-semibold">{length}</span>
            </div>
            <Slider
              id="length"
              min={8}
              max={64}
              step={1}
              value={[length]}
              onValueChange={(value) => setLength(value[0])}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="uppercase" checked={includeUppercase} onCheckedChange={(checked) => setIncludeUppercase(Boolean(checked))} />
              <label htmlFor="uppercase" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Uppercase (A-Z)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="numbers" checked={includeNumbers} onCheckedChange={(checked) => setIncludeNumbers(Boolean(checked))} />
              <label htmlFor="numbers" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Numbers (0-9)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="symbols" checked={includeSymbols} onCheckedChange={(checked) => setIncludeSymbols(Boolean(checked))} />
              <label htmlFor="symbols" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Symbols (!@#$)
              </label>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
