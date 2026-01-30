// src/components/FilePickerButton.tsx
import React from "react";
import { Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

type FilePickerButtonProps = {
  label: string;
  disabled?: boolean;
  onPick: (file: File | null) => void;
};

export default function FilePickerButton({
  label,
  disabled = false,
  onPick,
}: FilePickerButtonProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onPick(file);
    e.currentTarget.value = "";
  };

  return (
    <Button
      component="label"
      variant="outlined"
      size="large"
      startIcon={<UploadFileIcon />}
      sx={{
        justifyContent: "center",
        py: 1.6,
        color: "#8F4E45",
        borderColor: "#8F4E45",
        backgroundColor: "rgba(255,255,255,0.35)"
      }}
      disabled={disabled}
    >
      {label}
      <input type="file" hidden onChange={handleChange} />
    </Button>
  );
}
