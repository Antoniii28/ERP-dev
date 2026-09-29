import { Schema, model } from 'mongoose';

const companySchema = new Schema({
  name: { type: String, required: true, trim: true },
  legalName: { type: String, default: '', trim: true },
  taxId: { type: String, default: '', trim: true, uppercase: true },
  email: { type: String, default: '', trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

companySchema.index({ name: 1 });

export const CompanyModel = model('Company', companySchema);
