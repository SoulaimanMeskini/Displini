import { SEO } from '@/app/components/shared/SEO';
import { Header } from '@/app/pages/landing/components/Header';
import { LandingFooter } from '@/app/pages/landing/components/LandingFooter';
import { colors } from '@/lib/designSystem';

export default function TermsOfService() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24" style={{ backgroundColor: colors.background.light }}>
        <SEO
          title="Terms of Service"
          description="Displini Terms of Service - Legal terms and conditions for using our app."
          url="https://displini.com/terms"
        />
      
        <div className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: November 4, 2025</p>

          <div className="prose prose-gray max-w-none">
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Displini ("the App"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these Terms of Service, please do not 
                use the App.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Use License</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Permission is granted to temporarily use Displini for personal, non-commercial purposes. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to reverse engineer any software contained in Displini</li>
                <li>Remove any copyright or proprietary notations</li>
                <li>Transfer the materials to another person</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">3. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                When you create an account with us, you must provide accurate, complete, and current 
                information. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Safeguarding your password</li>
                <li>All activities under your account</li>
                <li>Notifying us of any unauthorized access</li>
                <li>Maintaining the security of your account</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">4. User Data & Content</h2>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Your Data</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You retain all rights to the data you input into Displini. By using our service, you grant 
                us permission to process your data solely to provide and improve the service.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900">Prohibited Content</h3>
              <p className="text-gray-600 leading-relaxed mb-2">You may not use Displini to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Store illegal or harmful content</li>
                <li>Harass or harm others</li>
                <li>Spread malware or viruses</li>
                <li>Violate intellectual property rights</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Subscription & Billing</h2>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Free Plan</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our free plan is available indefinitely but may have usage limitations.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900">Paid Plans</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Subscriptions are billed monthly or annually</li>
                <li>You may cancel anytime from your account settings</li>
                <li>No refunds for partial months</li>
                <li>Prices may change with 30 days notice</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for conduct 
                that we believe violates these Terms or is harmful to other users, us, or third parties, 
                or for any other reason.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Disclaimer</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Health Information:</strong> Displini is a wellness and productivity tool, not a 
                medical device. Information provided by the App should not be considered medical advice. 
                Always consult healthcare professionals for medical decisions.
              </p>
              <p className="text-gray-600 leading-relaxed">
                The App is provided "as is" without warranties of any kind, either express or implied.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                In no event shall Displini or its suppliers be liable for any damages (including, without 
                limitation, damages for loss of data or profit, or due to business interruption) arising 
                out of the use or inability to use Displini.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of material 
                changes via email or in-app notification. Continued use of the App after changes constitutes 
                acceptance of the new terms.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">10. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                For questions about these Terms, please contact us at:
              </p>
              <p className="mt-4">
                <a href="mailto:legal@displini.com" className="text-primary hover:underline font-medium">
                  legal@displini.com
                </a>
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
      <LandingFooter />
    </>
  );
}

