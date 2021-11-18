import { LazyTranslateLoader } from "@exlibris/exl-cloudapp-angular-lib";
import { TranslateLoader, TranslateModule, TranslateParser } from "@ngx-translate/core";
import { TranslateICUParser } from "ngx-translate-parser-plural-select";
import { DataField, MarcRecord } from "./models/marc";
import { select } from "./xmlutils";

export function CloudAppTranslateModuleWithICU() {
  return TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useClass: (LazyTranslateLoader)
    },
    parser: {
      provide: TranslateParser,
      useClass: TranslateICUParser
    }
  });
}

export const marcToJson = (record: any) => {
  const doc = new DOMParser().parseFromString(record, "application/xml");
  let marc = new MarcRecord();
  let field: Element, subfield: Element;

  const controlfields = select(doc, '/record/controlfield');
  while (field = controlfields.iterateNext() as Element) {
    const tag = field.getAttribute('tag');
    if (tag) {
      marc.controlfields.push({ tag, value: field.textContent });
    }
  }

  const datafields = select(doc, '/record/datafield');
  while (field = datafields.iterateNext() as Element) {
    const tag = field.getAttribute('tag');
    if (tag) {
      let newfield = new DataField(tag, field.getAttribute('ind1'), field.getAttribute('ind2'));
      const subfields = select(doc, 'subfield', { context: field });
      while (subfield = subfields.iterateNext() as Element) {
        newfield.subfields.push({ code: subfield.getAttribute('code'), value: subfield.textContent })
      }
      marc.datafields.push(newfield);
    }
  }

  return marc;
}