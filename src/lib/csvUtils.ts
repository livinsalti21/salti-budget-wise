import { supabase } from '@/integrations/supabase/client';
import type { BudgetInput } from './budgetUtils';

export interface CSVUploadResult {
  success: boolean;
  budgetInput?: BudgetInput;
  budgetId?: string;
  message?: string;
  error?: string;
}

export async function processCSVUpload(
  userId: string, 
  csvContent: string, 
  fileName: string
): Promise<CSVUploadResult> {
  try {
    // First, store the raw upload
    const { data: upload, error: uploadError } = await supabase
      .from('budget_uploads')
      .insert({
        user_id: userId,
        filename: fileName,
        file_data: {
          raw_content: csvContent,
          upload_size: csvContent.length,
          rows_count: csvContent.split('\n').length - 1
        }
      })
      .select()
      .single();

    if (uploadError) throw uploadError;

    // Process via edge function
    const { data, error } = await supabase.functions.invoke('budget-operations', {
      body: {
        action: 'process_csv_upload',
        userId,
        uploadId: upload.id,
        csvContent
      }
    });

    if (error) throw error;

    return {
      success: data.success,
      budgetInput: data.budget_input,
      budgetId: data.budget_id,
      message: data.message,
      error: data.error
    };
  } catch (error) {
    console.error('Error processing CSV upload:', error);
    return {
      success: false,
      error: error.message || 'Failed to process CSV upload'
    };
  }
}

export function validateCSVContent(content: string): { valid: boolean; error?: string } {
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    return { valid: false, error: 'CSV must contain headers and at least one data row' };
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Check for basic required columns
  const hasCategory = headers.some(h => h.includes('category') || h.includes('item') || h.includes('name'));
  const hasAmount = headers.some(h => h.includes('amount') || h.includes('value') || h.includes('cost'));
  
  if (!hasCategory && !hasAmount) {
    return { 
      valid: false, 
      error: 'CSV should contain category/name and amount columns' 
    };
  }

  return { valid: true };
}

export function generateBudgetTemplate(): string {
  return `Category,Type,Amount,Frequency,Description
Salary,Income,4000,Monthly,Primary job salary
Side Hustle,Income,800,Monthly,Freelance work
Rent,Fixed Expense,1200,Monthly,Monthly apartment rent
Car Payment,Fixed Expense,350,Monthly,Auto loan payment
Insurance,Fixed Expense,200,Monthly,Auto and health insurance
Phone,Fixed Expense,80,Monthly,Cell phone bill
Utilities,Fixed Expense,150,Monthly,Electric gas water
Internet,Fixed Expense,60,Monthly,Internet service
Emergency Fund,Goal,10000,2024-12-31,6 months expenses
Vacation,Goal,3000,2024-08-01,Summer vacation fund
Laptop,Goal,1500,2024-06-01,New work laptop`;
}