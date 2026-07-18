const fs = require('fs');
let content = fs.readFileSync('src/lib/auth.ts', 'utf8');

// 1. Add new methods
const newMethods = `
  verifyEmail: async (data: { email: string; otp: string }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(\`\${baseUrl}/auth/verify\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Verification failed");
    if (result.sessionId) localStorage.setItem('authToken', result.sessionId);
    return result;
  },

  resendOtp: async (email: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(\`\${baseUrl}/auth/resend-otp\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to resend code");
    return result;
  },

  forgotPassword: async (email: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(\`\${baseUrl}/auth/forgot-password\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to send reset link");
    return result;
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(\`\${baseUrl}/auth/reset-password\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to reset password");
    return result;
  },
`;

content = content.replace('logout: async (): Promise<void> => {', newMethods + '\n  logout: async (): Promise<void> => {');

// 2. Fix login error handling
content = content.replace(
  '    if (!response.ok) {\r\n      throw new Error(result.message || "Login failed");\r\n    }',
  '    if (!response.ok) {\n      const err = new Error(result.message || "Login failed");\n      if (result.requiresVerification) {\n        err.requiresVerification = true;\n        err.email = result.email;\n      }\n      throw err;\n    }'
);
content = content.replace(
  '    if (!response.ok) {\n      throw new Error(result.message || "Login failed");\n    }',
  '    if (!response.ok) {\n      const err = new Error(result.message || "Login failed");\n      if (result.requiresVerification) {\n        err.requiresVerification = true;\n        err.email = result.email;\n      }\n      throw err;\n    }'
);

// 3. Remove old methods
const lines = content.split('\n');
const requestResetStart = lines.findIndex(l => l.includes('requestPasswordReset: async'));
if (requestResetStart !== -1) {
  lines.splice(requestResetStart, lines.length - requestResetStart - 2); // remove till the end
  content = lines.join('\n');
}

fs.writeFileSync('src/lib/auth.ts', content);
console.log('done fixing auth.ts');
