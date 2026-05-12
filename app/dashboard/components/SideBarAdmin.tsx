"use client";

import {
  Bolt,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  Loader2,
  LogOut,
  Newspaper,
  UserRoundPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";

import { uploadAvatar } from "@/actions/upload-avatar";
import UploadPhotoDialog from "@/app/dashboard/components/UploadPhotoDialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar/sidebar";
import { useSidebar } from "@/components/ui/sidebar/sidebar";
import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

function TriggerCollapsed() {
  const { state } = useSidebar();

  if (state !== "collapsed") {
    return (
      <SidebarTrigger>
        <ChevronLeft className="h-8 w-8" />
      </SidebarTrigger>
    );
  } else {
    return (
      <SidebarTrigger>
        <ChevronRight className="h-8 w-8" />
      </SidebarTrigger>
    );
  }
}

type Props = {
  children: React.ReactNode;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export default function SideBarAdmin({ children, user }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const toast = useToast();
  const [image, setImage] = useState<string | null>(user?.image ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { executeAsync: executeUploadAvatar } = useAction(uploadAvatar);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [previewImage, setPreviewImage] = useState<string | null>(null);

  
  function handleClick() {
    if (isUploading) return;
    inputRef.current?.click();
  }

function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  const previewUrl = URL.createObjectURL(file);

  setSelectedFile(file);
  setPreviewImage(previewUrl);
  setIsDialogOpen(true);

  e.target.value = "";
}

async function handleConfirmUpload() {
  if (!selectedFile) return;

  const previousImage = image;
  setIsUploading(true);

  try {
    setImage(previewImage);

    const result = await executeUploadAvatar({
      avatar: selectedFile,
    });

    const imageUrl = result?.data?.imageUrl;

    if (!imageUrl) {
      const avatarErrors = result?.validationErrors?.avatar?._errors;
      const formErrors = result?.validationErrors?._errors;

      throw new Error(
        avatarErrors?.[0] ??
          formErrors?.[0] ??
          result?.serverError ??
          "Erro ao atualizar avatar."
      );
    }

    setImage(imageUrl);
    toast.success("Avatar atualizado.");
    setIsDialogOpen(false);
    router.refresh();
  } catch (error) {
    setImage(previousImage);
    toast.error(
      error instanceof Error ? error.message : "Erro ao atualizar avatar."
    );
  } finally {
    if (previewImage) URL.revokeObjectURL(previewImage);

    setSelectedFile(null);
    setPreviewImage(null);
    setIsUploading(false);
  }
}


function handleDialogChange(open: boolean) {
  if (!open && previewImage) {
    URL.revokeObjectURL(previewImage);
    setPreviewImage(null);
    setSelectedFile(null);
  }

  setIsDialogOpen(open);
}


  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Erro ao sair.");
      setIsSigningOut(false);
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-lg font-bold">Clinica</h2>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton>
                  <Calendar />
                  Agendamentos
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href="/dashboard/professionals">
                <SidebarMenuButton>
                  <UserRoundPlus />
                  Profissionais
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href="">
                <SidebarMenuButton>
                  <Newspaper />
                  Relatorios
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href="/dashboard/settings">
                <SidebarMenuButton>
                  <Bolt />
                  Configuracoes
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="my-6 flex flex-row items-center gap-3">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={handleClick}
            className="bg-muted relative flex h-12.5 w-12.5 cursor-pointer items-center justify-center overflow-hidden rounded-full"
            aria-label="Alterar avatar"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                handleClick();
              }
            }}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="avatar"
                className="h-full w-full object-cover hover:bg-black/40"
              />
            ) : (
              <CircleUser size={50} />
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
          </div>

          <div>
            <p>Bem vindo</p>
            <p>{user?.name ?? user?.email}</p>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-4">
            <TriggerCollapsed />
            <h1 className="text-xl font-semibold">Administracao</h1>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="hover:text-primary flex cursor-pointer items-center gap-4 text-xl font-bold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? "Saindo..." : "Sair"}
            {isSigningOut ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogOut />
            )}
          </button>
        </div>
        <hr />

        {children}
      </SidebarInset>
      <UploadPhotoDialog
  open={isDialogOpen}
  onOpenChange={handleDialogChange}
  preview={previewImage}
  isUploading={isUploading}
  onConfirm={handleConfirmUpload}
/>
    </SidebarProvider>
  );
}
