"use client";

import React from "react";

import StudioChoiceCards from "../../ui/StudioChoiceCards/StudioChoiceCards";

export type UploadFormat = "single" | "album";

interface UploadFormatPickerProps {
  value: UploadFormat;
  onChange: (value: UploadFormat) => void;
}

const UploadFormatPicker: React.FC<UploadFormatPickerProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="mb-6">
      <p className="mb-3 text-sm font-medium text-text">
        What are you uploading?
      </p>
      <StudioChoiceCards
        name="upload-format"
        value={value}
        onChange={onChange}
        options={[
          {
            value: "single",
            label: "Single",
            description: "One track with its own cover.",
          },
          {
            value: "album",
            label: "Album or EP",
            description: "Shared cover and an ordered track list.",
          },
        ]}
      />
    </div>
  );
};

export default UploadFormatPicker;
