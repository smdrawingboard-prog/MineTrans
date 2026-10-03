export interface StoredVersion {version:number;actor:string;status:string;payload:string;created_at:string|Date;engine_version:string}
export interface Save {id:string;owner:string;actor:string;isNew:boolean;expectedVersion:number;status:string;payload:string;engineVersion:string}
export interface EvidenceUpload {id:string;assessment:string;actor:string;payload:string}
export interface Storage {
 owner(id:string,email:string):Promise<string>;
 access(id:string):Promise<Array<{email:string;granted_by:string;created_at:string|Date}>>;
 setAccess(id:string,email:string,actor:string,revoke:boolean):Promise<void>;
 list(email:string):Promise<Array<{id:string;current_version:number;status:string;payload:string;created_at:string|Date}>>;
 save(value:Save):Promise<void>;
 versions(id:string,owner:string):Promise<Array<{version:number;actor:string;status:string;createdAt:string|Date}>>;
 version(id:string,owner:string,v:number):Promise<StoredVersion>;
 evidenceBatch(ids:string[],assessment:string):Promise<Array<{payload:string}|undefined>>;
 evidence(id:string,assessment:string):Promise<{payload:string}|undefined>;
 addDocument(value:EvidenceUpload):Promise<void>;
 document(id:string,email:string):Promise<{payload:string}>;
}
export function storageError(message:string,status?:number):Error & {status:number};
export class MysqlStore implements Storage {
 constructor(pool:import('mysql2/promise').Pool);
 owner:Storage['owner'];access:Storage['access'];setAccess:Storage['setAccess'];list:Storage['list'];save:Storage['save'];versions:Storage['versions'];version:Storage['version'];evidence:Storage['evidence'];evidenceBatch:Storage['evidenceBatch'];addDocument:Storage['addDocument'];document:Storage['document'];
}
