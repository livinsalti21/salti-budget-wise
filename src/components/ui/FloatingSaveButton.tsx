import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { track, EVENTS } from '@/analytics/analytics';

export function FloatingSaveButton() {
  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Link 
        to="/app/save/choose"
        onClick={() => track(EVENTS.save_started, { source: 'floating_button' })}
      >
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 animate-pulse hover:animate-none transition-all duration-300 active:scale-95"
        >
          <div className="flex flex-col items-center">
            <Plus className="h-5 w-5 text-white" />
            <PiggyBank className="h-3 w-3 text-white/80 -mt-1" />
          </div>
        </Button>
      </Link>
    </div>
  );
}