import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

let replset: MongoMemoryReplSet;
let app: import('express').Express;
let CompanyModel: any, BranchModel: any, SupplierModel: any, ProductModel: any, InventoryModel: any;
let SaleModel: any, PurchaseModel: any, FinanceEntryModel: any, AuditLogModel: any, UserModel: any, RoleModel: any;
let createToken: (sub:string,type:'access'|'refresh')=>string;
let hashPassword: (password:string)=>string;

const ids = (x:any) => String(x._id);
const allPermissions = [
  'sales.read','sales.create','purchases.read','purchases.create','finance.read','finance.create',
  'inventory.read','inventory.update','reports.read','products.read','suppliers.read'
];

beforeAll(async () => {
  replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = replset.getUri();
  process.env.JWT_SECRET = 'qa-access-secret-12345678901234567890';
  process.env.JWT_REFRESH_SECRET = 'qa-refresh-secret-12345678901234567890';
  process.env.CORS_ORIGINS = 'http://localhost:5173';

  ({ app } = await import('../../apps/api/src/app.js'));
  ({ CompanyModel } = await import('../../apps/api/src/models/Company.js'));
  ({ BranchModel } = await import('../../apps/api/src/models/Branch.js'));
  ({ SupplierModel } = await import('../../apps/api/src/models/Supplier.js'));
  ({ ProductModel } = await import('../../apps/api/src/models/Product.js'));
  ({ InventoryModel } = await import('../../apps/api/src/models/Inventory.js'));
  ({ SaleModel } = await import('../../apps/api/src/models/Sale.js'));
  ({ PurchaseModel } = await import('../../apps/api/src/models/Purchase.js'));
  ({ FinanceEntryModel } = await import('../../apps/api/src/models/FinanceEntry.js'));
  ({ AuditLogModel } = await import('../../apps/api/src/models/AuditLog.js'));
  ({ UserModel } = await import('../../apps/api/src/models/User.js'));
  ({ RoleModel } = await import('../../apps/api/src/models/Role.js'));
  ({ createToken, hashPassword } = await import('../../apps/api/src/utils/security.js'));

  await mongoose.connect(process.env.MONGODB_URI);
}, 60_000);

afterEach(async () => {
  vi.restoreAllMocks();
  if (mongoose.connection.db) await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await replset.stop();
});

async function tenant(name='A', permissions=allPermissions) {
  const company = await CompanyModel.create({ name: `Company ${name}` });
  const branch = await BranchModel.create({ companyId: company._id, name: `Branch ${name}`, code: `B-${name}` });
  const role = await RoleModel.create({ name: `Role ${name}`, companyId: company._id, permissions });
  const user = await UserModel.create({
    username: `user-${name}`, email: `user-${name}@qa.local`, passwordHash: hashPassword('TestPassword123'),
    companyId: company._id, roleIds: [role._id],
  });
  return { company, branch, role, user, token: createToken(ids(user), 'access') };
}

async function product(companyId:any, suffix='1', price=100) {
  return ProductModel.create({ companyId, sku:`SKU-${suffix}`, name:`Product ${suffix}`, cost:50, price, minStock:1 });
}

const auth = (token:string) => ({ Authorization: `Bearer ${token}` });

