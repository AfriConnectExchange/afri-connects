import { useState, ReactNode } from 'react';
import { HelpCircle, Info, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Badge } from './badge';
import { Separator } from './separator';

interface ContextualTooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

interface HelpIconProps {
  content: string;
  title?: string;
  link?: {
    text: string;
    href: string;
  };
  type?: 'info' | 'help' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface ContextualGuideProps {
  title: string;
  description: string;
  steps?: Array<{
    title: string;
    description: string;
  }>;
  tips?: string[];
  link?: {
    text: string;
    href: string;
  };
  children: ReactNode;
  trigger?: 'hover' | 'click';
}

interface FieldHelpProps {
  label: string;
  description: string;
  example?: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
}

// Simple tooltip for quick help
export function ContextualTooltip({ 
  content, 
  children, 
  side = 'top',
  className = '' 
}: ContextualTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Help icon with popover for detailed explanations
export function HelpIcon({ 
  content, 
  title, 
  link, 
  type = 'help',
  size = 'md',
  className = '' 
}: HelpIconProps) {
  const getIcon = () => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    
    switch (type) {
      case 'info':
        return <Info className={`${iconSize} text-blue-500`} />;
      case 'warning':
        return <AlertCircle className={`${iconSize} text-amber-500`} />;
      case 'success':
        return <CheckCircle className={`${iconSize} text-green-500`} />;
      default:
        return <HelpCircle className={`${iconSize} text-muted-foreground hover:text-primary`} />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-auto p-1 hover:bg-transparent ${className}`}
        >
          {getIcon()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="right">
        <div className="space-y-3">
          {title && (
            <h4 className="font-medium text-sm">{title}</h4>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {content}
          </p>
          {link && (
            <>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => window.open(link.href, '_blank')}
              >
                <ExternalLink className="w-3 h-3" />
                {link.text}
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Comprehensive guide with steps and tips
export function ContextualGuide({ 
  title, 
  description, 
  steps, 
  tips, 
  link, 
  children,
  trigger = 'click' 
}: ContextualGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  const TriggerComponent = trigger === 'hover' ? Tooltip : Popover;
  const TriggerWrapper = trigger === 'hover' ? TooltipTrigger : PopoverTrigger;
  const ContentWrapper = trigger === 'hover' ? TooltipContent : PopoverContent;

  if (trigger === 'hover') {
    return (
      <TooltipProvider>
        <TriggerComponent>
          <TriggerWrapper asChild>
            <span className="cursor-help">
              {children}
            </span>
          </TriggerWrapper>
          <ContentWrapper className="max-w-xs">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{title}</h4>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </ContentWrapper>
        </TriggerComponent>
      </TooltipProvider>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span className="cursor-help">
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-96" side="right">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">{title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {steps && steps.length > 0 && (
            <div>
              <h5 className="font-medium text-sm mb-3">Steps:</h5>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <Badge variant="outline" className="text-xs min-w-fit">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tips && tips.length > 0 && (
            <div>
              <h5 className="font-medium text-sm mb-3">Tips:</h5>
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {link && (
            <>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  window.open(link.href, '_blank');
                  setIsOpen(false);
                }}
              >
                <ExternalLink className="w-3 h-3" />
                {link.text}
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Field-specific help with validation messages
export function FieldHelp({ 
  label, 
  description, 
  example, 
  required, 
  children, 
  error 
}: FieldHelpProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        <HelpIcon
          content={description}
          title={`${label} Help`}
          size="sm"
        />
      </div>
      
      {children}
      
      <div className="space-y-1">
        {example && (
          <p className="text-xs text-muted-foreground">
            Example: {example}
          </p>
        )}
        
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// Contextual error messages with suggestions
export function ContextualError({ 
  error, 
  suggestion,
  action
}: { 
  error: string; 
  suggestion?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-destructive font-medium">{error}</p>
          {suggestion && (
            <p className="text-xs text-muted-foreground mt-1">{suggestion}</p>
          )}
          {action && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Success message with next steps
export function ContextualSuccess({ 
  message, 
  nextSteps 
}: { 
  message: string; 
  nextSteps?: string[];
}) {
  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-start gap-2">
        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-green-800 font-medium">{message}</p>
          {nextSteps && nextSteps.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-green-700 font-medium mb-1">Next steps:</p>
              <ul className="space-y-0.5">
                {nextSteps.map((step, index) => (
                  <li key={index} className="text-xs text-green-700 flex items-start gap-1">
                    <span className="mt-1">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}