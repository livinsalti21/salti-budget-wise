import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, Save, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomTemplate {
  id?: string;
  name: string;
  description: string;
  template_data: any;
}

const TemplateCreator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [categories, setCategories] = useState([{ name: '', limit: 0 }]);
  const [isLoading, setIsLoading] = useState(false);
  const [myTemplates, setMyTemplates] = useState<CustomTemplate[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadMyTemplates();
    }
  }, [user]);

  const loadMyTemplates = async () => {
    if (!user) return;

    // Mock user templates for now
    const mockTemplates: CustomTemplate[] = [
      {
        id: '1',
        name: 'My Custom Budget',
        description: 'Personal budget template',
        template_data: {
          categories: [
            { name: 'Food', limit: 50000 },
            { name: 'Transport', limit: 20000 }
          ]
        }
      }
    ];
    
    setMyTemplates(mockTemplates);
  };

  const addCategory = () => {
    setCategories([...categories, { name: '', limit: 0 }]);
  };

  const updateCategory = (index: number, field: 'name' | 'limit', value: string | number) => {
    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setCategories(newCategories);
  };

  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  const handleCreateTemplate = async () => {
    if (!user || !templateName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a template name",
        variant: "destructive"
      });
      return;
    }

    const validCategories = categories.filter(cat => cat.name.trim() && cat.limit > 0);
    if (validCategories.length === 0) {
      toast({
        title: "Missing Categories",
        description: "Please add at least one budget category",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const templateData = {
        categories: validCategories.map(cat => ({
          name: cat.name.trim(),
          limit: Math.round(cat.limit * 100) // Convert to cents
        })),
        created_by: user.id,
        creation_date: new Date().toISOString()
      };

      // TODO: Record template creation when template_purchases table is properly configured
      
      // Simulate adding to templates list
      const newTemplate: CustomTemplate = {
        id: Math.random().toString(),
        name: templateName,
        description: templateDescription,
        template_data: templateData
      };
      
      setMyTemplates(prev => [newTemplate, ...prev]);

      toast({
        title: "Template Created! 🎉",
        description: `"${templateName}" has been created successfully. Your dashboard will update automatically.`,
      });

      // Dispatch custom event to refresh dashboard
      window.dispatchEvent(new CustomEvent('template-activity', {
        detail: { type: 'created', template: templateName }
      }));

      // Reset form
      setTemplateName('');
      setTemplateDescription('');
      setCategories([{ name: '', limit: 0 }]);
      setIsOpen(false);

      // Reload user templates
      loadMyTemplates();

    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportTemplate = (template: CustomTemplate) => {
    const exportData = {
      name: template.name,
      description: template.description,
      categories: template.template_data?.categories || [],
      exported_at: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}_template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Exported",
      description: "Your custom template has been downloaded successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Templates</h3>
          <p className="text-sm text-muted-foreground">Create and manage your custom budget templates</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Budget Template</DialogTitle>
              <DialogDescription>
                Design your own budget template with custom categories and limits
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., My Family Budget"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Brief description"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Budget Categories</Label>
                  <Button size="sm" variant="outline" onClick={addCategory}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Category
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map((category, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Category name"
                        value={category.name}
                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Monthly limit"
                        value={category.limit || ''}
                        onChange={(e) => updateCategory(index, 'limit', parseFloat(e.target.value) || 0)}
                        className="w-32"
                      />
                      {categories.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeCategory(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateTemplate} disabled={isLoading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Creating...' : 'Create Template'}
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Templates Grid */}
      {myTemplates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first custom budget template to get started
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {template.name}
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.template_data?.categories && (
                    <div>
                      <p className="text-sm font-medium mb-2">Categories:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.template_data.categories.slice(0, 3).map((cat: any, index: number) => (
                          <span key={index} className="text-xs bg-secondary px-2 py-1 rounded">
                            {cat.name}
                          </span>
                        ))}
                        {template.template_data.categories.length > 3 && (
                          <span className="text-xs bg-secondary px-2 py-1 rounded">
                            +{template.template_data.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => exportTemplate(template)}
                    className="w-full"
                  >
                    <Upload className="h-3 w-3 mr-2" />
                    Export Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateCreator;