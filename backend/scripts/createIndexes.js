#!/usr/bin/env node
import dotenv from 'dotenv';
import { connectDB } from '../lib/db.js';
import Job from '../models/job.model.js';

dotenv.config();

async function run() {
  try {
    await connectDB();
    console.log('Connected to DB, syncing indexes for Job...');
    await Job.syncIndexes();
    console.log('Job indexes synced.');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing indexes:', err);
    process.exit(1);
  }
}

run();
