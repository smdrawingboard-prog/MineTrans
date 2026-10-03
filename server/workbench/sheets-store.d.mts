import type {Storage} from './storage.mjs';
export function createSheetsStore():Promise<Storage>;
export const TAB:string;
export const HEADERS:string[];
export class SheetsStore implements Storage {
 constructor(client:unknown,spreadsheetId:string,key:Buffer);
 owner:Storage['owner'];access:Storage['access'];setAccess:Storage['setAccess'];list:Storage['list'];save:Storage['save'];versions:Storage['versions'];version:Storage['version'];evidence:Storage['evidence'];evidenceBatch:Storage['evidenceBatch'];addDocument:Storage['addDocument'];document:Storage['document'];
}
