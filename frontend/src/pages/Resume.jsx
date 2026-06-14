import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserResumes, getResumeStats, deleteResume } from '../features/resume/resumeSlice';
import ResumeUpload from '../components/ResumeUpload';
import ResumeAnalysisDashboard from '../components/ResumeAnalysisDashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Resume.css';

const ResumePage = () => {
  const dispatch = useDispatch();
  const { resumes, loading, stats } = useSelector((state) => state.resume);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'resumes'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getUserResumes());
    dispatch(getResumeStats());
  }, [dispatch]);

  const handleDeleteResume = async (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      await dispatch(deleteResume(resumeId));
      if (selectedResumeId === resumeId) {
        setSelectedResumeId(null);
      }
    }
  };

  const filteredResumes = resumes.filter((resume) =>
    resume.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadSuccess = (resume) => {
    setSelectedResumeId(resume._id);
    setActiveTab('resumes');
  };

  return (
    <div className="resume-page">
      <div className="resume-header">
        <div className="header-content">
          <h1>📄 Resume Analyzer</h1>
          <p>Upload, analyze, and optimize your resume with AI-powered insights</p>
        </div>

        {stats && (
          <div className="stats-cards">
            <div className="stat-card">
              <span className="stat-label">Total Resumes</span>
              <span className="stat-value">{stats.totalResumes}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg ATS Score</span>
              <span className="stat-value">{stats.averageATSScore}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg Overall Score</span>
              <span className="stat-value">{stats.averageOverallScore}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{stats.completedResumes}</span>
            </div>
          </div>
        )}
      </div>

      <div className="resume-container">
        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <span className="tab-icon">📤</span>
            <span>Upload Resume</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'resumes' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumes')}
          >
            <span className="tab-icon">📋</span>
            <span>My Resumes ({resumes.length})</span>
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="tab-content upload-tab">
            <ResumeUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Resumes Tab */}
        {activeTab === 'resumes' && (
          <div className="tab-content resumes-tab">
            {loading && resumes.length === 0 ? (
              <LoadingSpinner />
            ) : resumes.length > 0 ? (
              <div className="resumes-container">
                {/* Search Bar */}
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search resumes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>

                {/* Resumes List */}
                {filteredResumes.length > 0 ? (
                  <div className="resumes-grid">
                    {filteredResumes.map((resume) => (
                      <div
                        key={resume._id}
                        className={`resume-card ${selectedResumeId === resume._id ? 'selected' : ''}`}
                      >
                        <div className="resume-card-header">
                          <div className="file-info">
                            <span className="file-icon">📄</span>
                            <div>
                              <h4>{resume.fileName}</h4>
                              <p className="file-meta">
                                {new Date(resume.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`status-badge ${resume.status}`}>
                            {resume.status === 'completed' && '✓ Analyzed'}
                            {resume.status === 'processing' && '⏳ Processing'}
                            {resume.status === 'failed' && '✗ Failed'}
                            {resume.status === 'uploading' && '📤 Uploading'}
                          </span>
                        </div>

                        <div className="resume-card-scores">
                          {resume.analysis?.atsScore && (
                            <div className="score-item">
                              <span className="score-label">ATS</span>
                              <span className="score-badge">
                                {resume.analysis.atsScore.score}
                              </span>
                            </div>
                          )}
                          {resume.analysis?.overallScore && (
                            <div className="score-item">
                              <span className="score-label">Overall</span>
                              <span className="score-badge overall">
                                {resume.analysis.overallScore.score}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="resume-card-actions">
                          <button
                            className="btn-action view"
                            onClick={() => setSelectedResumeId(resume._id)}
                            title="View Analysis"
                          >
                            👁️ View
                          </button>
                          <a
                            href={resume.cloudinaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-action download"
                            title="Download"
                          >
                            ⬇️ Download
                          </a>
                          <button
                            className="btn-action delete"
                            onClick={() => handleDeleteResume(resume._id)}
                            title="Delete"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>No resumes found matching your search</p>
                  </div>
                )}

                {/* Analysis View */}
                {selectedResumeId && (
                  <div className="analysis-section">
                    <div className="analysis-header">
                      <h2>Resume Analysis</h2>
                      <button
                        className="close-button"
                        onClick={() => setSelectedResumeId(null)}
                      >
                        ✕
                      </button>
                    </div>
                    <ResumeAnalysisDashboard resumeId={selectedResumeId} />
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h2>No Resumes Yet</h2>
                <p>Upload your first resume to get started with AI-powered analysis</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('upload')}
                >
                  Upload Resume
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePage;
