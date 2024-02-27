import React, { ChangeEvent, useRef } from "react";
import { CSFReaderProps } from "./types";
import extractText from "./utils";

const CSFReader: React.FC<CSFReaderProps> = ({
  handleChange,
  trigger,
  onLoadStart,
  onLoadEnd,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];

    if (file) {
      onLoadStart();
      handleChange(await extractText(file));
      onLoadEnd();
    }
  };
  const handleTriggerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="pdf-reader-container">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {React.cloneElement(trigger, { onClick: handleTriggerClick })}
    </div>
  );
};

export default CSFReader;
