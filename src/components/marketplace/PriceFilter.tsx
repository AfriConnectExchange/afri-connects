import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PriceRange {
  min: number | null;
  max: number | null;
}

interface PriceFilterProps {
  value: PriceRange;
  onChange: (range: PriceRange) => void;
  onClearFilter: () => void;
  currency?: string;
}

export function PriceFilter({ 
  value, 
  onChange, 
  onClearFilter,
  currency = "£"
}: PriceFilterProps) {
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');
  const [error, setError] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);

  const presetRanges = [
    { id: 'all', label: 'All Prices', min: null, max: null },
    { id: '0-50', label: `Under ${currency}50`, min: 0, max: 50 },
    { id: '50-100', label: `${currency}50 - ${currency}100`, min: 50, max: 100 },
    { id: '100-200', label: `${currency}100 - ${currency}200`, min: 100, max: 200 },
    { id: '200-500', label: `${currency}200 - ${currency}500`, min: 200, max: 500 },
    { id: '500+', label: `Above ${currency}500`, min: 500, max: null },
    { id: 'custom', label: 'Custom Range', min: null, max: null }
  ];

  const getCurrentRangeId = () => {
    if (value.min === null && value.max === null) return 'all';
    
    for (const preset of presetRanges) {
      if (preset.min === value.min && preset.max === value.max) {
        return preset.id;
      }
    }
    return 'custom';
  };

  const handlePresetChange = (rangeId: string) => {
    const preset = presetRanges.find(r => r.id === rangeId);
    if (!preset) return;

    if (rangeId === 'custom') {
      setUseCustomRange(true);
      return;
    }

    setUseCustomRange(false);
    setError('');
    onChange({ min: preset.min, max: preset.max });
  };

  const validateAndApplyCustomRange = () => {
    setError('');

    const minValue = customMin === '' ? null : parseFloat(customMin);
    const maxValue = customMax === '' ? null : parseFloat(customMax);

    // US016-AC02 - Invalid Price Range validation
    if (customMin !== '' && (isNaN(minValue!) || minValue! < 0)) {
      setError("Please enter a valid price range.");
      return;
    }

    if (customMax !== '' && (isNaN(maxValue!) || maxValue! < 0)) {
      setError("Please enter a valid price range.");
      return;
    }

    if (minValue !== null && maxValue !== null && minValue > maxValue) {
      setError("Please enter a valid price range.");
      return;
    }

    onChange({ min: minValue, max: maxValue });
  };

  const handleClear = () => {
    setCustomMin('');
    setCustomMax('');
    setError('');
    setUseCustomRange(false);
    onClearFilter();
  };

  const hasActiveFilter = value.min !== null || value.max !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Price Range</Label>
        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Filter
          </Button>
        )}
      </div>

      <Select value={getCurrentRangeId()} onValueChange={handlePresetChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select price range" />
        </SelectTrigger>
        <SelectContent>
          {presetRanges.map(range => (
            <SelectItem key={range.id} value={range.id}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {useCustomRange && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                Min Price ({currency})
              </Label>
              <Input
                id="min-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className={error ? 'border-destructive' : ''}
              />
            </div>
            <div>
              <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                Max Price ({currency})
              </Label>
              <Input
                id="max-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="No limit"
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                className={error ? 'border-destructive' : ''}
              />
            </div>
          </div>
          
          <Button
            size="sm"
            onClick={validateAndApplyCustomRange}
            className="w-full"
            variant="outline"
          >
            Apply Range
          </Button>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      )}

      {hasActiveFilter && !useCustomRange && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground">
            Active: {value.min !== null && `${currency}${value.min}+`}
            {value.min !== null && value.max !== null && ' - '}
            {value.max !== null && value.min !== null && `${currency}${value.max}`}
            {value.max !== null && value.min === null && `Under ${currency}${value.max}`}
          </p>
        </div>
      )}
    </div>
  );
}