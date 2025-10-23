import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import JobCard from '../components/JobCard';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function JobsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const qParam = searchParams.get('q') || '';
  const locationParam = searchParams.get('location') || '';
  const companyParam = searchParams.get('company') || '';
  const employmentTypeParam = searchParams.get('employmentType') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [q, setQ] = useState(qParam);
  const [location, setLocation] = useState(locationParam);
  const [company, setCompany] = useState(companyParam);
  const [employmentType, setEmploymentType] = useState(employmentTypeParam);
  const [remoteOnly, setRemoteOnly] = useState(searchParams.get('remote') === 'true');
  const [salaryBucket, setSalaryBucket] = useState(searchParams.get('salaryBucket') || 'any');
  const [page, setPage] = useState(pageParam);
  const limit = 10;
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    const params = {};
    if (q) params.q = q;
    if (location) params.location = location;
    if (company) params.company = company;
    if (employmentType) params.employmentType = employmentType;
    if (remoteOnly) params.remote = 'true';
    if (salaryBucket && salaryBucket !== 'any') params.salaryBucket = salaryBucket;
    if (page && page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, location, company, employmentType, page]);

  const queryKey = useMemo(() => ['jobs', { q, location, company, employmentType, page }], [q, location, company, employmentType, page]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = { page, limit };
      if (q) params.q = q;
      if (location) params.location = location;
      if (company) params.company = company;
      if (employmentType) params.employmentType = employmentType;
      if (remoteOnly) params.remote = 'true';
      if (salaryBucket && salaryBucket !== 'any') {
        // map bucket to salaryMin/salaryMax
        switch (salaryBucket) {
          case '0-75000':
            params.salaryMax = 75000;
            break;
          case '75000-125000':
            params.salaryMin = 75000;
            params.salaryMax = 125000;
            break;
          case '125000-200000':
            params.salaryMin = 125000;
            params.salaryMax = 200000;
            break;
          case '200000+':
            params.salaryMin = 200000;
            break;
          default:
            break;
        }
      }
      const res = await axiosInstance.get('/jobs', { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  // fetch selected job details for preview panel (always declare hook)
  const { data: selectedJobData } = useQuery({
    queryKey: ['job', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return null;
      const res = await axiosInstance.get(`/jobs/${selectedJobId}`);
      return res.data;
    },
    enabled: !!selectedJobId,
  });

  // derive jobs/total even while loading to keep hooks/render order stable
  const jobs = data?.jobs || [];
  const total = data?.total || 0;



  const loadMore = () => {
    if (jobs.length + (page - 1) * limit >= total) return;
    setPage((p) => p + 1);
  };

  // infinite scroll via IntersectionObserver on a sentinel div
  useEffect(() => {
    const sentinel = document.getElementById('jobs-sentinel');
    if (!sentinel) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // attempt to load more
          if (jobs.length + (page - 1) * limit < total) {
            setPage((p) => p + 1);
          }
        }
      });
    }, { rootMargin: '200px' });

    obs.observe(sentinel);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, page, total]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Jobs</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: filters */}
        <aside className="lg:col-span-3">
          <div className="bg-white p-4 rounded shadow-sm sticky top-20">
            <div className="space-y-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs, keywords" className="input input-bordered w-full" />
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="input input-bordered w-full" />
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="input input-bordered w-full" />
              <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="select select-bordered w-full">
                <option value="">Any type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
              <div className="flex items-center space-x-2">
                <input id="remoteOnly" type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} />
                <label htmlFor="remoteOnly" className="text-sm">Remote only</label>
              </div>
              <select value={salaryBucket} onChange={(e) => setSalaryBucket(e.target.value)} className="select select-bordered w-full">
                <option value="any">Any salary</option>
                <option value="0-75000">0 - 75,000</option>
                <option value="75000-125000">75,000 - 125,000</option>
                <option value="125000-200000">125,000 - 200,000</option>
                <option value="200000+">200,000+</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Center: list */}
        <main className="lg:col-span-6">
          <div className="space-y-4" role="list" aria-label="Job listings">
            {isLoading ? (
              <div className="p-6">Loading jobs...</div>
            ) : error ? (
              <div className="p-6">Error loading jobs</div>
            ) : jobs.length === 0 ? (
              <div className="text-gray-600">No jobs found</div>
            ) : (
              jobs.map((job, idx) => (
                <div
                  key={job._id}
                  className={`cursor-pointer p-1 ${selectedJobId === job._id ? 'ring-2 ring-blue-200 rounded' : ''}`}
                  onClick={() => {
                  // on small screens navigate, on large show preview
                    if (window.innerWidth < 1024) {
                      navigate(`/jobs/${job._id}`);
                    } else {
                      setSelectedJobId(job._id);
                    }
                }}>
                  <div
                    role="listitem"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (window.innerWidth < 1024) navigate(`/jobs/${job._id}`);
                        else setSelectedJobId(job._id);
                      }
                      if (e.key === 'ArrowDown') {
                        const next = jobs[idx + 1];
                        if (next) setSelectedJobId(next._id);
                      }
                      if (e.key === 'ArrowUp') {
                        const prev = jobs[idx - 1];
                        if (prev) setSelectedJobId(prev._id);
                      }
                    }}
                    aria-selected={selectedJobId === job._id}
                  >
                    <JobCard job={job} onView={() => {
                      if (window.innerWidth < 1024) navigate(`/jobs/${job._id}`);
                      else setSelectedJobId(job._id);
                    }} />
                  </div>
                </div>
              ))
            )}

            <div id="jobs-sentinel" className="mt-4 h-6 text-center">
              {jobs.length + (page - 1) * limit < total ? (
                <div className="text-sm text-gray-500">Loading more...</div>
              ) : (
                <div className="text-sm text-gray-500">No more jobs</div>
              )}
            </div>
          </div>
        </main>

        {/* Right: preview */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="bg-white p-4 rounded shadow-sm sticky top-20">
            {selectedJobId ? (
              selectedJobData ? (
                <div>
                  <div className="flex items-center space-x-3">
                    {selectedJobData.company?.logoUrl ? (
                      <img src={selectedJobData.company.logoUrl} alt={selectedJobData.company.name} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">🏢</div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{selectedJobData.job.title}</h3>
                      <div className="text-sm text-gray-600">{selectedJobData.job.company} • {selectedJobData.job.location}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-2">
                    {selectedJobData.job.remote && (<span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Remote</span>)}
                    {selectedJobData.job.employmentType && (<span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">{selectedJobData.job.employmentType}</span>)}
                    {selectedJobData.job.salaryRange?.min && (
                      <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-800 rounded">{selectedJobData.job.salaryRange.currency} {selectedJobData.job.salaryRange.min.toLocaleString()} - {selectedJobData.job.salaryRange.max?.toLocaleString() || '+'}</span>
                    )}
                  </div>

                  <div className="mt-3 text-sm text-gray-700 max-h-40 overflow-auto whitespace-pre-wrap">{selectedJobData.job.description}</div>
                  <div className="mt-4 flex space-x-2">
                    <button onClick={() => navigate(`/jobs/${selectedJobId}`)} className="px-3 py-2 bg-blue-600 text-white rounded">View full job</button>
                    {selectedJobData.job.applyUrl ? (
                      <a href={selectedJobData.job.applyUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-green-600 text-white rounded">Apply on company site</a>
                    ) : (
                      <button onClick={() => navigate(`/jobs/${selectedJobId}`)} className="px-3 py-2 bg-indigo-600 text-white rounded">Apply</button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6">Loading preview...</div>
              )
            ) : (
              <div className="text-sm text-gray-600">Select a job to preview details here</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
