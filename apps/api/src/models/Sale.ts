import { Schema, model } from 'mongoose';
const itemSchema=new Schema({productId:{type:Schema.Types.ObjectId,ref:'Product',required:true},quantity:{type:Number,required:true,min:1},unitPrice:{type:Number,required:true,min:0},subtotal:{type:Number,required:true,min:0}},{_id:false});
const schema=new Schema({companyId:{type:Schema.Types.ObjectId,ref:'Company',required:true,index:true},branchId:{type:Schema.Types.ObjectId,ref:'Branch',required:true},customerId:{type:Schema.Types.ObjectId,ref:'Customer',default:null},items:{type:[itemSchema],required:true},total:{type:Number,required:true,min:0},status:{type:String,enum:['completed','cancelled'],default:'completed'}},{timestamps:true});
export const SaleModel=model('Sale',schema);
