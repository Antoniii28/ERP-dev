import { Schema, model } from 'mongoose';
const schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  sku: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  category: { type: String, default: '', trim: true },
  cost: { type: Number, default: 0, min: 0 },
  price: { type: Number, default: 0, min: 0 },
  minStock: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
schema.index({ companyId: 1, sku: 1 }, { unique: true });
export const ProductModel = model('Product', schema);
