import { isValidObjectId } from 'mongoose';

import { CompanyModel } from '../models/Company.js';
import { ValidationError } from '../middlewares/errorHandler.js';

export const listCompanies = () => CompanyModel.find().sort({ name: 1 }).lean();

export const createCompany = async (data: {
  name: string; legalName?: string; taxId?: string; email?: string; phone?: string;
}) => CompanyModel.create(data);

export const updateCompany = async (id: string, data: Record<string, unknown>) => {
  if (!isValidObjectId(id)) throw new ValidationError('Empresa no válida');
  const company = await CompanyModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!company) throw new ValidationError('La empresa no existe');
  return company;
};
