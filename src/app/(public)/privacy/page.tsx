import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Postinet",
  description: "Privacy Policy for Postinet - Automated social publishing for creators and businesses.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Introduction</h2>
            <p className="leading-relaxed">
              Welcome to Postinet. We are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, store, and protect your data when you use our automated social publishing platform.
            </p>
            <p className="mt-4 leading-relaxed">
              By using Postinet, you agree to the collection and use of information in accordance with this policy. 
              If you do not agree with our policies and practices, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Information We Collect</h2>
            <p className="mb-4 leading-relaxed">We collect several types of information to provide and improve our service:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Account Information:</strong> Email address, name, and other information you provide during registration
              </li>
              <li>
                <strong>Social Media Credentials:</strong> OAuth tokens and connection data for platforms you connect (Facebook, YouTube, etc.)
              </li>
              <li>
                <strong>Content Data:</strong> Posts, schedules, templates, and other content you create through our platform
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact with our service, including pages visited and features used
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type, device information, and other technical identifiers
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">How We Use Your Information</h2>
            <p className="mb-4 leading-relaxed">We use the collected information for the following purposes:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>To provide, maintain, and improve our service</li>
              <li>To authenticate your identity and manage your account</li>
              <li>To publish content to your connected social media platforms</li>
              <li>To schedule and manage your social media posts</li>
              <li>To send you service-related notifications and updates</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations and enforce our terms of service</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">How We Store & Protect Your Data</h2>
            <p className="mb-4 leading-relaxed">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Data encryption in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and monitoring</li>
              <li>Limited access to personal data on a need-to-know basis</li>
              <li>Secure cloud infrastructure with reputable providers</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              However, no method of transmission over the Internet or electronic storage is 100% secure. 
              While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Third-Party Services</h2>
            <p className="mb-4 leading-relaxed">
              Postinet integrates with third-party social media platforms and services, including but not limited to:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li><strong>Facebook/Meta:</strong> We use Facebook OAuth to connect your account and publish content</li>
              <li><strong>Google/YouTube:</strong> We use Google OAuth to connect your YouTube channel</li>
              <li><strong>Other Platforms:</strong> Additional platforms may be added in the future</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              When you connect these services, we receive access tokens and basic profile information. 
              We only use this data to provide our publishing services. These third-party services have their own privacy policies 
              governing the collection and use of your information. We encourage you to review their privacy policies.
            </p>
            <p className="mt-4 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Cookies</h2>
            <p className="mb-4 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our service and store certain information. 
              Cookies are files with a small amount of data that may include an anonymous unique identifier.
            </p>
            <p className="mb-4 leading-relaxed">We use cookies for:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Authentication and session management</li>
              <li>Remembering your preferences and settings</li>
              <li>Analyzing usage patterns to improve our service</li>
              <li>Providing personalized features</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
              However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Data Retention</h2>
            <p className="leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
              outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
            <p className="mt-4 leading-relaxed">
              When you delete your account, we will delete or anonymize your personal information, except where we are 
              required to retain it for legal, regulatory, or legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">User Rights</h2>
            <p className="mb-4 leading-relaxed">You have the following rights regarding your personal information:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Objection:</strong> Object to processing of your personal data</li>
              <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              To exercise these rights, please contact us at{" "}
              <a href="mailto:support@yourdomain.com" className="text-blue-600 hover:underline">
                support@yourdomain.com
              </a>
              . We will respond to your request within a reasonable timeframe.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">Postinet Support</p>
              <p className="text-gray-700">
                Email:{" "}
                <a href="mailto:support@yourdomain.com" className="text-blue-600 hover:underline">
                  support@yourdomain.com
                </a>
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}














