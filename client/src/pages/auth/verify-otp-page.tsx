import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth.api";
import { getErrorMessage } from "@/lib/api/client";

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const userId = params.get("userId") || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError("");
      await authApi.verifyOtp({ userId, otp });
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userId) return;
    try {
      setResendLoading(true);
      setError("");
      setMessage("");
      const res = await authApi.resendOtp({ userId });
      setMessage(res.data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-2">
        <CardContent className="space-y-6 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="mt-2 text-sm text-muted">Enter the 6-digit code sent to your email</p>
          </div>
          <div>
            <Label htmlFor="otp">OTP Code</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="mt-1 text-center text-lg tracking-widest"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <Button className="w-full" disabled={loading || otp.length !== 6} onClick={handleVerify}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <Button variant="outline" className="w-full" disabled={resendLoading || !userId} onClick={handleResend}>
            {resendLoading ? "Sending..." : "Resend code"}
          </Button>
          <Link to="/login" className="block text-center text-sm text-primary hover:underline">
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
