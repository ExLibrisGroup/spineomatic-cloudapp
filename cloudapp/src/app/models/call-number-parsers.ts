export interface CallNumberParsers {
  [key: string]: (val: string | Array<string>) => Array<string>
}

export const callNumberParsers: CallNumberParsers = {
  'split_by_slash': val => {
    if (Array.isArray(val)) val = val.join(' ');
    return val.split('/');
  },
}