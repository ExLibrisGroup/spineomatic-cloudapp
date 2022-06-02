export class MarcRecord {
  controlfields: ControlField[] = [];
  datafields: DataField[] = [];
}

export class ControlField {
  tag: string;
  value: string;
}

export class DataField {
  constructor(tag: string, ind1: string, ind2: string) {
    this.tag = tag;
    this.ind1 = ind1;
    this.ind2 = ind2;
  }
  tag: string;
  ind1: string;
  ind2: string;
  subfields: SubField[] = [];
}

export class SubField {
  code: string;
  value: string;
}