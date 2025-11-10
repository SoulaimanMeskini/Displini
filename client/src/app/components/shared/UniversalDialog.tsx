import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { ReactNode } from "react";

interface UniversalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  hideDefaultFooter?: boolean;
  scrollable?: boolean; // Enable scrolling for long content
}

export default function UniversalDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  onSave,
  onCancel,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  hideDefaultFooter = false,
  scrollable = true,
}: UniversalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md ${scrollable ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {children}
        </div>

        {!hideDefaultFooter && (
          <DialogFooter>
            {footer || (
              <div className="flex gap-2 w-full sm:w-auto">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 sm:flex-initial"
                  >
                    {cancelLabel}
                  </Button>
                )}
                {onSave && (
                  <Button
                    type="button"
                    onClick={onSave}
                    className="flex-1 sm:flex-initial"
                  >
                    {saveLabel}
                  </Button>
                )}
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

