import { Item } from "./item";

export interface CallNumberParsers {
  [key: string]: (val: string | Array<string>, item: Item) => string | Array<string>
}

export const callNumberParsers: CallNumberParsers = {
  'long_dewey': val => {
    if (Array.isArray(val)) val = val.join(' ');
    let workingString = val;
    let period = workingString.indexOf('.');
    if (period == -1)
      return workingString.split(' ');
    let lead = workingString.substring(0, period);
    let remainder = workingString.substring(period + 1);
    let cutter = remainder.indexOf(' ');
    let longDigits;
    if (cutter == -1)
      longDigits = remainder;
    else
      longDigits = remainder.substring(0, cutter);
    let splitElements = longDigits.match(/.{1,4}/g);
    if (Array.isArray(splitElements)) {
      splitElements.splice(0, 0, lead);
      splitElements[1] = '.' + splitElements[1];
    }
    if (cutter != -1) {
      remainder = remainder.substring(cutter + 1);
      let splitRemainder = remainder.split(' ');
      splitRemainder.forEach ((element) => {
        splitElements.push(element);
        }
      )
    }
    return splitElements;
  },
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