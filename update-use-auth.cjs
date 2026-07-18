const fs = require('fs');
let content = fs.readFileSync('src/hooks/use-auth.tsx', 'utf8');

const interfaceFind = 'interface AuthContextType {';
const interfaceReplace = `interface AuthContextType {
  verifyEmail: (data: { email: string; otp: string }) => Promise<void>;`;
content = content.replace(interfaceFind, interfaceReplace);

const signupMutationFind = 'const signupMutation = useMutation({';
const verifyMutationStr = `
  const verifyMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      return await authApi.verifyEmail(data);
    },
    onSuccess: (data) => {
      if (data?.user) {
        queryClient.setQueryData(["/auth/me"], data.user);
        toast({ title: "Verification successful" });
        if (data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "Invalid or expired OTP",
      });
    },
  });

  const signupMutation = useMutation({`;
content = content.replace(signupMutationFind, verifyMutationStr);

const returnFind = 'return (\n    <AuthContext.Provider\n      value={{';
const returnReplace = `return (
    <AuthContext.Provider
      value={{
        verifyEmail: verifyMutation.mutateAsync,`;
content = content.replace(returnFind, returnReplace);

fs.writeFileSync('src/hooks/use-auth.tsx', content);
console.log('done');
