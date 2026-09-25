import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  passwordHash: { type: String, required: true, select: false },
  refreshTokenHash: { type: String, default: null, select: false },
  companyId: { type: Schema.Types.ObjectId, default: null, index: true },
  roleIds: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const UserModel = model('User', userSchema);
