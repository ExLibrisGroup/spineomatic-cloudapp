export interface Item {
  item_data: {
    call_no: string[];
    barcode: string;
    pid: string;
  }
}

export const LABEL_FIELDS = [
  'item_data.barcode',
  'item_data.call_no'
]

/*
[{
  "bib_data": {
    "mms_id": "991023770000541",
    "title": "Marian S. Carson collection of manuscripts,",
    "author": "Carson, Marian S.,",
    "issn": null,
    "isbn": null,
    "complete_edition": "",
    "network_number": ["(TrN)54749-train20072_c2db", "5811630"],
    "link": "/almaws/v1/bibs/991023770000541"
  },
  "holding_data": {
    "holding_id": "2223599860000561",
    "call_number_type": {
      "value": "0",
      "desc": "Library of Congress classification"
    },
    "call_number": "OVSD 7:2-3",
    "accession_number": "",
    "copy_id": "0",
    "in_temp_location": false,
    "temp_library": {
      "value": null,
      "desc": null
    },
    "temp_location": {
      "value": null,
      "desc": null
    },
    "temp_call_number_type": {
      "value": "",
      "desc": null
    },
    "temp_call_number": "",
    "temp_policy": {
      "value": "",
      "desc": null
    },
    "link": "/almaws/v1/bibs/991023770000541/holdings/2223599860000561"
  },
  "item_data": {
    "pid": "234382220000541",
    "barcode": "1234",
    "creation_date": "2011-12-17Z",
    "modification_date": "2019-10-16Z",
    "base_status": {
      "value": "0",
      "desc": "Item not in place"
    },
    "awaiting_reshelving": false,
    "physical_material_type": {
      "value": "MIXED",
      "desc": "Mixed material"
    },
    "policy": {
      "value": "",
      "desc": null
    },
    "provenance": {
      "value": "",
      "desc": null
    },
    "po_line": "",
    "is_magnetic": false,
    "year_of_issue": "",
    "enumeration_a": "a",
    "enumeration_b": "b",
    "enumeration_c": "c",
    "enumeration_d": "",
    "enumeration_e": "",
    "enumeration_f": "",
    "enumeration_g": "",
    "enumeration_h": "",
    "chronology_i": "",
    "chronology_j": "",
    "chronology_k": "",
    "chronology_l": "",
    "chronology_m": "",
    "description": "",
    "receiving_operator": "",
    "process_type": {
      "value": "WORK_ORDER_DEPARTMENT",
      "desc": "In Process"
    },
    "work_order_type": {
      "value": "new_type",
      "desc": "new_type"
    },
    "work_order_at": {
      "value": "Library",
      "desc": "Library"
    },
    "inventory_number": "",
    "inventory_price": "",
    "library": {
      "value": "GFU",
      "desc": "Law Library"
    },
    "location": {
      "value": "LSTACKS",
      "desc": "Law Stacks"
    },
    "alternative_call_number": "",
    "alternative_call_number_type": {
      "value": "",
      "desc": null
    },
    "storage_location_id": "",
    "pages": "",
    "pieces": "1",
    "public_note": "",
    "fulfillment_note": "",
    "internal_note_1": "",
    "internal_note_2": "",
    "internal_note_3": "",
    "statistics_note_1": "",
    "statistics_note_2": "",
    "statistics_note_3": "",
    "requested": true,
    "edition": "",
    "imprint": "",
    "language": "eng",
    "library_details": {
      "address": {
        "line1": "Shiipping address",
        "line2": "George Fox University",
        "line3": "",
        "line4": "",
        "line5": "",
        "city": "Newberg",
        "country": {
          "value": "DEU",
          "desc": "Germany"
        },
        "email": "mosheshchtr@gmail.com",
        "phone": "",
        "postal_code": "444446",
        "state": "ORA"
      }
    },
    "alt_call_no": [],
    "call_no": ["OVSD", "7:2-3"],
    "title_abcnph": "Marian S. Carson collection of manuscripts,",
    "physical_condition": {
      "value": null,
      "desc": null
    }
  },
  "link": "/almaws/v1/bibs/991023770000541/holdings/2223599860000561/items/234382220000541"
}]
*/