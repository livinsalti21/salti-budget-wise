import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileSafeArea } from "@/components/ui/mobile-safe-area";

export default function PrivacyPage() {
  return (
    <MobileSafeArea>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/profile">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">How we protect your information</p>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Livin Salti Privacy Policy</CardTitle>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Effective Date: August 24, 2025</p>
              <p>Last Updated: August 24, 2025</p>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <p>
              Livin Salti ("we," "our," "us") values your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our mobile app and related services.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">1. Information We Collect</h3>
              <div className="space-y-3">
                <p><strong>Personal Information:</strong> Name, email address, account credentials.</p>
                <p><strong>Financial Information:</strong> If you connect bank, exchange, or brokerage accounts (via trusted third-party providers such as Plaid), we access only the data necessary to provide features like balance tracking and savings insights.</p>
                <p><strong>Usage Data:</strong> Interactions with the app, device type, log data, and cookies for analytics.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">2. How We Use Your Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>To provide and improve Livin Salti's services.</li>
                <li>To personalize budgeting and savings recommendations.</li>
                <li>To process subscriptions and payments.</li>
                <li>To communicate with you (notifications, updates, support).</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">3. Sharing of Information</h3>
              <div className="space-y-3">
                <p><strong>Service Providers:</strong> Trusted vendors (e.g., Plaid, Stripe, OpenAI) help us deliver app features.</p>
                <p><strong>Legal Compliance:</strong> We may disclose data if required by law.</p>
                <p><strong>No Sale of Data:</strong> We do not sell your personal or financial information to third parties.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">4. Data Security</h3>
              <p>We use industry-standard encryption and security practices to protect your data. However, no system is 100% secure.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">5. Your Rights</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access, correct, or delete your account information.</li>
                <li>Opt out of marketing communications.</li>
                <li>Request account deletion by contacting: livinsalti21@gmail.com.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">6. Children's Privacy</h3>
              <p>Livin Salti is intended for users 12 years and older. We do not knowingly collect data from children under 12.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">7. Changes to This Policy</h3>
              <p>We may update this Privacy Policy. We will notify users of significant changes via the app or email.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">8. Contact</h3>
              <p>If you have questions, contact us at: <a href="mailto:livinsalti21@gmail.com" className="text-primary hover:underline">livinsalti21@gmail.com</a>.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileSafeArea>
  );
}