"use client";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Privacy Policy</h1>
        <p className="mb-4 text-gray-700">Your privacy is important to us. This policy explains how InvestPro collects, uses, and protects your information.</p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li><strong>Information Collection:</strong> We collect information you provide when registering, investing, or contacting support.</li>
          <li><strong>Use of Information:</strong> Your data is used to provide and improve our services, and will not be sold to third parties.</li>
          <li><strong>Cookies:</strong> We use cookies to enhance your experience. You can disable cookies in your browser settings.</li>
          <li><strong>Data Security:</strong> We implement security measures to protect your data from unauthorized access.</li>
          <li><strong>Third-Party Services:</strong> We may use third-party services for analytics and payment processing, which have their own privacy policies.</li>
          <li><strong>Contact:</strong> For privacy-related questions, email <a href="mailto:support@investpro.com" className="text-primary underline">support@investpro.com</a>.</li>
        </ol>
      </div>
    </div>
  );
} 