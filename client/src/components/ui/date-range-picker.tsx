import { useState, useEffect } from 'react';
import { format, isAfter, isBefore, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, startOfYear, endOfYear } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DayPicker, DateRange as DayPickerDateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card } from '@/components/ui/card';

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type DateRangePickerProps = {
  date: DateRange;
  setDate: (date: DateRange) => void;
  className?: string;
};

export function DateRangePicker({ date, setDate, className }: DateRangePickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const today = new Date();
  
  const presets = [
    {
      name: 'This Week',
      handler: () => {
        setDate({
          from: startOfWeek(today, { weekStartsOn: 0 }),
          to: endOfWeek(today, { weekStartsOn: 0 }),
        });
      },
    },
    {
      name: 'Last Week',
      handler: () => {
        const lastWeekStart = startOfWeek(addDays(today, -7), { weekStartsOn: 0 });
        const lastWeekEnd = endOfWeek(addDays(today, -7), { weekStartsOn: 0 });
        setDate({
          from: lastWeekStart,
          to: lastWeekEnd,
        });
      },
    },
    {
      name: 'Last 7 Days',
      handler: () => {
        setDate({
          from: addDays(today, -6),
          to: today,
        });
      },
    },
    {
      name: 'Current Month',
      handler: () => {
        setDate({
          from: startOfMonth(today),
          to: endOfMonth(today),
        });
      },
    },
    {
      name: 'Next Month',
      handler: () => {
        const nextMonth = addMonths(today, 1);
        setDate({
          from: startOfMonth(nextMonth),
          to: endOfMonth(nextMonth),
        });
      },
    },
    {
      name: 'This Year',
      handler: () => {
        setDate({
          from: startOfYear(today),
          to: endOfYear(today),
        });
      },
    },
    {
      name: 'Reset',
      handler: () => {
        setDate({
          from: undefined,
          to: undefined,
        });
      },
    },
  ];

  // Format the display string for the selected date range
  const formatDisplayDate = () => {
    if (date.from && date.to) {
      return `${format(date.from, 'PP')} - ${format(date.to, 'PP')}`;
    }
    if (date.from) {
      return `${format(date.from, 'PP')} - `;
    }
    if (date.to) {
      return ` - ${format(date.to, 'PP')}`;
    }
    return 'Select date range';
  };

  // Close the popover when a complete range is selected
  useEffect(() => {
    if (date.from && date.to) {
      setIsPopoverOpen(false);
    }
  }, [date]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date.from && !date.to && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayDate()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="border-r p-2 space-y-2">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => {
                    preset.handler();
                  }}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
            <Card>
              <DayPicker
                mode="range"
                selected={date}
                onSelect={(range: DayPickerDateRange | undefined) => {
                  if (range) {
                    setDate({
                      from: range.from,
                      to: range.to || range.from
                    });
                  }
                }}
                numberOfMonths={2}
                defaultMonth={date.from}
                className="p-3"
              />
            </Card>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
