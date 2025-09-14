import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Chrome, 
  Apple, 
  Github, 
  CreditCard, 
  Shield, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Settings 
} from 'lucide-react';

export default function AuthSetupGuide() {
  const authProviders = [
    {
      name: 'Google OAuth',
      icon: Chrome,
      status: 'needs-setup',
      description: 'Sign in with Google account',
      setupUrl: 'https://supabase.com/dashboard/project/vmpnajdvcipfuusnjnfr/auth/providers',
      steps: [
        'Go to Google Cloud Console',
        'Create OAuth 2.0 Client ID',
        'Add authorized origins and redirect URIs',
        'Configure in Supabase Dashboard'
      ]
    },
    {
      name: 'Apple OAuth',
      icon: Apple,
      status: 'needs-setup',
      description: 'Sign in with Apple ID',
      setupUrl: 'https://supabase.com/dashboard/project/vmpnajdvcipfuusnjnfr/auth/providers',
      steps: [
        'Go to Apple Developer Console',
        'Create App ID with Sign In capability',
        'Generate Service ID and private key',
        'Configure in Supabase Dashboard'
      ]
    },
    {
      name: 'GitHub OAuth',
      icon: Github,
      status: 'needs-setup',
      description: 'Sign in with GitHub account',
      setupUrl: 'https://supabase.com/dashboard/project/vmpnajdvcipfuusnjnfr/auth/providers',
      steps: [
        'Go to GitHub Developer Settings',
        'Create OAuth App',
        'Set authorization callback URL',
        'Configure in Supabase Dashboard'
      ]
    },
    {
      name: 'Plaid Account Linking',
      icon: CreditCard,
      status: 'needs-setup',
      description: 'Link bank accounts securely',
      setupUrl: 'https://supabase.com/dashboard/project/vmpnajdvcipfuusnjnfr/settings/functions',
      steps: [
        'Create Plaid developer account',
        'Get Client ID and Secret',
        'Add secrets to Supabase Edge Functions',
        'Configure webhook endpoints'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'configured':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'needs-setup':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured':
        return <CheckCircle className="h-4 w-4" />;
      case 'needs-setup':
        return <AlertCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Authentication Setup Guide</h2>
        <p className="text-muted-foreground">
          Configure OAuth providers and account linking for your Livin Salti app.
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Note:</strong> All OAuth providers and account linking are configured 
          securely through Supabase Dashboard and Edge Functions. No sensitive credentials are 
          stored in your frontend code.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {authProviders.map((provider) => {
          const IconComponent = provider.icon;
          return (
            <Card key={provider.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription>{provider.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(provider.status)}>
                      {getStatusIcon(provider.status)}
                      <span className="ml-1 capitalize">
                        {provider.status.replace('-', ' ')}
                      </span>
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(provider.setupUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-medium mb-2">Setup Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    {provider.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Production URLs Configuration
          </CardTitle>
          <CardDescription>
            Update these URLs in Supabase Dashboard for production deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Site URL:</h4>
            <code className="bg-muted px-2 py-1 rounded text-sm">
              https://app.livinsalti.com
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">Additional Redirect URLs:</h4>
            <div className="space-y-1">
              <code className="bg-muted px-2 py-1 rounded text-sm block">
                https://app.livinsalti.com/auth/callback
              </code>
              <code className="bg-muted px-2 py-1 rounded text-sm block">
                https://livinsalti.com
              </code>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open('https://supabase.com/dashboard/project/vmpnajdvcipfuusnjnfr/auth/url-configuration', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Configure URLs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}