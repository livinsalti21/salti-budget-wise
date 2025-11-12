import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { format } from 'date-fns';

interface ErrorLogEntry {
  id: string;
  event_type: string;
  severity: string;
  event_details: any;
  created_at: string;
  user_id: string | null;
  ip_address: string | null;
}

interface ErrorLogViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ITEMS_PER_PAGE = 20;

export function ErrorLogViewerModal({ open, onOpenChange }: ErrorLogViewerModalProps) {
  const [logs, setLogs] = useState<ErrorLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ErrorLogEntry | null>(null);
  
  // Filters
  const [functionFilter, setFunctionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open, currentPage, functionFilter, severityFilter, searchQuery]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('security_audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply severity filter
      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      // Apply function name filter (from event_details JSONB)
      if (functionFilter) {
        query = query.ilike('event_details->>function_name', `%${functionFilter}%`);
      }

      // Apply search query across multiple fields
      if (searchQuery) {
        query = query.or(`event_type.ilike.%${searchQuery}%,event_details::text.ilike.%${searchQuery}%`);
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Map data to ensure proper types
      const mappedLogs: ErrorLogEntry[] = (data || []).map(log => ({
        id: log.id,
        event_type: log.event_type,
        severity: log.severity,
        event_details: log.event_details,
        created_at: log.created_at,
        user_id: log.user_id,
        ip_address: log.ip_address as string | null,
      }));

      setLogs(mappedLogs);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const resetFilters = () => {
    setFunctionFilter('');
    setSeverityFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Log Viewer
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="function">Function Name</Label>
              <Input
                id="function"
                placeholder="Filter by function..."
                value={functionFilter}
                onChange={(e) => {
                  setFunctionFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={severityFilter}
                onValueChange={(value) => {
                  setSeverityFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-hidden flex gap-4">
            {/* Log List */}
            <div className="w-1/2 flex flex-col">
              <div className="text-sm text-muted-foreground mb-2">
                Showing {logs.length} of {totalCount} entries
              </div>
              <ScrollArea className="flex-1 border rounded-lg">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading logs...
                  </div>
                ) : logs.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No logs found matching your filters
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {logs.map((log) => (
                      <button
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedLog?.id === log.id
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                          </span>
                        </div>
                        <div className="text-sm font-medium mb-1">{log.event_type}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {log.event_details?.function_name || 'Unknown function'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Log Details */}
            <div className="w-1/2 flex flex-col">
              {selectedLog ? (
                <>
                  <div className="text-sm font-medium mb-2">Log Details</div>
                  <ScrollArea className="flex-1 border rounded-lg">
                    <div className="p-4 space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Event Type</Label>
                        <div className="text-sm font-mono mt-1">{selectedLog.event_type}</div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-xs text-muted-foreground">Severity</Label>
                        <div className="mt-1">
                          <Badge variant={getSeverityColor(selectedLog.severity)}>
                            {selectedLog.severity}
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-xs text-muted-foreground">Timestamp</Label>
                        <div className="text-sm font-mono mt-1">
                          {format(new Date(selectedLog.created_at), 'PPpp')}
                        </div>
                      </div>

                      <Separator />

                      {selectedLog.user_id && (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground">User ID</Label>
                            <div className="text-sm font-mono mt-1">{selectedLog.user_id}</div>
                          </div>
                          <Separator />
                        </>
                      )}

                      {selectedLog.ip_address && (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground">IP Address</Label>
                            <div className="text-sm font-mono mt-1">{String(selectedLog.ip_address)}</div>
                          </div>
                          <Separator />
                        </>
                      )}

                      <div>
                        <Label className="text-xs text-muted-foreground">Event Details</Label>
                        <pre className="mt-2 p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto">
                          {JSON.stringify(selectedLog.event_details, null, 2)}
                        </pre>
                      </div>

                      {selectedLog.event_details?.error_stack && (
                        <>
                          <Separator />
                          <div>
                            <Label className="text-xs text-muted-foreground">Stack Trace</Label>
                            <pre className="mt-2 p-3 bg-destructive/10 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                              {selectedLog.event_details.error_stack}
                            </pre>
                          </div>
                        </>
                      )}

                      {selectedLog.event_details?.request && (
                        <>
                          <Separator />
                          <div>
                            <Label className="text-xs text-muted-foreground">Request Context</Label>
                            <pre className="mt-2 p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto">
                              {JSON.stringify(selectedLog.event_details.request, null, 2)}
                            </pre>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 border rounded-lg flex items-center justify-center text-muted-foreground">
                  Select a log entry to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
