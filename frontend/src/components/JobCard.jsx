import React from 'react';
import Avatar from './Avatar';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';

export default function JobCard({ job, onView }) {
  const queryClient = useQueryClient();

  // fetch saved jobs for current user to determine saved state
  const { data: savedData } = useQuery({ queryKey: ['savedJobs'], queryFn: async () => {
    try {
      const res = await axiosInstance.get('/jobs/me/saved');
      return res.data;
    } catch (err) {
      return null;
    }
  }, enabled: true });

  const derivedIsSaved = savedData?.savedJobs?.some((j) => String(j._id) === String(job._id));
  // local optimistic state makes JobCard independent of savedJobs refetch
  const [localSaved, setLocalSaved] = React.useState(!!derivedIsSaved);

  // keep local state in sync when savedData changes
  React.useEffect(() => {
    setLocalSaved(!!derivedIsSaved);
  }, [derivedIsSaved]);

  const saveMutation = useMutation({
    mutationFn: async () => await axiosInstance.post(`/jobs/me/save/${job._id}`),
    // optimistic update: add job to savedJobs cache immediately
    onMutate: async () => {
      await queryClient.cancelQueries(['savedJobs']);
      const previous = queryClient.getQueryData(['savedJobs']);
      const prevLocal = localSaved;
      // optimistic local change
      setLocalSaved(true);
      queryClient.setQueryData(['savedJobs'], (old) => {
        if (!old) return { savedJobs: [job] };
        const exists = (old.savedJobs || []).some((j) => String(j._id) === String(job._id));
        if (exists) return old;
        return { ...old, savedJobs: [job, ...(old.savedJobs || [])] };
      });
      return { previous, prevLocal };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['savedJobs'], context?.previous);
      // rollback local
      if (context?.prevLocal !== undefined) setLocalSaved(context.prevLocal);
      toast.error('Failed to save job');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['savedJobs']);
      toast.success('Job saved');
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async () => await axiosInstance.post(`/jobs/me/unsave/${job._id}`),
    onMutate: async () => {
      await queryClient.cancelQueries(['savedJobs']);
      const previous = queryClient.getQueryData(['savedJobs']);
      const prevLocal = localSaved;
      // optimistic local change
      setLocalSaved(false);
      queryClient.setQueryData(['savedJobs'], (old) => {
        if (!old) return { savedJobs: [] };
        return { ...old, savedJobs: (old.savedJobs || []).filter((j) => String(j._id) !== String(job._id)) };
      });
      return { previous, prevLocal };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['savedJobs'], context?.previous);
      if (context?.prevLocal !== undefined) setLocalSaved(context.prevLocal);
      toast.error('Failed to unsave job');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['savedJobs']);
      toast.success('Removed from saved');
    },
  });
  return (
    <div className="bg-white rounded-md shadow-sm p-4 mb-4">
      <div className="flex items-start">
        <div className="mr-3">
          <Avatar src={job.postedBy?.profilePicture} name={job.postedBy?.name} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <div className="text-sm text-gray-600">{job.company} • {job.location} {job.remote ? (<span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Remote</span>) : null}</div>
              {job.salaryRange?.min && job.salaryRange?.max && (
                <div className="text-sm text-gray-700 mt-1">{job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}</div>
              )}
            </div>
            <div className="text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</div>
          </div>
          <p className="mt-2 text-sm text-gray-700 line-clamp-3">{job.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">{job.employmentType || '—'}</div>
            <div className='flex items-center space-x-2'>
              <button onClick={() => onView(job)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">View</button>
              {localSaved ? (
                <button aria-pressed="true" onClick={() => unsaveMutation.mutate()} disabled={unsaveMutation.isLoading} className="px-3 py-1 bg-gray-200 text-sm rounded">{unsaveMutation.isLoading ? 'Removing...' : 'Saved'}</button>
              ) : (
                <button aria-pressed="false" onClick={() => saveMutation.mutate()} disabled={saveMutation.isLoading} className="px-3 py-1 bg-green-600 text-white rounded text-sm">{saveMutation.isLoading ? 'Saving...' : 'Save'}</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
