import type { FC } from 'react';
import { useState } from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { assignmentsApi } from '../api/assignments.api';

interface UploadProps {
  assignmentId: string;
  onSuccess: (fileUrl: string, fileName: string, fileSize: number) => void;
}

export const AssignmentUpload: FC<UploadProps> = ({ assignmentId, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size must not exceed 10 MB');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      // 1. Fetch pre-signed parameters
      const presignData = await assignmentsApi.getPresignedUrl(assignmentId, file.name);
      const { url, fields } = presignData;

      // 2. Append parameters to FormData in strict sequence
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      // 3. Post binary file directly to S3
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Could not upload binary to file host.');
      }

      // 4. Return resolved details
      const fileUrl = `${url}${fields.key}`;
      onSuccess(fileUrl, file.name, file.size);
    } catch (err: any) {
      setError(err.message || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 3, border: '2px dashed #e2e8f0', borderRadius: 3, textAlign: 'center', bgcolor: '#f8fafc' }}>
      <input
        type="file"
        id={`assignment-file-${assignmentId}`}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <label htmlFor={`assignment-file-${assignmentId}`}>
        <Button 
          variant="outlined" 
          component="span" 
          disabled={uploading}
          startIcon={<UploadIcon />}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Choose File
        </Button>
      </label>
      {file && (
        <Typography variant="body2" sx={{ mt: 1.5, color: '#334155', fontWeight: 500 }}>
          Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </Typography>
      )}
      {file && !uploading && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleUpload} 
          sx={{ mt: 2, display: 'block', mx: 'auto', textTransform: 'none', borderRadius: 2 }}
        >
          Submit Homework
        </Button>
      )}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <CircularProgress size={24} sx={{ mb: 1 }} />
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
            Uploading files to secure S3 storage...
          </Typography>
        </Box>
      )}
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1.5, display: 'block', fontWeight: 500 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};
