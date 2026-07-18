const fs = require('fs');

let code = fs.readFileSync('src/components/auth/login-form.tsx', 'utf8');

const otpJsx = `
  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">Verify Your Email</h2>
          <p className="text-sm text-gray-600 mt-2">
            Your account is not verified. Please enter the OTP sent to {pendingEmail}.
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
          
          {loginError && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200">
              {loginError}
            </div>
          )}
          
          <Button 
            className="w-full" 
            onClick={async () => {
              if (otpValue.length < 6) {
                setLoginError("Please enter the full 6-digit code.");
                return;
              }
              setIsVerifying(true);
              setLoginError('');
              try {
                await verifyEmail({ email: pendingEmail, otp: otpValue });
                window.location.reload();
              } catch (err: any) {
                setLoginError(err.message || "Failed to verify code");
              } finally {
                setIsVerifying(false);
              }
            }}
            disabled={isVerifying || otpValue.length < 6}
          >
            {isVerifying ? "Verifying..." : "Verify Code"}
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={() => {
              setStep('form');
              setLoginError('');
            }}
            disabled={isVerifying}
          >
            Back to Login
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

// Update onSubmit to catch requiresVerification
const onSubmitReplacement = `
  const onSubmit = async (data: LoginData) => {
    setLoginError('');
    try {
      await login(data);
    } catch (error: any) {
      if (error.requiresVerification) {
        setPendingEmail(error.email || data.emailOrUsername);
        setStep('otp');
      } else {
        setLoginError(error.message || "Login failed");
      }
    }
  };
`;

const onSubmitRegex = /const onSubmit = async \(data: LoginData\) => \{[\s\S]*?catch \(error: any\) \{[\s\S]*?setLoginError\(error\.message \|\| "Login failed"\);\s*\}\s*\};/;
code = code.replace(onSubmitRegex, onSubmitReplacement.trim());

fs.writeFileSync('src/components/auth/login-form.tsx', code);
console.log('Done fixing login form');
