import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import JobCard from '../components/JobCard';

export default function SavedJobs() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: async () => {
      const res = await axiosInstance.get('/jobs/me/saved');
      return res.data;
    },
  });

  if (isLoading) return <div className="p-6">Loading saved jobs...</div>;
  if (error) return <div className="p-6">Error loading saved jobs</div>;

  const jobs = data?.savedJobs || [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Saved jobs</h1>
      {jobs.length === 0 && <div className="text-gray-600">You have no saved jobs.</div>}
      <div className="grid gap-4">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} onView={() => {}} />
        ))}
      </div>
    </div>
  );
}
