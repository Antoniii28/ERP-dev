import { isValidObjectId } from 'mongoose';

import { BranchModel } from '../models/Branch.js';
import { CompanyModel } from '../models/Company.js';
import { ValidationError } from '../middlewares/errorHandler.js';

export const listBranches = (companyId?: string) => {
  const filter: Record<string, unknown> = {};
  if (companyId) {
    if (!isValidObjectId(companyId)) throw new ValidationError('Empresa no válida');
    filter.companyId = companyId;
  }
  return BranchModel.find(filter).populate('companyId', 'name').sort({ name: 1 }).lean();
};

export const createBranch = async (data: {
  companyId: string; name: string; code: string; address?: string; phone?: string;
}) => {
  if (!isValidObjectId(data.companyId) || !(await CompanyModel.exists({ _id: data.companyId, isActive: true }))) {
    throw new ValidationError('La empresa no existe o está inactiva');
  }
  if (await BranchModel.exists({ companyId: data.companyId, code: data.code.toUpperCase() })) {
    throw new ValidationError('El código de sucursal ya existe en esta empresa');
  }
  return BranchModel.create(data);
};

export const updateBranch = async (id: string, data: Record<string, unknown>, companyScope?: string) => {
  if (!isValidObjectId(id)) throw new ValidationError('Sucursal no válida');
  if (data.companyId !== undefined) {
    const companyId = String(data.companyId);
    if (!isValidObjectId(companyId) || !(await CompanyModel.exists({ _id: companyId, isActive: true }))) {
      throw new ValidationError('La empresa no existe o está inactiva');
    }
  }
  const branch = await BranchModel.findOneAndUpdate({ _id: id, ...(companyScope ? { companyId: companyScope } : {}) }, data, { new: true, runValidators: true }).populate('companyId', 'name').lean();
  if (!branch) throw new ValidationError('La sucursal no existe');
  return branch;
};
