const fs = require('fs');
let content = fs.readFileSync('src/components/auth/forgot-password-form.tsx', 'utf8');

// Replace the handleRequestReset method body
const reqResetFind = `  const handleRequestReset = async (data: any) => {
    setError('');
    setSuccess('');
    try {
      const result = await authApi.requestPasswordReset(data);
      setUserId(result.userId ?? null);
      setEmail(data.email);
      if (result.userId) {
        const questions = await authApi.getSecurityQuestions(result.userId);
        setSecurityQuestions(questions);
      }
      setStep('security');
      setResendCountdown(60); // Start 60 second countdown
      setSuccess('Password reset OTP sent to your email.');
    } catch (error: any) {
      setError(error.message || "Failed to send reset OTP");
    }
  };`;

const reqResetReplace = `  const handleRequestReset = async (data: any) => {
    setError('');
    setSuccess('');
    try {
      await authApi.forgotPassword(data.email);
      setEmail(data.email);
      setStep('reset');
      setResendCountdown(60); // Start 60 second countdown
      setSuccess('Password reset OTP sent to your email.');
    } catch (error: any) {
      setError(error.message || "Failed to send reset OTP");
    }
  };`;
content = content.replace(reqResetFind, reqResetReplace);

// Replace handleResetPassword
const resetFind = `  const handleResetPassword = async (data: any) => {
    setError('');
    setSuccess('');
    try {
      await authApi.resetPassword({
        ...data,
        userId: userId!,
      });
      setStep('success');
      setSuccess('Password reset successfully! You can now login with your new password.');
    } catch (error: any) {
      setError(error.message || "Failed to reset password");
    }
  };`;

const resetReplace = `  const handleResetPassword = async (data: any) => {
    setError('');
    setSuccess('');
    try {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      await authApi.resetPassword({
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      setStep('success');
      setSuccess('Password reset successfully! You can now login with your new password.');
    } catch (error: any) {
      setError(error.message || "Failed to reset password");
    }
  };`;
content = content.replace(resetFind, resetReplace);

// Replace email submit form handling
const emailSubmitFind = `            <form onSubmit={emailForm.handleSubmit(async (data: any) => {
              setError('');
              setSuccess('');
              try {
                // Find user by email, get userId (API to be implemented)
                const userId = await authApi.getUserIdByEmail(data.email);
                setUserId(userId);
                const questions = await authApi.getSecurityQuestions(userId);
                setSecurityQuestions(questions);
              } catch (error: any) {
                setError(error.message || 'Failed to find user or questions');
              }
            })} className="space-y-4">`;

const emailSubmitReplace = `            <form onSubmit={emailForm.handleSubmit(handleRequestReset)} className="space-y-4">`;
content = content.replace(emailSubmitFind, emailSubmitReplace);

// Replace the whole reset step UI to include OTP field
const oldResetUI = `  if (step === 'reset') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(async (data: any) => {
              setError('');
              setSuccess('');
              try {
                await authApi.resetPassword({ ...data, userId });
                setStep('success');
                setSuccess('Password reset successfully! You can now login with your new password.');
              } catch (error: any) {
                setError(error.message || 'Failed to reset password');
              }
            })} className="space-y-4">
              <FormField
                control={resetForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">{success}</div>}
              <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
                {resetForm.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }`;

const newResetUI = `  if (step === 'reset') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <p className="text-sm text-gray-600">Enter the OTP sent to {email} and your new password.</p>
        </CardHeader>
        <CardContent>
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <FormField
                control={resetForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP Code</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="6-digit code" maxLength={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">{success}</div>}
              <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
                {resetForm.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }`;
content = content.replace(oldResetUI, newResetUI);

fs.writeFileSync('src/components/auth/forgot-password-form.tsx', content);
console.log('done');
