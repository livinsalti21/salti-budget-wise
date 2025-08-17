import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const BudgetUpload: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return { headers, data };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileText = await file.text();
      const parsedData = parseCSV(fileText);

      // Validate that it looks like a budget file
      const requiredFields = ['category', 'amount'];
      const hasRequiredFields = requiredFields.some(field => 
        parsedData.headers.some(header => 
          header.toLowerCase().includes(field.toLowerCase())
        )
      );

      if (!hasRequiredFields) {
        toast({
          title: "Invalid Budget Format",
          description: "CSV should contain category and amount columns",
          variant: "destructive",
        });
        return;
      }

      // Store in database
      const { error } = await supabase
        .from('budget_uploads')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_data: {
            headers: parsedData.headers,
            data: parsedData.data,
            upload_size: file.size,
            rows_count: parsedData.data.length
          }
        });

      if (error) throw error;

      setUploadedFiles(prev => [...prev, {
        name: file.name,
        size: file.size,
        rows: parsedData.data.length,
        uploaded_at: new Date()
      }]);

      toast({
        title: "Upload Successful",
        description: `Processed ${parsedData.data.length} budget entries. Your dashboard will update automatically.`,
      });

      // Dispatch custom event to refresh dashboard
      window.dispatchEvent(new CustomEvent('template-activity', {
        detail: { type: 'uploaded', filename: file.name }
      }));

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Could not process your budget file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const loadUploadHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budget_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;

      setUploadedFiles(data || []);
    } catch (error) {
      console.error('Error loading upload history:', error);
    }
  };

  React.useEffect(() => {
    if (user) {
      loadUploadHistory();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Budget Upload
          </CardTitle>
          <CardDescription>
            Upload your existing budget spreadsheet (CSV format) to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Budget CSV</h3>
            <p className="text-muted-foreground mb-4">
              Supports CSV files with category and amount columns
            </p>
            
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="budget-upload"
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Processing...' : 'Choose CSV File'}
            </Button>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">CSV Format Example:</h4>
            <div className="bg-muted rounded-lg p-4">
              <code className="text-sm">
                Category,Amount,Description<br/>
                Food,450,Monthly groceries<br/>
                Transportation,200,Gas and parking<br/>
                Entertainment,150,Movies and dining out
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Upload History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{file.filename || file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.file_data?.rows_count || file.rows} entries • {(file.file_data?.upload_size || file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(file.upload_date || file.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};