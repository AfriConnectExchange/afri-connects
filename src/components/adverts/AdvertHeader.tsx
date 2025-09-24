import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, RefreshCw, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface AdvertHeaderProps {
  totalAdverts: number;
  totalSpent: number;
  totalBudget: number;
  onCreateAdvert: () => void;
  onRefresh: () => void;
  onSettings: () => void;
  isRefreshing?: boolean;
}

export function AdvertHeader({ 
  totalAdverts, 
  totalSpent, 
  totalBudget, 
  onCreateAdvert, 
  onRefresh, 
  onSettings,
  isRefreshing = false 
}: AdvertHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-0 flex-1"
          >
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">My Adverts</h1>
              <Badge variant="secondary" className="text-xs">
                {totalAdverts} Total
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              £{totalSpent.toFixed(0)} spent of £{totalBudget.toFixed(0)} budget
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 ml-4 shrink-0"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              onClick={onCreateAdvert}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}