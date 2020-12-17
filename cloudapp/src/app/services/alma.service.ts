import { Injectable } from '@angular/core';
import { SetMembers, Sets } from '../models/set';
import { forkJoin, iif, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CloudAppRestService, Request } from '@exlibris/exl-cloudapp-angular-lib';
import { Item } from '../models/item';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AlmaService {

  constructor( 
    private restService: CloudAppRestService,
  ) {  }

  searchSets(name: string = null, type: string = 'ITEM') {
    let params = { 'content_type': type }
    if (name) params['q'] = `name~${name}`;
    return this.restService.call( {
      url: '/conf/sets',
      queryParams: params
    }).pipe(map( results => results as Sets))
  }

  getBarcode(barcode:string) {
    return this.restService.call(`/items?item_barcode=${barcode}`);
  }

  getItem(link: string) {
    return this.restService.call<Item>({
      url: link,
      queryParams: { view: 'label'}
    });
  }

  getItemsFromSet(setId: string) {
    return this.getAll<SetMembers>(`/conf/sets/${setId}/members`, { max: 100 })
  }

  /** Use Alma default parameters to retrieve all items in pages */
  getAll<T=any>( request: string | Request, 
    options: { arrayName?: string; chunkSize?: number, max?: number } = {}) {
    
    const defaults = { arrayName: null, chunkSize: 50, max: 1000 };
    let { arrayName, chunkSize, max } = Object.assign(defaults, options);
    let array: Array<any>, count: number;
    let req: Request = typeof request == 'string' ? { url: request } : request;
    if (!req.queryParams) req.queryParams = {};
    req.queryParams['limit'] = chunkSize;
    return this.restService.call(req).pipe(
      tap(results => {
        arrayName = arrayName || findArrayName(results);
        array = results[arrayName];
        count = results.total_record_count || 0;
      }),
      switchMap(results => iif(
        ()=>!(arrayName && Array.isArray(results[arrayName]) && count > results[arrayName].length),
        of(results as T),
        forkJoin(
          arrayOf(Math.ceil(Math.min(count, max)/chunkSize)-1)
          .map(i=>{
            const newReq = cloneDeep(req);
            newReq.queryParams.offset = (i+1)*chunkSize;
            return this.restService.call(newReq);
          })
        )
        .pipe(
          map(results=>{
            for (const result of results) {
              array = array.concat(result[arrayName]);
            }
            return Object.assign(results[0], Object.assign(results[0], {[arrayName]: array})) as T;
          })
        )
      ))
    )
  }
}

const arrayOf = (length: number) => Array.from({length: length}, (v, i) => i);
const findArray = (obj: Object) => obj[findArrayName(obj)] || [];
const findArrayName = (obj: Object) => Object.keys(obj).find(k=>Array.isArray(obj[k]));