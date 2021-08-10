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
    const matches = val.match(/^[\w\s]*\/[\w\s]*\b/g);
    return (matches && matches[0]) || val;
  }
}