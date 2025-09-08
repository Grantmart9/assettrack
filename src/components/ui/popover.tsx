import * as React from "react";

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Popover = ({ children, content, open, onOpenChange }: PopoverProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false);
  
  const toggleOpen = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const closePopover = () => {
    setIsOpen(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Close popover when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        closePopover();
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <div onClick={toggleOpen}>
        {children}
      </div>
      {isOpen && (
        <div 
          className="absolute z-50 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

export const PopoverContent = ({ children, className }: PopoverContentProps) => {
  return (
    <div className={`p-4 ${className || ""}`}>
      {children}
    </div>
  );
};

interface PopoverTriggerProps {
  children: React.ReactNode;
}

export const PopoverTrigger = ({ children }: PopoverTriggerProps) => {
  return <>{children}</>;
};