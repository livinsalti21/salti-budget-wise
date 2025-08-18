export interface SaveEvent {
  amount: number;
  date: Date;
  source: 'manual' | 'recurring' | 'reward';
  note?: string;
}

export interface StreakData {
  current: number;
  longest: number;
  lastSaveDate?: Date;
}

export interface SaveEngineState {
  totalSaved: number;
  events: SaveEvent[];
  streak: StreakData;
  recurringAmount?: number;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
}

export class SaveEngine {
  private state: SaveEngineState;

  constructor(initialState?: Partial<SaveEngineState>) {
    this.state = {
      totalSaved: 0,
      events: [],
      streak: { current: 0, longest: 0 },
      ...initialState
    };
  }

  addSave(amount: number, source: SaveEvent['source'] = 'manual', note?: string): SaveEvent {
    const event: SaveEvent = {
      amount,
      date: new Date(),
      source,
      note
    };

    this.state.events.push(event);
    this.state.totalSaved += amount;
    this.updateStreak(event.date);

    return event;
  }

  private updateStreak(saveDate: Date): void {
    const today = new Date();
    const saveDateOnly = new Date(saveDate.getFullYear(), saveDate.getMonth(), saveDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const daysDiff = Math.floor((todayOnly.getTime() - saveDateOnly.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Save is today
      if (!this.state.streak.lastSaveDate || this.getDaysBetween(this.state.streak.lastSaveDate, saveDate) === 1) {
        this.state.streak.current += 1;
      } else if (this.getDaysBetween(this.state.streak.lastSaveDate, saveDate) > 1) {
        // Streak broken, restart
        this.state.streak.current = 1;
      }
      // If same day, don't change streak
    } else {
      // Save is not today, handle past saves
      this.state.streak.current = 1;
    }

    this.state.streak.longest = Math.max(this.state.streak.longest, this.state.streak.current);
    this.state.streak.lastSaveDate = saveDate;
  }

  private getDaysBetween(date1: Date, date2: Date): number {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }

  getState(): SaveEngineState {
    return { ...this.state };
  }

  setRecurring(amount: number, frequency: 'daily' | 'weekly' | 'monthly'): void {
    this.state.recurringAmount = amount;
    this.state.recurringFrequency = frequency;
  }

  simulateRecurringSaves(days: number): SaveEvent[] {
    if (!this.state.recurringAmount || !this.state.recurringFrequency) {
      return [];
    }

    const events: SaveEvent[] = [];
    const amount = this.state.recurringAmount;
    
    let interval: number;
    switch (this.state.recurringFrequency) {
      case 'daily': interval = 1; break;
      case 'weekly': interval = 7; break;
      case 'monthly': interval = 30; break;
    }

    for (let day = interval; day <= days; day += interval) {
      const saveDate = new Date();
      saveDate.setDate(saveDate.getDate() + day);
      
      events.push({
        amount,
        date: saveDate,
        source: 'recurring',
        note: `Recurring ${this.state.recurringFrequency} save`
      });
    }

    return events;
  }

  getProjectedStreak(days: number): number {
    const recurringEvents = this.simulateRecurringSaves(days);
    let projectedStreak = this.state.streak.current;
    
    // Simple projection: if they maintain recurring saves, streak grows
    if (recurringEvents.length > 0) {
      projectedStreak += Math.floor(days / 7); // Conservative estimate
    }
    
    return projectedStreak;
  }
}