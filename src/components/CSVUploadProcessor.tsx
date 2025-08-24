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
import type { BudgetInput } from '@/lib/budgetUtils';

interface CSVUploadProcessorProps {
  onBudgetExtracted: (data: BudgetInput) => void;
  onBack: () => void;
}

const CSVUploadProcessor = ({ onBudgetExtracted, onBack }: CSVUploadProcessorProps) => {
  const [uploadStep, setUploadStep] = useState<'upload' | 'processing' | 'preview' | 'complete'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<BudgetInput | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    // Simulate processing steps
    const steps = [
      { progress: 20, message: 'Reading file...' },
      { progress: 40, message: 'Parsing data...' },
      { progress: 60, message: 'Identifying columns...' },
      { progress: 80, message: 'Extracting budget information...' },
      { progress: 100, message: 'Processing complete!' }
    ];

    try {
      // Read and parse the file
      const fileContent = await readFileContent(file);
      
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setUploadProgress(step.progress);
        
        if (step.progress === 100) {
          // Process the file content
          const extractedBudget = await processFileContent(fileContent, fileExtension);
          setExtractedData(extractedBudget);
          setUploadStep('preview');
        }
      }
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process the uploaded file. Please check the format and try again.",
        variant: "destructive"
      });
      setUploadStep('upload');
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const processFileContent = async (content: string, fileType: string): Promise<BudgetInput> => {
    // Simple CSV processing (in a real app, you'd use a proper CSV parser)
    const lines = content.split('\n').filter(line => line.trim());
    
    // Mock extraction logic - in reality, this would be much more sophisticated
    // and potentially use AI to intelligently parse different formats
    const mockExtractedData: BudgetInput = {
      incomes: [
        { amount: 2500, cadence: 'monthly', source: 'Salary' }
      ],
      fixed_expenses: [
        { name: 'Rent', amount: 800, cadence: 'monthly' },
        { name: 'Car Payment', amount: 300, cadence: 'monthly' },
        { name: 'Insurance', amount: 150, cadence: 'monthly' }
      ],
      variable_preferences: {
        save_rate: 0.20,
        splits: {
          groceries: 0.4,
          gas: 0.2,
          eating_out: 0.2,
          fun: 0.15,
          misc: 0.05
        }
      },
      goals: [
        { name: 'Emergency Fund', target_amount: 5000, due_date: '2024-12-31' }
      ]
    };

    return mockExtractedData;
  };

  const handleConfirmExtraction = () => {
    if (extractedData) {
      onBudgetExtracted(extractedData);
      setUploadStep('complete');
      
      toast({
        title: "Budget Created! 🎉",
        description: "Your spreadsheet has been successfully processed into a weekly budget"
      });
    }
  };

  const downloadTemplate = () => {
    const template = `Category,Type,Amount,Frequency
Salary,Income,2500,Monthly
Side Hustle,Income,500,Monthly
Rent,Fixed Expense,800,Monthly
Car Payment,Fixed Expense,300,Monthly
Insurance,Fixed Expense,150,Monthly
Phone,Fixed Expense,80,Monthly
Emergency Fund,Goal,5000,2024-12-31
Vacation,Goal,2000,2024-08-01`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Use this template to format your budget data correctly"
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Step */}
      {uploadStep === 'upload' && (
        <>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">Upload Your Budget Spreadsheet</h3>
            <p className="text-muted-foreground">
              Import from Excel, CSV, or Google Sheets files
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                File Upload
              </CardTitle>
              <CardDescription>
                Supported formats: .csv, .xlsx, .xls (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drop your file here or click to browse</p>
                  <p className="text-sm text-muted-foreground">
                    We'll automatically detect columns for income, expenses, and goals
                  </p>
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
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supported File Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>CSV files (.csv)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Excel files (.xlsx, .xls)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Google Sheets exports</span>
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
                {uploadProgress < 40 ? 'Reading file structure...' :
                 uploadProgress < 60 ? 'Identifying income and expenses...' :
                 uploadProgress < 80 ? 'Processing goal information...' :
                 'Finalizing budget data...'}
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
              Data Extracted Successfully
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
                  <h4 className="font-semibold text-success">Income Sources</h4>
                  {extractedData.incomes.map((income, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-success/10 rounded">
                      <span>{income.source || 'Income'}</span>
                      <Badge variant="outline">${income.amount} {income.cadence}</Badge>
                    </div>
                  ))}
                </div>

                {/* Fixed Expenses */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-destructive">Fixed Expenses</h4>
                  {extractedData.fixed_expenses.map((expense, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-destructive/10 rounded">
                      <span>{expense.name}</span>
                      <Badge variant="outline">${expense.amount} {expense.cadence}</Badge>
                    </div>
                  ))}
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Savings Goals</h4>
                  {extractedData.goals.map((goal, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-primary/10 rounded">
                      <span>{goal.name}</span>
                      <Badge variant="outline">${goal.target_amount} by {goal.due_date}</Badge>
                    </div>
                  ))}
                </div>

                {/* Settings */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-muted-foreground">Settings</h4>
                  <div className="p-2 bg-muted/10 rounded">
                    <p className="text-sm">Save Rate: {(extractedData.variable_preferences.save_rate * 100).toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">Default category splits applied</p>
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