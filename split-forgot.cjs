const fs = require('fs');
let code = fs.readFileSync('src/components/auth/forgot-password-form.tsx', 'utf8');

// 1. Add enteredOtp state
if (!code.includes('const [enteredOtp, setEnteredOtp] = useState')) {
  code = code.replace(
    'const [resendCountdown, setResendCountdown] = useState(0);',
    'const [resendCountdown, setResendCountdown] = useState(0);\n  const [enteredOtp, setEnteredOtp] = useState("");'
  );
}

// 2. Add OTP form
const otpFormCode = `
  const otpForm = useForm();
  const handleVerifyOtp = async (data: any) => {
    if (!data.otp || data.otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setEnteredOtp(data.otp);
    setStep('password');
    setError('');
    setSuccess('');
  };`;
if (!code.includes('const otpForm = useForm();')) {
  code = code.replace('const resetForm = useForm();', `const resetForm = useForm();\n${otpFormCode}`);
}

// 3. Update handleResetPassword
code = code.replace(
  'otp: data.otp,',
  'otp: enteredOtp,'
);

// 4. Update the reset step into password step
code = code.replace("if (step === 'reset')", "if (step === 'password')");
code = code.replace("setStep('reset')", "setStep('otp')");
code = code.replace(
  /<FormField[\s\S]*?name="otp"[\s\S]*?render=\{\(\{ field \}\) => \([\s\S]*?<FormItem>[\s\S]*?<FormLabel>OTP Code<\/FormLabel>[\s\S]*?<FormControl>[\s\S]*?<Input type="text" placeholder="6-digit code" maxLength=\{6\} \{\.\.\.field\} \/>[\s\S]*?<\/FormControl>[\s\S]*?<FormMessage \/>[\s\S]*?<\/FormItem>[\s\S]*?\}\)[\s\S]*?\/>/,
  ''
);

// 5. Add the new OTP step JSX
const otpStepJsx = `
  if (step === 'otp') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Enter OTP</CardTitle>
          <p className="text-sm text-gray-600">Enter the OTP sent to {email}.</p>
        </CardHeader>
        <CardContent>
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP Code</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="6-digit code" maxLength={6} autoComplete="one-time-code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">{success}</div>}
              
              <Button type="submit" className="w-full">
                Verify OTP
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={resendLoading || resendCountdown > 0}
                  className="text-sm"
                >
                  {resendCountdown > 0 ? \`Resend OTP in \${resendCountdown}s\` : "Resend OTP"}
                </Button>
              </div>

              <div className="text-center mt-2">
                <Button variant="link" onClick={() => setStep('email')} className="text-sm flex items-center space-x-1 mx-auto">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
`;

if (!code.includes("if (step === 'otp')")) {
  code = code.replace("if (step === 'password')", otpStepJsx + "\n  if (step === 'password')");
}

fs.writeFileSync('src/components/auth/forgot-password-form.tsx', code);
console.log('done splitting forgot password form');
