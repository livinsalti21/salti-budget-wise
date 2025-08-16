import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, Download, Check, FileText, DollarSign, Users, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Template {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  template_data: any;
  is_active: boolean;
}

interface Purchase {
  id: string;
  template_id: string;
  status: string;
  created_at: string;
}

const TemplateStore = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadTemplates = async () => {
    try {
      const { data } = await supabase
        .from('templates')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (data) {
        setTemplates(data);
      }
    } catch (error) {
      console.log('Templates not available yet');
    }
  };

  const loadPurchases = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (data) {
        setPurchases(data);
      }
    } catch (error) {
      console.log('Purchases not available yet');
    }
  };

  useEffect(() => {
    loadTemplates();
    loadPurchases();
  }, [user]);

  const isPurchased = (templateId: string) => {
    return purchases.some(p => p.template_id === templateId);
  };

  const handlePurchase = async (template: Template) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // For now, simulate a successful purchase
      // In a real app, this would integrate with Stripe
      
      const { error } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          template_id: template.id,
          amount_cents: template.price_cents,
          status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "Template purchased! 🎉",
        description: `${template.name} has been added to your budget templates.`,
      });

      loadPurchases();
      setSelectedTemplate(null);

    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = (template: Template) => {
    // Create a downloadable file with the template data
    const templateContent = {
      name: template.name,
      description: template.description,
      categories: template.template_data?.categories || [],
      created_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(templateContent, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}_template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: "Your budget template has been downloaded successfully.",
    });
  };

  const getTemplateIcon = (name: string) => {
    if (name.toLowerCase().includes('student')) return <Users className="h-6 w-6" />;
    if (name.toLowerCase().includes('family')) return <Home className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  const getTemplateColor = (name: string) => {
    if (name.toLowerCase().includes('student')) return 'text-accent';
    if (name.toLowerCase().includes('family')) return 'text-primary';
    return 'text-warning';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Budget Template Store</h2>
        <p className="text-muted-foreground">
          Choose from professional budget templates or upload your own spreadsheet
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={getTemplateColor(template.name)}>
                  {getTemplateIcon(template.name)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {template.price_cents === 0 ? (
                      <Badge variant="secondary">Free</Badge>
                    ) : (
                      <Badge variant="outline">
                        ${(template.price_cents / 100).toFixed(2)}
                      </Badge>
                    )}
                    {isPurchased(template.id) && (
                      <Badge variant="default">
                        <Check className="h-3 w-3 mr-1" />
                        Owned
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {template.description}
              </CardDescription>

              {/* Template Preview */}
              {template.template_data?.categories && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Includes categories:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.template_data.categories.slice(0, 3).map((cat: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {cat.name}
                      </Badge>
                    ))}
                    {template.template_data.categories.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.template_data.categories.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {isPurchased(template.id) ? (
                  <Button 
                    onClick={() => downloadTemplate(template)}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                ) : (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{template.name}</DialogTitle>
                          <DialogDescription>{template.description}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {template.template_data?.categories && (
                            <div>
                              <h4 className="font-medium mb-2">Budget Categories:</h4>
                              <div className="space-y-2">
                                {template.template_data.categories.map((cat: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-secondary/20 rounded">
                                    <span>{cat.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      ${(cat.limit / 100).toFixed(0)}/month
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      onClick={() => setSelectedTemplate(template)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {template.price_cents === 0 ? 'Get Free' : 'Purchase'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Purchase Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase {selectedTemplate.name}</DialogTitle>
              <DialogDescription>
                Get instant access to this professional budget template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{selectedTemplate.name}</span>
                  <span className="text-lg font-bold">
                    {selectedTemplate.price_cents === 0 
                      ? 'Free' 
                      : `$${(selectedTemplate.price_cents / 100).toFixed(2)}`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handlePurchase(selectedTemplate)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Processing...' : 
                   selectedTemplate.price_cents === 0 ? 'Get Template' : 'Complete Purchase'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTemplate(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Own Template Section */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Have your own spreadsheet?</h3>
          <p className="text-muted-foreground mb-4">
            Upload your existing budget spreadsheet and we'll integrate it into your dashboard
          </p>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Upload Spreadsheet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateStore;