import { notifications } from "@mantine/notifications";

const successClassNames = {
  root: "!bg-primary !border-primary !text-textOnPrimary shadow-lg",
  title: "!text-textOnPrimary !font-semibold",
  description: "!text-textOnPrimary/90",
  closeButton:
    "!text-textOnPrimary/70 hover:!bg-textOnPrimary/10 hover:!text-textOnPrimary",
} as const;

const errorClassNames = {
  root: "!bg-danger !border-danger !text-white shadow-lg",
  title: "!text-white !font-semibold",
  description: "!text-white/90",
  closeButton: "!text-white/70 hover:!bg-white/10 hover:!text-white",
} as const;

const infoClassNames = {
  root: "!bg-surface !border !border-primary/40 !text-text shadow-lg",
  title: "!text-text !font-semibold",
  description: "!text-text/80",
  closeButton: "!text-text/50 hover:!bg-white/5 hover:!text-text",
} as const;

/**
 * Show error notification.
 * Danger red with white type — high contrast. Does not auto-dismiss.
 */
export const showErrorNotification = (
  message: string,
  title: string = "Error"
) => {
  notifications.show({
    title,
    message,
    autoClose: false,
    withCloseButton: true,
    position: "top-right",
    classNames: errorClassNames,
  });
};

/**
 * Show success notification.
 * Brand gold with dark type — readable on Studio chrome. Auto-dismisses.
 */
export const showSuccessNotification = (
  message: string,
  title: string = "Success"
) => {
  notifications.show({
    title,
    message,
    autoClose: 3000,
    withCloseButton: true,
    position: "top-right",
    classNames: successClassNames,
  });
};

/**
 * Show info notification.
 * Surface panel with gold edge and light type. Auto-dismisses.
 */
export const showInfoNotification = (
  message: string,
  title: string = "Info"
) => {
  notifications.show({
    title,
    message,
    autoClose: 3000,
    withCloseButton: true,
    position: "top-right",
    classNames: infoClassNames,
  });
};
