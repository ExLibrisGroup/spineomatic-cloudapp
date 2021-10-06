export interface Checksums {
  [key: string]: (val: string) => string
}

export const checksums: Checksums = {
  'modulo_43': val => {
    /* https://www.activebarcode.com/codes/checkdigit/modulo43.html */
    val = val.toUpperCase();
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%";
    let sum = 0;
    for (let i = 0; i < val.length; i++) {
      sum += chars.indexOf(val.charAt(i));
    }
    return chars.charAt((sum % 43));  
  },
}