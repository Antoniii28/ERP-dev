import type { NextFunction, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import type { AuthRequest } from '../middlewares/auth.js';
import { ValidationError } from '../middlewares/errorHandler.js';
import { BranchModel } from '../models/Branch.js';
import { CompanyModel } from '../models/Company.js';
import { CustomerModel } from '../models/Customer.js';
import { InventoryModel } from '../models/Inventory.js';
import { ProductModel } from '../models/Product.js';
import { SupplierModel } from '../models/Supplier.js';

const ensureCompany = async (companyId: string) => {
  if (!isValidObjectId(companyId) || !(await CompanyModel.exists({ _id: companyId, isActive: true }))) throw new ValidationError('Empresa no válida o inactiva');
};
const wrap = (fn: (req: AuthRequest, res: Response) => Promise<void>) => async (req: AuthRequest, res: Response, next: NextFunction) => { try { await fn(req, res); } catch (e) { next(e); } };

export const listCustomers = wrap(async (req, res) => { const filter = req.query.companyId ? { companyId: String(req.query.companyId) } : {}; res.json({ success:true,data:await CustomerModel.find(filter).populate('companyId','name').sort({name:1}).lean(),message:'Clientes obtenidos' }); });
export const createCustomer = wrap(async (req, res) => { await ensureCompany(req.body.companyId); const item=await CustomerModel.create(req.body); res.status(201).json({success:true,data:item,message:'Cliente creado'}); });
export const updateCustomer = wrap(async (req,res)=>{ const item=await CustomerModel.findByIdAndUpdate(String(req.params.id),req.body,{new:true,runValidators:true}).lean(); if(!item) throw new ValidationError('Cliente no encontrado'); res.json({success:true,data:item,message:'Cliente actualizado'}); });

export const listSuppliers = wrap(async (req, res) => { const filter = req.query.companyId ? { companyId: String(req.query.companyId) } : {}; res.json({ success:true,data:await SupplierModel.find(filter).populate('companyId','name').sort({name:1}).lean(),message:'Proveedores obtenidos' }); });
export const createSupplier = wrap(async (req, res) => { await ensureCompany(req.body.companyId); const item=await SupplierModel.create(req.body); res.status(201).json({success:true,data:item,message:'Proveedor creado'}); });
export const updateSupplier = wrap(async (req,res)=>{ const item=await SupplierModel.findByIdAndUpdate(String(req.params.id),req.body,{new:true,runValidators:true}).lean(); if(!item) throw new ValidationError('Proveedor no encontrado'); res.json({success:true,data:item,message:'Proveedor actualizado'}); });

export const listProducts = wrap(async (req, res) => { const filter = req.query.companyId ? { companyId: String(req.query.companyId) } : {}; res.json({ success:true,data:await ProductModel.find(filter).populate('companyId','name').sort({name:1}).lean(),message:'Productos obtenidos' }); });
export const createProduct = wrap(async (req, res) => { await ensureCompany(req.body.companyId); const item=await ProductModel.create(req.body); res.status(201).json({success:true,data:item,message:'Producto creado'}); });
export const updateProduct = wrap(async (req,res)=>{ const item=await ProductModel.findByIdAndUpdate(String(req.params.id),req.body,{new:true,runValidators:true}).lean(); if(!item) throw new ValidationError('Producto no encontrado'); res.json({success:true,data:item,message:'Producto actualizado'}); });

export const listInventory = wrap(async (req,res)=>{ const filter=req.query.companyId?{companyId:String(req.query.companyId)}:{}; const data=await InventoryModel.find(filter).populate('companyId','name').populate('branchId','name code').populate('productId','name sku minStock').sort({updatedAt:-1}).lean(); res.json({success:true,data,message:'Inventario obtenido'}); });
export const setInventory = wrap(async (req,res)=>{ const {companyId,branchId,productId,quantity}=req.body; await ensureCompany(companyId); if(!isValidObjectId(branchId)||!(await BranchModel.exists({_id:branchId,companyId,isActive:true}))) throw new ValidationError('Sucursal no válida'); if(!isValidObjectId(productId)||!(await ProductModel.exists({_id:productId,companyId,isActive:true}))) throw new ValidationError('Producto no válido'); const item=await InventoryModel.findOneAndUpdate({branchId,productId},{companyId,branchId,productId,quantity},{new:true,upsert:true,runValidators:true}).lean(); res.json({success:true,data:item,message:'Existencia actualizada'}); });
