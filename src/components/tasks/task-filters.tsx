'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';

export interface TaskFiltersState {
  search: string;
  status: string;
  priority: string;
  tag: string;
  showClosed: boolean;
}

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
  availableTags: string[];
  showStatusFilter?: boolean;
  showClosedToggle?: boolean;
}

export function TaskFilters({ filters, onChange, availableTags, showStatusFilter = true, showClosedToggle = false }: TaskFiltersProps) {
  const hasActiveFilters = filters.search || filters.status || filters.priority || filters.tag;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks..."
          className="pl-9 h-9"
        />
      </div>

      {/* Status filter */}
      {showStatusFilter && (
        <Select value={filters.status} onValueChange={v => onChange({ ...filters, status: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            {showClosedToggle && <SelectItem value="closed">Closed</SelectItem>}
          </SelectContent>
        </Select>
      )}

      {/* Priority filter */}
      <Select value={filters.priority} onValueChange={v => onChange({ ...filters, priority: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      {/* Tag filter */}
      {availableTags.length > 0 && (
        <Select value={filters.tag} onValueChange={v => onChange({ ...filters, tag: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {availableTags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Show closed toggle for List view */}
      {showClosedToggle && (
        <Button
          variant={filters.showClosed ? 'default' : 'outline'}
          size="sm"
          className="h-9 text-xs"
          onClick={() => onChange({ ...filters, showClosed: !filters.showClosed })}
        >
          <Filter className="h-3.5 w-3.5 mr-1" />
          {filters.showClosed ? 'Hiding Closed' : 'Show Closed'}
        </Button>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs text-muted-foreground"
          onClick={() => onChange({ search: '', status: '', priority: '', tag: '', showClosed: false })}
        >
          <X className="h-3.5 w-3.5 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}