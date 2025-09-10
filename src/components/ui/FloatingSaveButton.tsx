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
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          <div className="flex flex-col items-center group-hover:scale-110 transition-transform duration-200">
            <Plus className="h-5 w-5 text-white drop-shadow-sm" />
            <PiggyBank className="h-3 w-3 text-white/90 -mt-1" />
          </div>
        </Button>
      </Link>
    </div>
  );
}