"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type UploadPhotoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: string | null;
  isUploading: boolean;
  onConfirm: () => void;
};

export default function UploadPhotoDialog({
  open,
  onOpenChange,
  preview,
  isUploading,
  onConfirm,
}: UploadPhotoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar foto de perfil</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-4">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Pré-visualização"
              className="h-40 w-40 rounded-full object-cover"
            />
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancelar
          </Button>

          <Button onClick={onConfirm} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}