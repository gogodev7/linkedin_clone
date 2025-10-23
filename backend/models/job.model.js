import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String },
    location: { type: String },
    description: { type: String },
    employmentType: { type: String }, // full-time, part-time, contract, internship
    seniority: { type: String },
    applyUrl: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // applicants as subdocuments with metadata (resume, cover letter)
    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        resumeUrl: { type: String },
        coverLetter: { type: String },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    // salary range and remote flag
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' },
    },
    remote: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// text index for search across title, description, company
JobSchema.index({ title: 'text', description: 'text', company: 'text' });

const Job = mongoose.model('Job', JobSchema);
export default Job;
