import { Schema, model } from 'mongoose';

const branchSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  address: { type: String, default: '', trim: true },
  phone: { type: String, default: '', trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

branchSchema.index({ companyId: 1, code: 1 }, { unique: true });

export const BranchModel = model('Branch', branchSchema);
