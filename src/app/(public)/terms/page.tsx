import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Postinet",
  description: "Terms of Service for Postinet - Automated social publishing for creators and businesses.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Agreement to Terms</h2>
            <p className="leading-relaxed">
              By accessing or using Postinet ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p className="mt-4 leading-relaxed">
              These Terms apply to all visitors, users, and others who access or use the Service. 
              We reserve the right to update, change, or replace any part of these Terms at our sole discretion. 
              It is your responsibility to check this page periodically for changes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">User Responsibilities</h2>
            <p className="mb-4 leading-relaxed">As a user of Postinet, you agree to:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your account information to keep it accurate</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Respect the intellectual property rights of others</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Acceptable Use</h2>
            <p className="mb-4 leading-relaxed">You agree not to use the Service to:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Violate any applicable local, state, national, or international law</li>
              <li>Transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
              <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with any person or entity</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
              <li>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks</li>
              <li>Use automated scripts, bots, or other automated means to access the Service without permission</li>
              <li>Publish spam, malicious content, or content that violates platform-specific terms of service</li>
              <li>Engage in any activity that could harm, disable, or impair the Service</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              Violation of these terms may result in immediate termination of your account and legal action where appropriate.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Account Security</h2>
            <p className="leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials, including your password. 
              You agree to accept responsibility for all activities that occur under your account.
            </p>
            <p className="mt-4 leading-relaxed">
              You must immediately notify us of any unauthorized use of your account or any other breach of security. 
              We will not be liable for any loss or damage arising from your failure to comply with this security obligation.
            </p>
            <p className="mt-4 leading-relaxed">
              When connecting third-party social media accounts, you are responsible for managing access tokens and revoking 
              access when necessary. We store these tokens securely but cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Intellectual Property</h2>
            <p className="mb-4 leading-relaxed">
              The Service and its original content, features, and functionality are owned by Postinet and are protected by 
              international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="mb-4 leading-relaxed">
              You retain ownership of all content you create, upload, or publish through the Service ("User Content"). 
              By using the Service, you grant Postinet a worldwide, non-exclusive, royalty-free license to use, reproduce, 
              modify, and distribute your User Content solely for the purpose of providing and improving the Service.
            </p>
            <p className="leading-relaxed">
              You represent and warrant that you own or have the necessary rights to all User Content and that your User 
              Content does not infringe upon the rights of any third party.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Payment & Subscription Terms</h2>
            <p className="mb-4 leading-relaxed">
              If you purchase a subscription or paid plan, you agree to pay all fees associated with your selected plan. 
              Fees are billed in advance on a recurring basis (monthly or annually) unless otherwise stated.
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>All fees are non-refundable except as required by law or as explicitly stated in our refund policy</li>
              <li>We reserve the right to change our pricing with 30 days notice</li>
              <li>If payment fails, we may suspend or terminate your account</li>
              <li>You may cancel your subscription at any time, but you will remain responsible for charges incurred prior to cancellation</li>
              <li>Refunds, if applicable, will be processed according to our refund policy</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              Free plans may have limitations on features, usage, or support. We reserve the right to modify or discontinue 
              free plans at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Service Availability</h2>
            <p className="leading-relaxed">
              We strive to provide reliable and continuous access to the Service. However, we do not guarantee that the Service 
              will be available at all times or that it will be free from errors, interruptions, or downtime.
            </p>
            <p className="mt-4 leading-relaxed">
              We reserve the right to:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Modify, suspend, or discontinue any part of the Service at any time</li>
              <li>Perform scheduled maintenance that may temporarily interrupt service</li>
              <li>Update or change features, functionality, or pricing</li>
              <li>Terminate accounts that violate these Terms</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              We will make reasonable efforts to notify users of significant changes or planned maintenance, but are not 
              obligated to do so.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Limitation of Liability</h2>
            <p className="mb-4 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, POSTINET SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, 
              OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="mb-4 leading-relaxed">
              Our total liability for any claims arising from or related to the Service shall not exceed the amount you paid 
              us in the twelve (12) months preceding the claim, or $100, whichever is greater.
            </p>
            <p className="leading-relaxed">
              We are not responsible for:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Content published to third-party platforms through our Service</li>
              <li>Actions taken by third-party platforms (Facebook, YouTube, etc.)</li>
              <li>Loss of data due to user error or account deletion</li>
              <li>Service interruptions beyond our reasonable control</li>
              <li>Unauthorized access to your account due to your failure to maintain security</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Governing Law</h2>
            <p className="leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Postinet 
              operates, without regard to its conflict of law provisions.
            </p>
            <p className="mt-4 leading-relaxed">
              Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration 
              or in the courts of the applicable jurisdiction, as determined by applicable law.
            </p>
            <p className="mt-4 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or 
              eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
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





