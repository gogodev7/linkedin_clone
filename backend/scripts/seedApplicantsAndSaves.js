#!/usr/bin/env node
import dotenv from 'dotenv';
import { connectDB } from '../lib/db.js';
import Job from '../models/job.model.js';
import User from '../models/user.model.js';

dotenv.config();

async function run() {
  try {
    await connectDB();
    console.log('Connected to DB. Seeding applicants and saved jobs...');

    const users = await User.find().limit(5);
    const jobs = await Job.find().limit(10);

    if (users.length === 0 || jobs.length === 0) {
      console.log('Need at least one user and one job to seed applicants/saves.');
      process.exit(0);
    }

    // For each user, randomly save some jobs and apply to one
    for (const user of users) {
      // save 2 random jobs
      const shuffled = jobs.sort(() => 0.5 - Math.random());
      const toSave = shuffled.slice(0, 2).map(j => j._id);
      user.savedJobs = Array.from(new Set([...(user.savedJobs || []), ...toSave]));
      await user.save();

      // apply the user to one random job if they haven't applied
      const jobToApply = shuffled[2];
      if (jobToApply) {
        const alreadyApplied = jobToApply.applicants && jobToApply.applicants.some(a => String(a.user || a) === String(user._id));
        if (!alreadyApplied) {
          jobToApply.applicants = jobToApply.applicants || [];
          jobToApply.applicants.push({ user: user._id, coverLetter: 'Excited to apply via seed script.' });
          await jobToApply.save();
          console.log(`User ${user._id} applied to job ${jobToApply._id}`);
        }
      }
    }

    console.log('Applicants and saved jobs seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding applicants/saves', err);
    process.exit(1);
  }
}

run();
