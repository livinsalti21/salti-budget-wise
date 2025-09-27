import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SaveHistoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterPeriod: string;
  setFilterPeriod: (period: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filteredCount: number;
  totalCount: number;
  filteredTotal: number;
}

export default function SaveHistoryFilters({
  searchTerm,
  setSearchTerm,
  filterPeriod,
  setFilterPeriod,
  filterCategory,
  setFilterCategory,
  filteredCount,
  totalCount,
  filteredTotal
}: SaveHistoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = searchTerm || filterPeriod !== 'all' || filterCategory !== 'all';

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filters & Search
                {hasActiveFilters && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({filteredCount} of {totalCount} saves)
                  </span>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reason or note..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="coffee">Coffee</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="manual">Manual Save</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Results Summary */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredCount} of {totalCount} saves
                  </span>
                  {filteredCount > 0 && (
                    <span className="text-sm font-medium text-success">
                      ${(filteredTotal / 100).toFixed(2)} total
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}