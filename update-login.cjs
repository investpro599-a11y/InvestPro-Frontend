const fs = require('fs');
let content = fs.readFileSync('src/components/auth/login-form.tsx', 'utf8');

// Add states
const stateFind = `  const [loginError, setLoginError] = useState('');`;
const stateReplace = `  const [loginError, setLoginError] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyEmail } = useAuth();`;
content = content.replace(stateFind, stateReplace);

// Handle error
const tryCatchFind = `  const onSubmit = async (data: LoginData) => {
    setLoginError('');
    try {
      await login(data);
    } catch (error: any) {
      setLoginError(error.message || "Login failed");
    }
  };`;

const tryCatchReplace = `  const onSubmit = async (data: LoginData) => {
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

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue || otpValue.length < 6) return;
    setIsVerifying(true);
    setLoginError('');
    try {
      await verifyEmail({ email: pendingEmail, otp: otpValue });
    } catch (error: any) {
      setLoginError(error.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const onResend = async () => {
    try {
      await authApi.resendOtp(pendingEmail);
      alert("A new verification code has been sent to your email.");
    } catch (error: any) {
      setLoginError(error.message || "Failed to resend code");
    }
  };

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">Verify your email</h3>
          <p className="text-sm text-muted-foreground mt-2">
            We sent a verification code to {pendingEmail}
          </p>
        </div>
        
        {loginError && (
          <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md mb-4 text-center">
            {loginError}
          </div>
        )}

        <form onSubmit={onVerify} className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Verification Code</FormLabel>
            <Input
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onResend}>
            Resend Code
          </Button>
        </form>
      </div>
    );
  }`;
content = content.replace(tryCatchFind, tryCatchReplace);

fs.writeFileSync('src/components/auth/login-form.tsx', content);
console.log('done');
