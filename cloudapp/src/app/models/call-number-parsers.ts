export interface CallNumberParsers {
  [key: string]: (val: string | Array<string>) => string | Array<string>
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
    
  }
}