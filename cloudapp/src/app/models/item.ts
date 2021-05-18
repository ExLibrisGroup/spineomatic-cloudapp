export interface Item {
  item_data: {
    call_no: string[];
    barcode: string;
    pid: string;
    library: {
      value: string;
    };
    location: {
      value: string;
    }
  },
  link: string,
}

export const LABEL_FIELDS = [
  'item_data.barcode',
  'item_data.call_no',
  'item_data.alt_call_no',
  'item_data.issue_level_description',
  'item_data.edition',
  'item_data.imprint',
  'item_data.language',
  'prefix',
]