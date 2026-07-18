const fs = require('fs');
let content = fs.readFileSync('src/components/auth/signup-form.tsx', 'utf8');

const importsToAdd = `import { authApi } from "@/lib/auth";\n`;
content = content.replace('import { useAuth } from "@/hooks/use-auth";', importsToAdd + 'import { useAuth } from "@/hooks/use-auth";');

// Add states
const stateFind = '  const [formErrors, setFormErrors] = useState<string[]>([]);';
const stateReplace = `  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const { verifyEmail } = useAuth();
`;
content = content.replace(stateFind, stateReplace);

// Handle signup success
const submitTryFind = `      console.log('Calling signup API...');
      await signup(signupData);
      
      console.log('Signup successful, showing toast...');
      toast({
        title: "Signup successful!",
        description: "Logging you in...",
      });
      
      console.log('Attempting login...');
      await login({ emailOrUsername: data.email, password: data.password });
      
      console.log('Login successful, redirecting...');
      // The useAuth hook will handle routing based on user role
      // All signups are users, so they go to /dashboard
      window.location.reload();`;

const submitTryReplace = `      console.log('Calling signup API...');
      const res: any = await signup(signupData);
      
      if (res?.requiresVerification || true) { // We can rely on error catch if signup throws requiresVerification
        // But our useAuth signup mutation doesn't return requiresVerification directly if we threw it.
        // Wait, our authApi.signup returns result if requiresVerification.
        // Let's assume the mutation returns it.
      }
      
      // Let's just catch requiresVerification in the catch block if it's thrown, or handle it if returned
      if (res && res.requiresVerification) {
        toast({
          title: "Verification required",
          description: "Please check your email for the verification code.",
        });
        setPendingEmail(data.email);
        setStep('otp');
        setIsSubmitting(false);
        return;
      }

      console.log('Signup successful, showing toast...');
      toast({
        title: "Signup successful!",
        description: "Logging you in...",
      });
      
      console.log('Attempting login...');
      await login({ emailOrUsername: data.email, password: data.password });
      
      console.log('Login successful, redirecting...');
      window.location.reload();`;
content = content.replace(submitTryFind, submitTryReplace);

// Handle requiresVerification in catch block
const catchFind = `      if (error.message === 'Email already exists') {`;
const catchReplace = `      if (error.requiresVerification) {
        toast({
          title: "Verification required",
          description: "Please check your email for the verification code.",
        });
        setPendingEmail(data.email);
        setStep('otp');
        handled = true;
      } else if (error.message === 'Email already exists') {`;
content = content.replace(catchFind, catchReplace);

// OTP Submission
const otpSubmitStr = `
  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue || otpValue.length < 6) return;
    setIsSubmitting(true);
    setSignupError('');
    try {
      await verifyEmail({ email: pendingEmail, otp: otpValue });
      // verifyEmail handles redirect
    } catch (error: any) {
      setSignupError(error.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    try {
      await authApi.resendOtp(pendingEmail);
      toast({ title: "Code sent", description: "A new verification code has been sent to your email." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to resend", description: error.message });
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
        
        {signupError && (
          <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md mb-4 text-center">
            {signupError}
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify Email'}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onResend}>
            Resend Code
          </Button>
        </form>
      </div>
    );
  }
`;

content = content.replace('  return (\n    <Form {...form}>', otpSubmitStr + '\n  return (\n    <Form {...form}>');

fs.writeFileSync('src/components/auth/signup-form.tsx', content);
console.log('done');
