import { Item } from "./item";

export interface CallNumberParsers {
  [key: string]: (val: string | Array<string>, item: Item) => string | Array<string>
}

export const callNumberParsers: CallNumberParsers = {
  'split_by_slash': val => {
    if (Array.isArray(val)) val = val.join(' ');
    return val.split('/');
  },
  'remove_shelving_info': val => {
    if (Array.isArray(val)) val = val.join(' ');
    const matches = val.match(/[0-9A-Za-z\s\/\.\:\(\)\#\=\+\-]+/g);
    return ((matches && matches[0]) || val).split('/');
  },
  'remove_shelving_info_and_colon': val => {
    if (Array.isArray(val)) val = val.join(' ');
    const matches = val.match(/[0-9A-Za-z\s\/\.\:\(\)\#\=\+\-]+/g);
    let strWithColon = (matches && matches[0]) || val;
    if(strWithColon!= null && strWithColon.indexOf(":") != -1){
      const matches_colon = strWithColon.match(/^.*\/.*:/);
      let str = (matches_colon && matches_colon[0]) || strWithColon;
      if(str != null && str.endsWith(":")){
        str = str.substring(0,str.length-1);
      }
      return ((matches_colon && str) || strWithColon).split('/');
    }else{
      return ((matches && matches[0]) || val).split('/');
    }
    
  },
  '852_subfields': (val, item) => {
    const location = item.holding_record?.datafields.find(f => f.tag == '852');
    if (!location) return val;
    return location.subfields.filter(s => ['h', 'i', 'j', 'k', 'l', 'm'].includes(s.code)).map(s => s.value);
  },
  'item_call_number': (val, item) => {
    /* Issue #56 - Use item call number (alternate call number) if exists */
    const item_call_number = item.item_data.alternative_call_number;
    return item_call_number || val;
  }
}