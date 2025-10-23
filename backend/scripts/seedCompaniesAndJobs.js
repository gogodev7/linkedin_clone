#!/usr/bin/env node
import dotenv from 'dotenv';
import { connectDB } from '../lib/db.js';
import Company from '../models/company.model.js';
import Job from '../models/job.model.js';
import User from '../models/user.model.js';

dotenv.config();

const sampleCompanies = [
  {
    name: 'InnoWave Technologies',
    website: 'https://www.innowave.example',
    logoUrl: '/api/v1/uploads/innowave.svg',
    location: 'San Francisco, CA, USA',
    size: '201-500',
    industry: 'Information Technology',
    description: 'InnoWave builds developer tools and AI-first platforms to accelerate enterprise engineering.'
  },
  {
    name: 'GreenLeaf Health',
    website: 'https://www.greenleaf.example',
    logoUrl: '/api/v1/uploads/greenleaf.svg',
    location: 'Austin, TX, USA',
    size: '51-200',
    industry: 'Healthcare',
    description: 'GreenLeaf Health is focused on preventive care solutions and health analytics.'
  },
  {
    name: 'Nimbus Cloud',
    website: 'https://www.nimbus.example',
    logoUrl: '/api/v1/uploads/nimbus.svg',
    location: 'Seattle, WA, USA',
    size: '1000+',
    industry: 'Cloud Computing',
    description: 'Nimbus provides scalable cloud infrastructure and managed services.'
  },
  {
    name: 'Atlas Robotics',
    website: 'https://www.atlasrobotics.example',
    logoUrl: '/api/v1/uploads/atlas.svg',
    location: 'Boston, MA, USA',
    size: '201-500',
    industry: 'Robotics',
    description: 'Atlas Robotics builds autonomous systems for logistics and warehouses.'
  },
  {
    name: 'FinEdge Capital',
    website: 'https://www.finedge.example',
    logoUrl: '/api/v1/uploads/finedge.svg',
    location: 'New York, NY, USA',
    size: '501-1000',
    industry: 'Financial Services',
    description: 'FinEdge offers algorithmic trading platforms and risk analytics.'
  },
  {
    name: 'Mira Health',
    website: 'https://www.mirahealth.example',
    logoUrl: '/api/v1/uploads/mira.svg',
    location: 'Remote',
    size: '51-200',
    industry: 'Digital Health',
    description: 'Mira Health builds telehealth and remote monitoring solutions.'
  },
  {
    name: 'Cortex AI',
    website: 'https://www.cortexai.example',
    logoUrl: '/api/v1/uploads/cortex.svg',
    location: 'Palo Alto, CA, USA',
    size: '51-200',
    industry: 'Artificial Intelligence',
    description: 'Cortex AI focuses on computer vision and perception at the edge.'
  },
  {
    name: 'Open Harbor',
    website: 'https://www.openharbor.example',
    logoUrl: '/api/v1/uploads/openharbor.svg',
    location: 'Remote',
    size: '11-50',
    industry: 'Logistics',
    description: 'Open Harbor modernizes small-scale shipping and last-mile logistics.'
  }
];

