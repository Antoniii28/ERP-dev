import { Schema, model } from 'mongoose';
const schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  name: { type: String, required: true, trim: true },
  taxId: { type: String, default: '', trim: true, uppercase: true },
  email: { type: String, default: '', trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  address: { type: String, default: '', trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
schema.index({ companyId: 1, name: 1 });
export const CustomerModel = model('Customer', schema);