describe('QA-1 commercial core integration', () => {
  it('1. registers a valid purchase and atomically creates stock, expense and audit', async () => {
    const a=await tenant(); const p=await product(a.company._id); const s=await SupplierModel.create({companyId:a.company._id,name:'Supplier A'});
    const r=await request(app).post('/api/v1/purchases').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),supplierId:ids(s),productId:ids(p),quantity:4,unitCost:25});
    expect(r.status).toBe(201); expect(r.body.data.total).toBe(100);
    expect((await InventoryModel.findOne({companyId:a.company._id,branchId:a.branch._id,productId:p._id}))?.quantity).toBe(4);
    const f=await FinanceEntryModel.findOne({sourceType:'purchase',sourceId:r.body.data._id});
    expect(f).toMatchObject({type:'expense',amount:100});
    expect(await AuditLogModel.exists({action:'purchase.create',entityId:r.body.data._id})).toBeTruthy();
  });

  it('2. rejects purchase with invalid product without side effects', async () => {
    const a=await tenant(); const fake=new mongoose.Types.ObjectId();
    const r=await request(app).post('/api/v1/purchases').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:String(fake),quantity:2,unitCost:10});
    expect(r.status).toBe(400);
    expect(await PurchaseModel.countDocuments()).toBe(0); expect(await InventoryModel.countDocuments()).toBe(0); expect(await FinanceEntryModel.countDocuments()).toBe(0);
  });

  it('3. rejects a supplier from another company', async () => {
    const a=await tenant('A'); const b=await tenant('B'); const p=await product(a.company._id);
    const foreign=await SupplierModel.create({companyId:b.company._id,name:'Foreign Supplier'});
    const r=await request(app).post('/api/v1/purchases').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),supplierId:ids(foreign),productId:ids(p),quantity:1,unitCost:10});
    expect(r.status).toBe(400); expect(await PurchaseModel.countDocuments()).toBe(0);
  });

  it('4. rejects a branch from another company', async () => {
    const a=await tenant('A'); const b=await tenant('B'); const p=await product(a.company._id);
    const r=await request(app).post('/api/v1/purchases').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(b.branch),productId:ids(p),quantity:1,unitCost:10});
    expect(r.status).toBe(400); expect(await PurchaseModel.countDocuments()).toBe(0);
  });

  it('5. registers a valid sale and atomically decreases stock and creates income', async () => {
    const a=await tenant(); const p=await product(a.company._id,'sale',120);
    await InventoryModel.create({companyId:a.company._id,branchId:a.branch._id,productId:p._id,quantity:5});
    const r=await request(app).post('/api/v1/sales').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:2});
    expect(r.status).toBe(201); expect(r.body.data.total).toBe(240);
    expect((await InventoryModel.findOne({productId:p._id,branchId:a.branch._id}))?.quantity).toBe(3);
    expect(await FinanceEntryModel.exists({sourceType:'sale',sourceId:r.body.data._id,type:'income',amount:240})).toBeTruthy();
  });

  it('6. rejects a sale with insufficient stock without side effects', async () => {
    const a=await tenant(); const p=await product(a.company._id);
    await InventoryModel.create({companyId:a.company._id,branchId:a.branch._id,productId:p._id,quantity:1});
    const r=await request(app).post('/api/v1/sales').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:2});
    expect(r.status).toBe(400); expect((await InventoryModel.findOne({productId:p._id}))?.quantity).toBe(1);
    expect(await SaleModel.countDocuments()).toBe(0); expect(await FinanceEntryModel.countDocuments()).toBe(0);
  });

  it('7. prevents overselling under concurrent sale requests', async () => {
    const a=await tenant(); const p=await product(a.company._id,'concurrent');
    await InventoryModel.create({companyId:a.company._id,branchId:a.branch._id,productId:p._id,quantity:5});
    const body={companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:4};
    const rs=await Promise.all([request(app).post('/api/v1/sales').set(auth(a.token)).send(body),request(app).post('/api/v1/sales').set(auth(a.token)).send(body)]);
    expect(rs.map(x=>x.status).sort()).toEqual([201,400]);
    expect((await InventoryModel.findOne({productId:p._id}))?.quantity).toBe(1);
    expect(await SaleModel.countDocuments()).toBe(1); expect(await FinanceEntryModel.countDocuments({sourceType:'sale'})).toBe(1);
  });

  it('8. rolls back sale inventory and sale document when finance creation fails', async () => {
    const a=await tenant(); const p=await product(a.company._id,'rollback-sale');
    await InventoryModel.create({companyId:a.company._id,branchId:a.branch._id,productId:p._id,quantity:5});
    vi.spyOn(FinanceEntryModel,'create').mockRejectedValueOnce(new Error('QA injected finance failure'));
    const r=await request(app).post('/api/v1/sales').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:2});
    expect(r.status).toBe(500); expect((await InventoryModel.findOne({productId:p._id}))?.quantity).toBe(5); expect(await SaleModel.countDocuments()).toBe(0);
  });

  it('9. rolls back purchase and inventory when finance creation fails', async () => {
    const a=await tenant(); const p=await product(a.company._id,'rollback-purchase');
    vi.spyOn(FinanceEntryModel,'create').mockRejectedValueOnce(new Error('QA injected finance failure'));
    const r=await request(app).post('/api/v1/purchases').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:3,unitCost:10});
    expect(r.status).toBe(500); expect(await PurchaseModel.countDocuments()).toBe(0); expect(await InventoryModel.countDocuments()).toBe(0);
  });

  it('10. keeps finance entries linked to their originating sale and purchase', async () => {
    const a=await tenant(); const p=await product(a.company._id,'finance',80);
    const buy=await request(app).post('/api/v1/purchases').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:5,unitCost:30});
    const sell=await request(app).post('/api/v1/sales').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:2});
    expect(buy.status).toBe(201); expect(sell.status).toBe(201);
    const entries=await FinanceEntryModel.find().lean(); expect(entries).toHaveLength(2);
    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({type:'expense',sourceType:'purchase',amount:150}),
      expect.objectContaining({type:'income',sourceType:'sale',amount:160}),
    ]));
  });

  it('11-13. isolates sales, purchases and inventory by company', async () => {
    const a=await tenant('A'); const b=await tenant('B'); const pa=await product(a.company._id,'A'); const pb=await product(b.company._id,'B');
    await InventoryModel.create([{companyId:a.company._id,branchId:a.branch._id,productId:pa._id,quantity:5},{companyId:b.company._id,branchId:b.branch._id,productId:pb._id,quantity:9}]);
    await SaleModel.create({companyId:b.company._id,branchId:b.branch._id,items:[{productId:pb._id,quantity:1,unitPrice:100,subtotal:100}],total:100});
    await PurchaseModel.create({companyId:b.company._id,branchId:b.branch._id,items:[{productId:pb._id,quantity:1,unitCost:50,subtotal:50}],total:50});
    const [sales,purchases,inventory]=await Promise.all([
      request(app).get('/api/v1/sales').set(auth(a.token)),
      request(app).get('/api/v1/purchases').set(auth(a.token)),
      request(app).get('/api/v1/inventory').set(auth(a.token)),
    ]);
    expect(sales.status).toBe(200); expect(sales.body.data).toHaveLength(0);
    expect(purchases.status).toBe(200); expect(purchases.body.data).toHaveLength(0);
    expect(inventory.status).toBe(200); expect(inventory.body.data).toHaveLength(1); expect(inventory.body.data[0].companyId._id).toBe(ids(a.company));
  });

  it('14. enforces commercial and inventory RBAC', async () => {
    const a=await tenant('limited',['sales.read']); const p=await product(a.company._id,'rbac');
    for (const call of [
      request(app).post('/api/v1/sales').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:1}),
      request(app).post('/api/v1/purchases').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:1,unitCost:1}),
      request(app).put('/api/v1/inventory').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:3}),
    ]) expect((await call).status).toBe(403);
  });

  it('15. preserves current absolute inventory adjustment behavior and audits it', async () => {
    const a=await tenant(); const p=await product(a.company._id,'adjust');
    const r=await request(app).put('/api/v1/inventory').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:7});
    expect(r.status).toBe(200); expect(r.body.data.quantity).toBe(7);
    expect(await AuditLogModel.exists({action:'inventory.set',entityId:r.body.data._id})).toBeTruthy();
  });

  it('18. protects PDF report export with reports.read', async () => {
    const a=await tenant('pdf-rbac',['sales.read']);
    const r=await request(app).get('/api/v1/reports/summary/pdf').set(auth(a.token));
    expect(r.status).toBe(403);
  });

  it('19-20. exports a valid tenant-scoped executive PDF', async () => {
    const a=await tenant('pdf-A'); const b=await tenant('pdf-B');
    await SaleModel.create({companyId:a.company._id,branchId:a.branch._id,items:[],total:123,status:'completed'});
    await PurchaseModel.create({companyId:a.company._id,branchId:a.branch._id,items:[],total:45,status:'completed'});
    await FinanceEntryModel.create({companyId:a.company._id,branchId:a.branch._id,type:'income',category:'qa',description:'A income',amount:123,sourceType:'manual'});
    await FinanceEntryModel.create({companyId:a.company._id,branchId:a.branch._id,type:'expense',category:'qa',description:'A expense',amount:45,sourceType:'manual'});
    await SaleModel.create({companyId:b.company._id,branchId:b.branch._id,items:[],total:999,status:'completed'});
    await FinanceEntryModel.create({companyId:b.company._id,branchId:b.branch._id,type:'income',category:'qa',description:'B income',amount:999,sourceType:'manual'});
    const r=await request(app).get('/api/v1/reports/summary/pdf').set(auth(a.token)).buffer(true).parse((res,cb)=>{const chunks:Buffer[]=[];res.on('data',(chunk:Buffer)=>chunks.push(chunk));res.on('end',()=>cb(null,Buffer.concat(chunks)))});
    expect(r.status).toBe(200);
    expect(r.headers['content-type']).toContain('application/pdf');
    expect(r.headers['content-disposition']).toContain('attachment');
    expect(r.headers['content-disposition']).toContain('jafora-reporte-ejecutivo.pdf');
    expect(Buffer.isBuffer(r.body)).toBe(true);
    const pdf=(r.body as Buffer).toString('latin1');
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain('JAFORA ERP');
    expect(pdf).toContain('Reporte Ejecutivo');
    expect(pdf).toContain('Ventas totales: $ 123.00');
    expect(pdf).toContain('Compras totales: $ 45.00');
    expect(pdf).toContain('Ingresos: $ 123.00');
    expect(pdf).toContain('Egresos: $ 45.00');
    expect(pdf).toContain('Balance: $ 78.00');
    expect(pdf).not.toContain('999.00');
  });

  it('16-17. dashboard and reports reflect completed purchase and sale', async () => {
    const a=await tenant(); const p=await product(a.company._id,'report',100);
    await request(app).post('/api/v1/purchases').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:5,unitCost:40});
    await request(app).post('/api/v1/sales').set(auth(a.token)).send({companyId:ids(a.company),branchId:ids(a.branch),productId:ids(p),quantity:2});
    const dashboard=await request(app).get('/api/v1/dashboard/summary').set(auth(a.token));
    expect(dashboard.status).toBe(200); expect(dashboard.body.data.kpis).toMatchObject({sales:1,purchases:1,income:200,expense:200,balance:0,inventoryUnits:3});
    const report=await request(app).get('/api/v1/reports/summary').set(auth(a.token));
    expect(report.status).toBe(200); expect(report.body.data.summary).toMatchObject({salesTotal:200,purchaseTotal:200,income:200,expense:200,balance:0});
    expect(report.body.data.sales).toHaveLength(1); expect(report.body.data.purchases).toHaveLength(1);
  });
});
