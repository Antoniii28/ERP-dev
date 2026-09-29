import { Schema, model } from 'mongoose';
const schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  quantity: { type: Number, default: 0, min: 0 },
}, { timestamps: true });
schema.index({ branchId: 1, productId: 1 }, { unique: true });
export const InventoryModel = model('Inventory', schema);
