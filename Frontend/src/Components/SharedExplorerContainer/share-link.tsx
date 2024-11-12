"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Facebook,
  Mail,
  Share2,
  Twitter,
  Copy,
  Check,
  Loader,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiTeacherInstance } from "../../Helper/axiosInstance";

export function ShareLinkComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateLink = async () => {
    setIsLoading(true);
    try {
      const response = await apiTeacherInstance.get(
        "/file-folder/generateUniqueShareableLink"
      );
      if (response.data.success) {
        setLink(response.data.shareableLink);
        setIsOpen(true);
        toast({
          title: "Success",
          description: response.data.message,
        });
      } else {
        throw new Error("Failed to generate link");
      }
    } catch (error) {
      console.error("Error generating link:", error);
      toast({
        title: "Error",
        description: "Failed to generate link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "The link has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const shareToSocial = (platform: string) => {
    let shareUrl = "";
    switch (platform) {
      case "Facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          link
        )}`;
        break;
      case "Twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          link
        )}`;
        break;
      case "Email":
        shareUrl = `mailto:?subject=Check out this shared file&body=${encodeURIComponent(
          link
        )}`;
        break;
      case "WhatsApp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(link)}`;
        break;
    }
    if (shareUrl) window.open(shareUrl, "_blank");
  };

  return (
    <>
      <Button onClick={generateLink} disabled={isLoading}>
        {isLoading ? (
          <Loader className="animate-spin mr-2" size={16} />
        ) : (
          <span className="sm:pr-3">🔗</span>
        )}
        <span className="hidden sm:inline-block">
          {isLoading ? "Generating..." : "Generate Link"}
        </span>
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share link</DialogTitle>
          </DialogHeader>
          <div className="flex justify-around py-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("Facebook")}>
              <Facebook className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("Twitter")}>
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("Email")}>
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shareToSocial("WhatsApp")}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Input value={link} readOnly className="flex-1" />
            <Button
              size="sm"
              className="px-3"
              onClick={copyToClipboard}
              variant={copied ? "outline" : "default"}>
              <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
