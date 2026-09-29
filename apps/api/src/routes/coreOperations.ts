import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { ValidationError } from '../middlewares/errorHandler.js';
import * as c from '../controllers/coreOperationsController.js';

export const coreOperationsRouter = Router();
const validate=(schema:z.ZodType)=>(req:import('express').Request,_res:import('express').Response,next:import('express').NextFunction)=>{const r=schema.safeParse(req.body);if(!r.success)return next(new ValidationError(r.error.issues[0]?.message??'Datos inválidos'));req.body=r.data;next();};
const party=z.object({companyId:z.string().min(1),name:z.string().min(2).max(160),taxId:z.string().max(30).optional(),email:z.union([z.email(),z.literal('')]).optional(),phone:z.string().max(30).optional(),address:z.string().max(240).optional()});
const product=z.object({companyId:z.string().min(1),sku:z.string().min(1).max(50),name:z.string().min(2).max(160),description:z.string().max(500).optional(),category:z.string().max(80).optional(),cost:z.coerce.number().min(0).default(0),price:z.coerce.number().min(0).default(0),minStock:z.coerce.number().min(0).default(0)});
const stock=z.object({companyId:z.string().min(1),branchId:z.string().min(1),productId:z.string().min(1),quantity:z.coerce.number().min(0)});

coreOperationsRouter.get('/customers',authenticate,requirePermission('customers.read'),c.listCustomers);
coreOperationsRouter.post('/customers',authenticate,requirePermission('customers.create'),validate(party),c.createCustomer);
coreOperationsRouter.patch('/customers/:id',authenticate,requirePermission('customers.update'),validate(party.partial()),c.updateCustomer);
coreOperationsRouter.get('/suppliers',authenticate,requirePermission('suppliers.read'),c.listSuppliers);
coreOperationsRouter.post('/suppliers',authenticate,requirePermission('suppliers.create'),validate(party),c.createSupplier);
coreOperationsRouter.patch('/suppliers/:id',authenticate,requirePermission('suppliers.update'),validate(party.partial()),c.updateSupplier);
coreOperationsRouter.get('/products',authenticate,requirePermission('products.read'),c.listProducts);
coreOperationsRouter.post('/products',authenticate,requirePermission('products.create'),validate(product),c.createProduct);
coreOperationsRouter.patch('/products/:id',authenticate,requirePermission('products.update'),validate(product.partial()),c.updateProduct);
coreOperationsRouter.get('/inventory',authenticate,requirePermission('inventory.read'),c.listInventory);
coreOperationsRouter.put('/inventory',authenticate,requirePermission('inventory.update'),validate(stock),c.setInventory);
