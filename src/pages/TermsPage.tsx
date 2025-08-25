import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileSafeArea } from "@/components/ui/mobile-safe-area";

export default function TermsPage() {
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
            <h1 className="text-2xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Terms governing your use of Livin Salti</p>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Livin Salti Terms of Service</CardTitle>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Effective Date: August 24, 2025</p>
              <p>Last Updated: August 24, 2025</p>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <p>
              Welcome to Livin Salti! These Terms of Service ("Terms") govern your use of our app, website, and services. By creating an account or using our app, you agree to these Terms.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">1. Eligibility</h3>
              <p>You must be at least 12 years old to use Livin Salti.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">2. Account Responsibilities</h3>
              <div className="space-y-2">
                <p>You are responsible for maintaining the confidentiality of your account.</p>
                <p>You agree not to share login credentials or misuse the app.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">3. Services</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Free users may access basic budgeting and habit-tracking features.</li>
                <li>Pro and Family subscriptions unlock premium features (e.g., linked accounts, AI insights, advanced tracking).</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">4. Payments & Subscriptions</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Subscriptions are billed through Apple In-App Purchases.</li>
                <li>Payments are recurring unless canceled.</li>
                <li>No refunds are offered except where required by law.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">5. User Conduct</h3>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use Livin Salti for unlawful or fraudulent purposes.</li>
                <li>Attempt to hack, reverse engineer, or exploit the app.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">6. Disclaimer</h3>
              <p>Livin Salti provides educational and financial habit-tracking tools only. We are not a licensed financial advisor, broker, or investment service. All financial decisions you make are your responsibility.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">7. Limitation of Liability</h3>
              <p>We are not responsible for losses, damages, or decisions made based on the app's outputs.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">8. Termination</h3>
              <p>We may suspend or terminate accounts that violate these Terms.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">9. Governing Law</h3>
              <p>These Terms are governed by the laws of Illinois, USA.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">10. Contact</h3>
              <p>For support, contact: <a href="mailto:livinsalti21@gmail.com" className="text-primary hover:underline">livinsalti21@gmail.com</a>.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileSafeArea>
  );
}