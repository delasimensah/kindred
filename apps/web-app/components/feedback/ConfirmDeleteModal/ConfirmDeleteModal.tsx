"use client";

import { Button, Modal } from "@mantine/core";
import React from "react";

import Text from "../../ui/Text/Text";

interface ConfirmDeleteModalProps {
  opened: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  opened,
  title = "Delete?",
  message,
  confirmLabel = "Delete",
  isConfirming = false,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      transitionProps={{ duration: 0 }}
      classNames={{
        content: "bg-surface text-text",
        header: "bg-surface",
        title: "font-display text-lg text-text",
        close: "text-text/60 hover:bg-white/5 hover:text-text",
      }}
    >
      <Text className="mb-6 text-sm leading-relaxed text-text/70">
        {message}
      </Text>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="default"
          onClick={onClose}
          disabled={isConfirming}
          className="h-auto rounded-xl border-white/10 bg-transparent px-5 py-2.5 text-sm font-medium text-text/70"
        >
          Cancel
        </Button>
        <Button
          loading={isConfirming}
          onClick={onConfirm}
          className="h-auto rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
