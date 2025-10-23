import Job from '../models/job.model.js';
import User from '../models/user.model.js';

export const createJob = async (req, res) => {
  try {
    const data = req.body;
    data.postedBy = req.user?._id || data.postedBy;
    const job = await Job.create(data);

    // emit socket event to connected sockets of interested users (optional)
    const io = req.app.get('io');
    if (io) {
      // broadcast to everyone (fallback)
      io.emit('jobCreated', { job });
    }

    res.status(201).json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // only poster can update
    const userId = req.user?._id;
    if (!userId || String(job.postedBy) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    Object.assign(job, req.body);
    await job.save();
    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate('postedBy', 'name headline avatar');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listJobs = async (req, res) => {
  try {
    const { q, location, company, employmentType, page = 1, limit = 20, remote, salaryMin, salaryMax } = req.query;
    const filter = { isActive: true };
    if (q) filter.$text = { $search: q };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (company) filter.company = { $regex: company, $options: 'i' };
    if (employmentType) filter.employmentType = employmentType;
    if (remote !== undefined) {
      // accept 'true' / 'false' strings
      filter.remote = String(remote) === 'true';
    }
    if (salaryMin || salaryMax) {
      filter['salaryRange.min'] = {};
      if (salaryMin) filter['salaryRange.min'].$gte = parseInt(salaryMin, 10);
      if (salaryMax) {
        // ensure the job's max >= salaryMin and min <= salaryMax by checking min and max bounds
        filter.$or = [
          { 'salaryRange.max': { $gte: parseInt(salaryMax, 10) } },
          { 'salaryRange.min': { $lte: parseInt(salaryMax, 10) } },
        ];
      }
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('postedBy', 'name headline avatar');

    const total = await Job.countDocuments(filter);
    res.json({ success: true, jobs, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const userId = req.user?._id;
    if (!userId || String(job.postedBy) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await job.remove();
    res.json({ success: true, message: 'Job removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const applyToJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (!job.applicants) job.applicants = [];
    if (job.applicants.some((a) => String(a.user || a) === String(userId))) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }

    const applicant = { user: userId };
    if (req.file) {
      // file saved by multer to uploads folder
      const fileUrl = `${req.protocol}://${req.get('host')}/api/v1/uploads/${req.file.filename}`;
      applicant.resumeUrl = fileUrl;
    }

    if (req.body.coverLetter) applicant.coverLetter = req.body.coverLetter;

    job.applicants.push(applicant);
    await job.save();

    // Optionally notify job poster (emit to their connected socket ids if present)
    const io = req.app.get('io');
    if (io && job.postedBy) {
      try {
        const map = io.connectedUsersMap;
        const sockets = map ? map.get(String(job.postedBy)) : null;
        if (sockets && sockets.size) {
          for (const sid of sockets) {
            io.to(sid).emit('jobApplication', { jobId: job._id, applicant: userId });
          }
        } else {
          // fallback: emit to everyone
          io.emit('jobApplication', { jobId: job._id, applicant: userId });
        }
      } catch (err) {
        console.error('Error emitting jobApplication', err);
      }
    }

    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveJobForUser = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params; // job id
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.savedJobs) user.savedJobs = [];
    if (!user.savedJobs.includes(id)) {
      user.savedJobs.push(id);
      await user.save();
    }

    res.json({ success: true, savedJobs: user.savedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const unsaveJobForUser = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.savedJobs = (user.savedJobs || []).filter((jid) => String(jid) !== String(id));
    await user.save();

    res.json({ success: true, savedJobs: user.savedJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMySavedJobs = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId).populate('savedJobs');
    res.json({ success: true, savedJobs: user.savedJobs || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // find jobs where applicants array contains the user
    const jobs = await Job.find({ 'applicants.user': userId }).populate('postedBy', 'name headline avatar');
    res.json({ success: true, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
