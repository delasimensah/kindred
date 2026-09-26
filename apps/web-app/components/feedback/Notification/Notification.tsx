import {
  showErrorNotification,
  showInfoNotification,
  showSuccessNotification,
} from "@/utils";

export interface NotificationProps {
  title?: string;
  message: string;
  variant?: "error" | "success" | "info";
}

/**
 * Studio call sites invoke these as functions (not JSX).
 * They forward to Mantine toasts with Kindred contrast.
 */
export function ErrorNotification({
  title = "Error",
  message,
}: NotificationProps): void {
  showErrorNotification(message, title);
}

export function SuccessNotification({
  title = "Success",
  message,
}: NotificationProps): void {
  showSuccessNotification(message, title);
}

export function InfoNotification({
  title = "Info",
  message,
}: NotificationProps): void {
  showInfoNotification(message, title);
}
