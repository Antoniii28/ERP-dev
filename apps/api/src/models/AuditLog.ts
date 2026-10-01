import { Schema, model } from 'mongoose';
const schema=new Schema({actorId:{type:Schema.Types.ObjectId,ref:'User',required:true,index:true},companyId:{type:Schema.Types.ObjectId,ref:'Company',default:null,index:true},action:{type:String,required:true,index:true},entityType:{type:String,required:true},entityId:{type:Schema.Types.ObjectId,default:null},metadata:{type:Schema.Types.Mixed,default:{}}},{timestamps:true});
export const AuditLogModel=model('AuditLog',schema);
