import { SEO } from '@/app/components/shared/SEO';
import { Header } from '@/app/pages/landing/components/Header';
import { LandingFooter } from '@/app/pages/landing/components/LandingFooter';
import { colors } from '@/lib/designSystem';

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24" style={{ backgroundColor: colors.background.light }}>
        <SEO
          title="Privacy Policy"
          description="Displini Privacy Policy - How we collect, use, and protect your data."
          url="https://displini.com/privacy"
        />
      
        <div className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: November 4, 2025</p>

          <div className="prose prose-gray max-w-none">
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                At Displini, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                disclose, and safeguard your information when you use our application.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Information We Collect</h2>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Email address (for account creation)</li>
                <li>Name (optional)</li>
                <li>Profile information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-gray-900">Health & Activity Data</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Tasks and to-do items</li>
                <li>Calendar events</li>
                <li>Water intake logs</li>
                <li>Sleep schedule information</li>
                <li>Menstrual cycle data</li>
                <li>Medication reminders</li>
                <li>Journal entries</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To personalize your experience</li>
                <li>To send you reminders and notifications</li>
                <li>To improve our app based on usage patterns</li>
                <li>To communicate with you about updates</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Data Storage & Security</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>End-to-end encryption for sensitive health data</li>
                <li>Secure servers with regular security audits</li>
                <li>Limited employee access to personal data</li>
                <li>Regular backups to prevent data loss</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Rights</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Access:</strong> Request a copy of your data</li>
                <li><strong>Correction:</strong> Update incorrect information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Download your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Third-Party Services</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may use third-party services for:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Analytics (anonymized data only)</li>
                <li>Cloud storage and hosting</li>
                <li>Email delivery</li>
                <li>Payment processing</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We ensure all third parties comply with strict data protection standards.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our service is not intended for children under 13. We do not knowingly collect information 
                from children under 13. If you are a parent and believe your child has provided us with 
                personal information, please contact us.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-4">
                <a href="mailto:privacy@displini.com" className="text-primary hover:underline font-medium">
                  privacy@displini.com
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

