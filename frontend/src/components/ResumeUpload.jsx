import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadResume, resetSuccess, resetError } from '../features/resume/resumeSlice';
import LoadingSpinner from './LoadingSpinner';

const ResumeUpload = ({ onUploadSuccess }) => {
  const dispatch = useDispatch();
  const { uploading, uploadProgress, error, success } = useSelector((state) => state.resume);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  const validateFile = (file) => {
    setFileError('');

    if (!file) {
      setFileError('No file selected');
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only PDF and DOCX files are allowed');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setFileError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const result = await dispatch(uploadResume(formData));
      if (uploadResume.fulfilled.match(result)) {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (onUploadSuccess) {
          onUploadSuccess(result.payload);
        }
        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          dispatch(resetSuccess());
        }, 3000);
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Card */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold">Resume Upload</h3>
            <p className="text-sm text-slate-500 mt-2">Upload your resume for AI-powered ATS analysis and role matching.</p>
            <div className="mt-4 text-sm text-slate-600">
              <p className="font-medium">Supported Formats</p>
              <p>PDF, DOCX</p>
              <p className="mt-3 font-medium">Max Size</p>
              <p>5 MB</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
            <h4 className="text-sm font-semibold">Recent Uploads</h4>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {/* Placeholder for recent uploads list (keeps existing functionality) */}
              <p>No recent uploads</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
            <h4 className="text-sm font-semibold">Upload Tips</h4>
            <ul className="mt-3 list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>Use a clean, chronological layout</li>
              <li>Include project links and tech stack</li>
              <li>Avoid images or complex tables</li>
            </ul>
          </div>
        </aside>

        {/* Main Upload Card */}
        <main className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Resume Analyzer</h2>
                <p className="mt-1 text-sm text-slate-500">Upload your resume and receive AI-powered ATS analysis, role matching, keyword optimization, and career insights.</p>
              </div>
              <div className="text-sm text-slate-500">{uploading && <span>Uploading {uploadProgress}%</span>}</div>
            </div>

            <div className="mt-6">
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer ${isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div>
                    <div className="text-xl font-semibold">{selectedFile.name}</div>
                    <div className="text-sm text-slate-500">{(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type}</div>
                    <div className="mt-4 flex gap-3">
                      <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500" onClick={handleUpload} disabled={uploading}>Upload & Analyze</button>
                      <button className="rounded-md border border-slate-200 px-4 py-2 text-sm" onClick={handleClearFile} disabled={uploading}>Change File</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl">📄</div>
                    <h3 className="text-xl font-semibold mt-2">Drag & drop your resume, or click to browse</h3>
                    <p className="mt-2 text-sm text-slate-500">Supported: PDF, DOCX • Max 5 MB</p>
                    <div className="mt-4">
                      <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500" onClick={() => fileInputRef.current?.click()}>Select File</button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
              </div>

              {fileError && <div className="mt-4 text-sm text-rose-600">⚠️ {fileError}</div>}

              {uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div>Uploading & Analyzing...</div>
                    <div>{uploadProgress}%</div>
                  </div>
                  <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <div className="mt-3"><LoadingSpinner /></div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResumeUpload;
