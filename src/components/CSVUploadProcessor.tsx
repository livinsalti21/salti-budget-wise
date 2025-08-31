import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { processCSVUpload, validateCSVContent, generateBudgetTemplate } from '@/lib/csvUtils';
import type { BudgetInput } from '@/lib/budgetUtils';
import * as XLSX from 'xlsx';

interface CSVUploadProcessorProps {
  onBudgetExtracted: (data: BudgetInput) => void;
  onBack: () => void;
}

const CSVUploadProcessor = ({ onBudgetExtracted, onBack }: CSVUploadProcessorProps) => {
  const [uploadStep, setUploadStep] = useState<'upload' | 'processing' | 'preview' | 'complete'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<BudgetInput | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV, Excel (.xlsx), or Excel (.xls) file",
        variant: "destructive"
      });
      return;
    }

    setFileName(file.name);
    setUploadStep('processing');
    setUploadProgress(0);

    try {
      // Read file content
      const fileContent = await readFileContent(file);
      
      // Validate CSV content
      const validation = validateCSVContent(fileContent);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Simulate processing steps for better UX
      const steps = [
        { progress: 20, message: 'Reading file structure...' },
        { progress: 40, message: 'Detecting columns...' },
        { progress: 60, message: 'Categorizing income and expenses...' },
        { progress: 80, message: 'Processing savings goals...' },
        { progress: 100, message: 'Generating budget...' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setUploadProgress(step.progress);
      }

      // Process via edge function
      const result = await processCSVUpload(user.id, fileContent, file.name);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process CSV');
      }

      setExtractedData(result.budgetInput!);
      setUploadStep('preview');

      toast({
        title: "CSV Processed Successfully! 🎉",
        description: result.message || 'Your budget data has been extracted and saved.'
      });

    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process the uploaded file. Please check the format and try again.",
        variant: "destructive"
      });
      setUploadStep('upload');
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file'));
            return;
          }

          // Check if it's an Excel file
          if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
            // Parse Excel file and convert to CSV
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const csvContent = XLSX.utils.sheet_to_csv(worksheet);
            resolve(csvContent);
          } else {
            // For CSV files, use as text
            resolve(data as string);
          }
        } catch (error) {
          reject(new Error('Failed to parse file: ' + error.message));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      // Use ArrayBuffer for Excel files, text for CSV
      if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleConfirmExtraction = () => {
    if (extractedData) {
      onBudgetExtracted(extractedData);
      setUploadStep('complete');
    }
  };

  const downloadTemplate = () => {
    const template = generateBudgetTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'livin_salti_budget_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded 📋",
      description: "Use this template to format your budget data correctly. Include Type column for automatic categorization."
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const event = { target: { files: [e.dataTransfer.files[0]] } } as any;
      handleFileUpload(event);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Step */}
      {uploadStep === 'upload' && (
        <>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">Upload Your Budget Spreadsheet</h3>
            <p className="text-muted-foreground">
              Smart parsing automatically detects Income, Expenses, and Goals
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Drag & Drop Upload
              </CardTitle>
              <CardDescription>
                Supported formats: .csv, .xlsx, .xls (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/20 hover:border-primary/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileSpreadsheet className={`h-12 w-12 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {dragActive ? 'Drop your file here!' : 'Drop your file here or click to browse'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Smart column detection: Income, Expenses, Goals automatically categorized
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    <Badge variant="outline" className="text-xs">Auto-detect</Badge>
                    <Badge variant="outline" className="text-xs">Smart parsing</Badge>
                    <Badge variant="outline" className="text-xs">Instant preview</Badge>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()} className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-1">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Smart Detection</p>
                    <p className="text-muted-foreground">Automatically identifies income, expenses, and goals from your data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-1">
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Preview & Verify</p>
                    <p className="text-muted-foreground">Review extracted data before creating your budget</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Instant Budget</p>
                    <p className="text-muted-foreground">Create your weekly budget dashboard in seconds</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Processing Step */}
      {uploadStep === 'processing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 animate-pulse" />
              Processing {fileName}
            </CardTitle>
            <CardDescription>
              Analyzing your spreadsheet and extracting budget information...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={uploadProgress} className="w-full" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {uploadProgress < 30 ? 'Reading file structure...' :
                 uploadProgress < 50 ? 'Detecting columns and categories...' :
                 uploadProgress < 70 ? 'Processing income and expenses...' :
                 uploadProgress < 90 ? 'Organizing savings goals...' :
                 'Finalizing your budget...'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Step */}
      {uploadStep === 'preview' && extractedData && (
        <>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-success" />
              Budget Data Extracted Successfully
            </h3>
            <p className="text-muted-foreground">
              Review the information we found in your spreadsheet
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Budget Preview
              </CardTitle>
              <CardDescription>
                Extracted from {fileName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-success flex items-center gap-2">
                    💰 Income Sources ({extractedData.incomes.length})
                  </h4>
                  {extractedData.incomes.map((income, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                      <span className="font-medium">{income.source || 'Income'}</span>
                      <Badge variant="outline" className="bg-success/20">
                        ${income.amount} {income.cadence}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Fixed Expenses */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-destructive flex items-center gap-2">
                    💳 Fixed Expenses ({extractedData.fixed_expenses.length})
                  </h4>
                  {extractedData.fixed_expenses.map((expense, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                      <span className="font-medium">{expense.name}</span>
                      <Badge variant="outline" className="bg-destructive/20">
                        ${expense.amount} {expense.cadence}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Goals */}
                {extractedData.goals && extractedData.goals.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      🎯 Savings Goals ({extractedData.goals.length})
                    </h4>
                    {extractedData.goals.map((goal, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                        <span className="font-medium">{goal.name}</span>
                        <Badge variant="outline" className="bg-primary/20">
                          ${goal.target_amount} by {goal.due_date}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Settings */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-muted-foreground flex items-center gap-2">
                    ⚙️ Budget Settings
                  </h4>
                  <div className="p-3 bg-muted/10 rounded-lg space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Save Rate:</span> {(extractedData.variable_preferences.save_rate * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Default category splits and preferences applied
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={onBack} variant="outline">
                  Back to Upload
                </Button>
                <Button onClick={handleConfirmExtraction} className="flex-1">
                  Create Budget from This Data
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Back Button */}
      {uploadStep === 'upload' && (
        <Button onClick={onBack} variant="outline" className="w-full">
          Back to Method Selection
        </Button>
      )}
    </div>
  );
};

export default CSVUploadProcessor;