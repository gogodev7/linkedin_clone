import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    website: { type: String },
    logoUrl: { type: String },
    location: { type: String },
    size: { type: String },
    industry: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

const Company = mongoose.model('Company', CompanySchema);
export default Company;
