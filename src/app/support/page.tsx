"use client";

export default function Support() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Support</h1>
        <p className="mb-4 text-gray-700">Need help? Our support team is here for you.</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Email us at <a href="mailto:support@investpro.com" className="text-primary underline">support@investpro.com</a></li>
          <li>Call us at <span className="text-primary">+1 (555) 123-4567</span></li>
          <li>Visit our office: 123 Investment St, Finance City, FC 12345</li>
        </ul>
        <p className="mt-6 text-gray-600">We aim to respond to all inquiries within 24 hours.</p>
      </div>
    </div>
  );
} 