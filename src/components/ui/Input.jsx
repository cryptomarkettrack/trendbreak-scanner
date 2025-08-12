import React from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';

const Input = React.forwardRef(({ 
  className, 
  type = 'text', 
  label,
  placeholder,
  error,
  description,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  leftElement,
  rightElement,
  onLeftIconClick,
  onRightIconClick,
  id,
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random()?.toString(36)?.substr(2, 9)}`;

  const inputElement = (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-input text-text-primary px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        leftIcon && "pl-10",
        rightIcon && "pr-10",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      ref={ref}
      disabled={disabled}
      placeholder={placeholder}
      id={inputId}
      {...props}
    />
  );

  if (!label && !leftIcon && !rightIcon && !leftElement && !rightElement && !error && !description) {
    return inputElement;
  }

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block",
            error ? "text-destructive" : "text-text-primary"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftElement && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {leftElement}
          </div>
        )}
        
        {leftIcon && !leftElement && (
          <button
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground hover:text-text-primary transition-colors"
            onClick={onLeftIconClick}
            disabled={disabled}
          >
            <Icon name={leftIcon} size={16} />
          </button>
        )}

        {inputElement}

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            {rightElement}
          </div>
        )}

        {rightIcon && !rightElement && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground hover:text-text-primary transition-colors"
            onClick={onRightIconClick}
            disabled={disabled}
          >
            <Icon name={rightIcon} size={16} />
          </button>
        )}
      </div>

      {description && !error && (
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;