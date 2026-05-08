/**
 * VideoCall Component
 * 
 * Embeds Jitsi Meet for video consultations.
 * Each appointment gets a unique room based on its ID.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Video, Maximize2, Minimize2 } from "lucide-react";

interface VideoCallProps {
  appointmentId: string;
  appointmentTitle: string;
  /** Optional custom Jitsi domain (defaults to meet.jit.si) */
  jitsiDomain?: string;
  /** When provided, the dialog is open immediately and this callback fires on close */
  onClose?: () => void;
}

export default function VideoCall({
  appointmentId,
  appointmentTitle,
  jitsiDomain = "meet.jit.si",
  onClose,
}: VideoCallProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // When onClose is provided (global overlay mode), start open; otherwise use trigger
  const [isOpen, setIsOpen] = useState(!!onClose);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) onClose();
  };

  // Generate a unique room name from the appointment ID
  const roomName = `healthcalpro-${appointmentId.replace(/-/g, "").substring(0, 16)}`;
  const jitsiUrl = `https://${jitsiDomain}/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true`;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* Only render trigger button when NOT in global overlay mode */}
      {!onClose && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Video className="h-4 w-4" />
            Video Call
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className={
          isFullscreen
            ? "fixed inset-0 max-w-none w-screen h-screen rounded-none p-0"
            : "max-w-9xl w-full h-[80vh] p-0"
        }
      >
        <DialogHeader className="px-4 py-2 border-b flex-row items-center justify-between">
          <DialogTitle className="text-sm font-medium">
            📹 {appointmentTitle}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </DialogHeader>
        <iframe
          src={jitsiUrl}
          title={`Video call – ${appointmentTitle}`}
          className={`w-full flex-1 border-0 ${isFullscreen ? "video-iframe-fullscreen" : "video-iframe-normal"}`}
          allow="camera; microphone; display-capture; autoplay; clipboard-write"
          allowFullScreen
        />
      </DialogContent>
    </Dialog>
  );
}
