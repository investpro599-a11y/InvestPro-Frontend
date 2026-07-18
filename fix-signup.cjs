const fs = require('fs');

let code = fs.readFileSync('src/components/auth/signup-form.tsx', 'utf8');

// The JSX to render when step === 'otp'
const otpJsx = `
  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">Verify Your Email</h2>
          <p className="text-sm text-gray-600 mt-2">
            We've sent a 6-digit verification code to {pendingEmail}.
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Verification Code</label>
            <Input 
              type="text" 
              placeholder="Enter 6-digit code" 
              maxLength={6}
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              autoComplete="one-time-code"
            />
          </div>
          
          {signupError && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200">
              {signupError}
            </div>
          )}
          
          <Button 
            className="w-full" 
            onClick={async () => {
              if (otpValue.length < 6) {
                setSignupError("Please enter the full 6-digit code.");
                return;
              }
              setIsSubmitting(true);
              setSignupError('');
              try {
                await verifyEmail({ email: pendingEmail, otp: otpValue });
                toast({
                  title: "Email verified!",
                  description: "Your account is now fully active.",
                });
                window.location.reload();
              } catch (err: any) {
                setSignupError(err.message || "Failed to verify code");
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting || otpValue.length < 6}
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={() => setStep('form')}
            disabled={isSubmitting}
          >
            Back to Signup
          </Button>
        </div>
      </div>
    );
  }

  return (
`;

if (code.includes('return (\n    <Form {...form}>') && !code.includes("if (step === 'otp') {")) {
  code = code.replace('return (\n    <Form {...form}>', otpJsx + '    <Form {...form}>');
}

fs.writeFileSync('src/components/auth/signup-form.tsx', code);
console.log('Done fixing signup form');
