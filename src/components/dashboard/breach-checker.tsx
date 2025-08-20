
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { checkPasswordBreach } from "@/ai/flows/check-password-breach";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

type BreachResult = {
  isBreached: boolean;
  message: string;
} | null;

export default function BreachChecker() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BreachResult>(null);

  const handleCheck = async () => {
    if (!password) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await checkPasswordBreach({ password });
      if (response.isBreached) {
        setResult({
          isBreached: true,
          message: "This password has been found in a data breach. It is not safe to use.",
        });
      } else {
        setResult({
          isBreached: false,
          message: "This password was not found in any known data breaches. It appears to be safe.",
        });
      }
    } catch (error) {
      console.error(error);
      setResult({
        isBreached: true,
        message: "An error occurred while checking the password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Password Breach Check</CardTitle>
        <CardDescription>
          Check if your password has been exposed in a data breach using the 'Have I Been Pwned' database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a password to check"
            />
            <Button onClick={handleCheck} disabled={loading || !password}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
            </Button>
          </div>
          {result && (
            <Alert variant={result.isBreached ? "destructive" : "default"} className={!result.isBreached ? "border-green-500/50" : ""}>
              {result.isBreached ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4 text-green-600" />}
              <AlertTitle>{result.isBreached ? "Warning: Password Breached" : "Good News: Password Secure"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