const sampleJobs = [
  {
    title: 'Senior Full-Stack Engineer',
    company: 'InnoWave Technologies',
    location: 'San Francisco, CA, USA',
    description: 'Work on our core platform, mentor engineers, and ship features end-to-end. Strong React/Node experience required.',
    employmentType: 'Full-time',
    seniority: 'Senior',
    salaryRange: { min: 160000, max: 200000, currency: 'USD' },
    remote: false,
  },
  {
    title: 'Machine Learning Engineer',
    company: 'Cortex AI',
    location: 'Palo Alto, CA, USA',
    description: 'Build ML pipelines and productionize models for perception systems. Experience with PyTorch/TensorFlow preferred.',
    employmentType: 'Full-time',
    seniority: 'Mid-Senior',
    salaryRange: { min: 150000, max: 185000, currency: 'USD' },
    remote: true,
  },
  {
    title: 'Frontend Engineer (React)',
    company: 'Nimbus Cloud',
    location: 'Seattle, WA, USA',
    description: 'Design and implement UI components for our cloud console. Strong CSS/Tailwind background is a plus.',
    employmentType: 'Full-time',
    seniority: 'Mid',
    salaryRange: { min: 120000, max: 140000, currency: 'USD' },
    remote: false,
  },
  {
    title: 'Product Designer',
    company: 'GreenLeaf Health',
    location: 'Austin, TX, USA',
    description: 'Design user flows and high-fidelity prototypes for healthcare applications. Experience in Figma required.',
    employmentType: 'Full-time',
    seniority: 'Mid',
    salaryRange: { min: 90000, max: 120000, currency: 'USD' },
    remote: true,
  },
  {
    title: 'Cloud Solutions Architect',
    company: 'Nimbus Cloud',
    location: 'Remote',
    description: 'Architect large-scale distributed systems and lead migrations to Nimbus Cloud.',
    employmentType: 'Contract',
    seniority: 'Senior',
    salaryRange: { min: 90000, max: 160000, currency: 'USD' },
    remote: true,
  },
  {
    title: 'Robotics Software Engineer',
    company: 'Atlas Robotics',
    location: 'Boston, MA, USA',
    description: 'Develop perception and control software for warehouse robotics. C++ and ROS experience required.',
    employmentType: 'Full-time',
    seniority: 'Mid-Senior',
    salaryRange: { min: 130000, max: 160000, currency: 'USD' },
    remote: false,
  },
  {
    title: 'Quantitative Researcher',
    company: 'FinEdge Capital',
    location: 'New York, NY, USA',
    description: 'Research and implement quantitative strategies for systematic trading.',
    employmentType: 'Full-time',
    seniority: 'Senior',
    salaryRange: { min: 180000, max: 260000, currency: 'USD' },
    remote: false,
  },
  {
    title: 'Senior Backend Engineer (Python)',
    company: 'Mira Health',
    location: 'Remote',
    description: 'Build backend services for telehealth platforms. Experience with Django or FastAPI preferred.',
    employmentType: 'Full-time',
    seniority: 'Senior',
    salaryRange: { min: 140000, max: 170000, currency: 'USD' },
    remote: true,
  },
  {
    title: 'Logistics Operations Analyst',
    company: 'Open Harbor',
    location: 'Remote',
    description: 'Analyze shipping patterns and optimize last-mile operations with data-driven insights.',
    employmentType: 'Full-time',
    seniority: 'Mid',
    salaryRange: { min: 70000, max: 95000, currency: 'USD' },
    remote: true,
  }
];

async function run() {
  try {
    await connectDB();
    console.log('Connected to DB. Seeding companies and jobs...');

    // create companies
    const createdCompanies = [];
    for (const c of sampleCompanies) {
      let existing = await Company.findOne({ name: c.name });
      if (!existing) {
        existing = await Company.create(c);
        console.log('Created company', existing.name);
      } else {
        console.log('Company exists', existing.name);
      }
      createdCompanies.push(existing);
    }

    // pick a demo user to act as poster if exists
    const demoUser = await User.findOne() || null;

    for (const sj of sampleJobs) {
      // attach to company if exists
      const comp = createdCompanies.find((c) => c.name === sj.company);
      const jobData = {
        title: sj.title,
        company: sj.company,
        location: sj.location,
        description: sj.description,
        employmentType: sj.employmentType,
        seniority: sj.seniority,
        postedBy: demoUser ? demoUser._id : undefined,
        isActive: true,
      };

      const existingJob = await Job.findOne({ title: sj.title, company: sj.company });
      if (!existingJob) {
        const job = await Job.create(jobData);
        console.log('Created job', job.title);
      } else {
        console.log('Job exists', existingJob.title);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

run();
