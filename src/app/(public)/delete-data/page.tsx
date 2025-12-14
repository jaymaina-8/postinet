import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Data Deletion | Postinet",
  description: "Request deletion of your user data from Postinet - Automated social publishing for creators and businesses.",
};

export default function DeleteDataPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">User Data Deletion</h1>
        
        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Your Rights</h2>
            <p className="leading-relaxed">
              At Postinet, we respect your privacy and your right to control your personal data. You have the right to request 
              deletion of your personal information from our systems at any time.
            </p>
            <p className="mt-4 leading-relaxed">
              This page explains how to request deletion of your data, which is particularly important for users who have 
              connected their Facebook accounts, as Facebook requires apps to provide clear instructions for data deletion.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">What Data Will Be Deleted</h2>
            <p className="mb-4 leading-relaxed">When you request data deletion, we will remove:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Your account information (email, name, profile data)</li>
              <li>All content you created (posts, schedules, templates)</li>
              <li>Social media connection data (OAuth tokens, platform connections)</li>
              <li>Usage and analytics data associated with your account</li>
              <li>Any other personal information stored in your account</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              <strong>Note:</strong> Some data may be retained for legal, regulatory, or legitimate business purposes as required by law, 
              such as transaction records for accounting purposes. However, this retained data will be anonymized where possible.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">How to Request Data Deletion</h2>
            <p className="mb-4 leading-relaxed">
              To request deletion of your data, please follow these steps:
            </p>
            
            <div className="mt-6 space-y-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">Step 1: Email Support</h3>
                <p className="mb-3 leading-relaxed">
                  Send an email to{" "}
                  <a href="mailto:support@yourdomain.com" className="font-semibold text-blue-600 hover:underline">
                    support@yourdomain.com
                  </a>
                  {" "}with the subject line: <strong>"Data Deletion Request"</strong>
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">Step 2: Provide Account Details</h3>
                <p className="mb-3 leading-relaxed">Include the following information in your email:</p>
                <ul className="ml-6 list-disc space-y-1 text-gray-700">
                  <li>Your registered email address</li>
                  <li>Your account username (if applicable)</li>
                  <li>Confirmation that you want to delete your account and all associated data</li>
                  <li>Any connected platforms (Facebook, YouTube, etc.) that should be disconnected</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">Step 3: Verification</h3>
                <p className="leading-relaxed">
                  We will verify your identity to ensure the request is legitimate. This may involve confirming your email 
                  address or asking for additional verification information.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">Step 4: Data Removal</h3>
                <p className="leading-relaxed">
                  Once verified, we will process your deletion request and remove your data from our systems within{" "}
                  <strong>30 days</strong>. You will receive a confirmation email once the deletion is complete.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Alternative: Delete Your Account</h2>
            <p className="leading-relaxed">
              If you prefer, you can delete your account directly from your account settings. Deleting your account will 
              automatically trigger the deletion of all associated personal data, subject to the same retention requirements 
              mentioned above.
            </p>
            <p className="mt-4 leading-relaxed">
              To delete your account:
            </p>
            <ol className="ml-6 list-decimal space-y-2">
              <li>Log in to your Postinet account</li>
              <li>Navigate to Account Settings</li>
              <li>Click on "Delete Account"</li>
              <li>Confirm the deletion</li>
            </ol>
            <p className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-yellow-800">
              <strong>Warning:</strong> Account deletion is permanent and cannot be undone. All your content, schedules, 
              and data will be permanently removed.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Facebook Data Deletion</h2>
            <p className="leading-relaxed">
              If you have connected your Facebook account to Postinet, you can request deletion of your Facebook-related data 
              using the same process outlined above. When you request data deletion, we will:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Revoke and delete all Facebook access tokens</li>
              <li>Remove all Facebook connection data</li>
              <li>Delete any content synced from Facebook</li>
              <li>Remove your Facebook account association from our systems</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              You can also revoke Postinet's access to your Facebook account directly through Facebook's settings:
            </p>
            <ol className="ml-6 list-decimal space-y-2">
              <li>Go to Facebook Settings → Apps and Websites</li>
              <li>Find Postinet in your connected apps</li>
              <li>Click "Remove" to revoke access</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">What Happens After Deletion</h2>
            <p className="leading-relaxed">
              After your data is deleted:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>You will no longer be able to access your account</li>
              <li>All scheduled posts will be cancelled</li>
              <li>Your content will be permanently removed from our systems</li>
              <li>You will need to create a new account if you wish to use Postinet again</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              Please note that content already published to social media platforms (Facebook, YouTube, etc.) will remain on 
              those platforms. We only delete data stored in our systems.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about data deletion or need assistance with your request, please contact us:
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">Postinet Support</p>
              <p className="text-gray-700">
                Email:{" "}
                <a href="mailto:support@yourdomain.com" className="text-blue-600 hover:underline">
                  support@yourdomain.com
                </a>
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Response Time: We typically respond to data deletion requests within 5-7 business days.
              </p>
            </div>
          </section>

          <section className="rounded-lg bg-blue-50 border border-blue-200 p-6">
            <h2 className="mb-3 text-xl font-semibold text-blue-900">Quick Action</h2>
            <p className="mb-4 text-blue-800">
              Ready to request data deletion? Send us an email now:
            </p>
            <a
              href="mailto:support@yourdomain.com?subject=Data%20Deletion%20Request"
              className="inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Request Data Deletion
            </a>
          </section>

          <p className="mt-8 text-sm text-gray-600">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}
















