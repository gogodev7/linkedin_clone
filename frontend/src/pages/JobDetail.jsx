import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/jobs/${id}`);
      return res.data;
    },
  });

  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumePreview, setResumePreview] = useState(null);

  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (isLoading) return <div className="p-6">Loading job...</div>;
  if (error) return <div className="p-6">Error loading job</div>;

  const job = data?.job;
  if (!job) return <div className="p-6">Job not found</div>;

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData();
      if (resume) form.append('resume', resume, resume.name);
      if (coverLetter) form.append('coverLetter', coverLetter);

      const res = await axiosInstance.post(`/jobs/${job._id}/apply`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(pct);
        },
      });

      if (res.data?.success) {
        toast.success('Applied successfully');
        // invalidate job list/detail so applicants count updates
        queryClient.invalidateQueries(['job', id]);
        queryClient.invalidateQueries(['jobs']);
      } else {
        toast.error(res.data?.message || 'Apply failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Apply failed');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleResumeChange = (file) => {
    if (!file) {
      setResume(null);
      setResumePreview(null);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid resume file type. Allowed: PDF, DOC, DOCX');
      return;
    }
    if (file.size > maxSize) {
      toast.error('Resume too large (max 5MB)');
      return;
    }

    setResume(file);

    // For PDF show filename; for doc/docx we can't preview - show filename only
    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setResumePreview({ type: 'pdf', url });
    } else {
      setResumePreview({ type: 'file', name: file.name });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <div className="text-sm text-gray-600">{job.company} • {job.location}</div>
      <div className="mt-4 whitespace-pre-wrap text-gray-800">{job.description}</div>

      <div className="mt-6">
        {job.applyUrl ? (
          <a className="px-4 py-2 bg-green-600 text-white rounded" href={job.applyUrl} target="_blank" rel="noreferrer">Apply on company site</a>
        ) : (
          <form onSubmit={handleApply} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Resume (PDF or DOC)</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleResumeChange(e.target.files?.[0] || null)} />
              {resumePreview && (
                <div className="mt-2 text-sm text-gray-700">
                  {resumePreview.type === 'pdf' ? (
                    <a href={resumePreview.url} target="_blank" rel="noreferrer" className="underline">Preview PDF</a>
                  ) : (
                    <div>{resumePreview.name}</div>
                  )}
                </div>
              )}
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded h-2 mt-2">
                  <div style={{ width: `${uploadProgress}%` }} className="bg-blue-600 h-2 rounded"></div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Cover letter (optional)</label>
              <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="textarea textarea-bordered w-full" rows={4} />
            </div>
            <div>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">
                {submitting ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
