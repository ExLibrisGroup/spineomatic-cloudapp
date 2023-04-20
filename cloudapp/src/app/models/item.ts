import { MarcRecord } from "./marc";

export interface Item {
  item_data: {
    call_no: string[];
    alternative_call_number: string;
    barcode: string;
    pid: string;
    library: {
      value: string;
    };
    location: {
      value: string;
    }
  },
  holding_data: {
    link: string;
  },
  holding_record?: MarcRecord,
  link: string,
}

export interface Holding {
  holding_id: string;
  anies: string[];
}

export const LABEL_FIELDS = [
  'item_data.barcode',
  'item_data.call_no',
  'item_data.alt_call_no',
  'item_data.description',
  'item_data.edition',
  'item_data.imprint',
  'item_data.language',
  'prefix',
  'raw_barcode',
  'raw_call_no',
  'item_data.call_no_1',
  'item_data.call_no_2',
  'item_data.call_no_3',
  'item_data.call_no_4',
  'item_data.call_no_5',
  'item_data.call_no_6',
  'item_data.call_no_7',
  'item_data.call_no_8',
  'item_data.call_no_9',
  'item_data.call_no_10'
]