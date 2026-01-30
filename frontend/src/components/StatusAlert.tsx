// src/components/StatusAlert.tsx
import { Alert } from "@mui/material";
import type { AlertColor } from "@mui/material";

type StatusMessage = {
  type: AlertColor;
  text: string;
};

type StatusAlertProps = {
  message?: StatusMessage | null;
};

export default function StatusAlert({ message }: StatusAlertProps) {
  if (!message) return null;

  return (
    <Alert severity={message.type}>
      {message.text}
    </Alert>
  );
}