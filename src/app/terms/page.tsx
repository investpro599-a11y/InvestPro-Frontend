"use client";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Terms of Service</h1>
        <p className="mb-4 text-gray-700">Welcome to InvestPro. By using our website and services, you agree to the following terms and conditions. Please read them carefully.</p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li><strong>Eligibility:</strong> You must be at least 18 years old to use our services.</li>
          <li><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account and password.</li>
          <li><strong>Investment Risks:</strong> All investments carry risk. InvestPro is not liable for any losses incurred.</li>
          <li><strong>Prohibited Activities:</strong> You agree not to use our platform for any unlawful or fraudulent activities.</li>
          <li><strong>Termination:</strong> We reserve the right to terminate accounts that violate our terms.</li>
          <li><strong>Changes to Terms:</strong> We may update these terms at any time. Continued use of the service constitutes acceptance of the new terms.</li>
        </ol>
        <p className="mt-6 text-gray-600">If you have any questions about these Terms, please contact us at <a href="mailto:support@investpro.com" className="text-primary underline">support@investpro.com</a>.</p>
      </div>
    </div>
  );
} 