import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth.api";
import { getErrorMessage } from "@/lib/api/client";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authApi.forgotPassword({ email });
      setMessage(res.data.message);
      setStep("otp");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async () => {
    try {
      setLoading(true);
      setError("");
      await authApi.verifyResetOtp({ email, otp });
      setStep("reset");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setError("");
      await authApi.resetPassword({ email, otp, newPassword: password });
      setMessage("Password reset successfully. You can now sign in.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-2">
        <CardContent className="space-y-6 p-6">
          <h1 className="text-center text-2xl font-bold">Reset password</h1>

          {step === "email" && (
            <>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
              </div>
              <Button className="w-full" disabled={loading} onClick={handleEmail}>
                Send OTP
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              {message && <p className="text-sm text-green-600">{message}</p>}
              <div>
                <Label htmlFor="otp">OTP</Label>
                <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} className="mt-1" />
              </div>
              <Button className="w-full" disabled={loading} onClick={handleOtp}>
                Verify OTP
              </Button>
            </>
          )}

          {step === "reset" && (
            <>
              <div>
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
              </div>
              <Button className="w-full" disabled={loading} onClick={handleReset}>
                Reset password
              </Button>
            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && step === "reset" && <p className="text-sm text-green-600">{message}</p>}

          <Link to="/login" className="block text-center text-sm text-primary hover:underline">
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
