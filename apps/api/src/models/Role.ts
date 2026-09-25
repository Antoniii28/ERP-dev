import { Schema, model } from 'mongoose';

const roleSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  permissions: { type: [String], default: [] },
  companyId: { type: Schema.Types.ObjectId, default: null, index: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

roleSchema.index({ name: 1, companyId: 1 }, { unique: true });

export const RoleModel = model('Role', roleSchema);
