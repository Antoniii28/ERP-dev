import { Schema, model } from 'mongoose';
const itemSchema=new Schema({productId:{type:Schema.Types.ObjectId,ref:'Product',required:true},quantity:{type:Number,required:true,min:1},unitCost:{type:Number,required:true,min:0},subtotal:{type:Number,required:true,min:0}},{_id:false});
const schema=new Schema({companyId:{type:Schema.Types.ObjectId,ref:'Company',required:true,index:true},branchId:{type:Schema.Types.ObjectId,ref:'Branch',required:true},supplierId:{type:Schema.Types.ObjectId,ref:'Supplier',default:null},items:{type:[itemSchema],required:true},total:{type:Number,required:true,min:0},status:{type:String,enum:['completed','cancelled'],default:'completed'}},{timestamps:true});
export const PurchaseModel=model('Purchase',schema);
