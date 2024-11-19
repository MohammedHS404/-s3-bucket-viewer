// S3BucketSelector.tsx

import React, { useState } from "react";
import { FormControl, TextField } from "@mui/material";

interface S3BucketSelectorProps {
  onBucketSelect: (bucketName: string) => void;
}

const S3BucketSelector: React.FC<S3BucketSelectorProps> = ({
  onBucketSelect,
}) => {
  const [_,setSelectedBucket] = useState<string>("");

  function handleChange(
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    const bucketName = event.target.value;
    setSelectedBucket(bucketName);
    onBucketSelect(bucketName);
  }

  return (
    <FormControl fullWidth variant="outlined" style={{ marginBottom: "20px" }}>
      <TextField label="S3 Bucket" onBlur={handleChange} variant="outlined" />
    </FormControl>
  );
};

export default S3BucketSelector;
