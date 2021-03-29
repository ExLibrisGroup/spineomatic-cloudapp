import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Entity, EntityType } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'app-select-entities',
  templateUrl: './select-entities.component.html',
  styleUrls: ['./select-entities.component.scss'],
  encapsulation: ViewEncapsulation.None /* apply to added elements */
})
export class SelectEntitiesComponent implements OnInit {
  masterChecked: boolean;
  masterIndeterminate: boolean;
  entities: SelectItem[];
  @Input() isEntitySelected: (e: Entity) => boolean;
  @Output() entitySelected = 
    new EventEmitter<{entity: SelectItem, checked: boolean}>();

  constructor() { }

  ngOnInit() {
    this.masterChecked = false;
  }

  @Input()
  set entityList(val: Entity[]) {
    this.entities = val.map(i=>new SelectItem(i, this.isEntitySelected));
    this.determineMasterValue();
  }

  masterChange() {
    Object.values(this.entities).forEach(b=>{
      b.checked = this.masterChecked;
      this.entitySelected.emit({entity: b, checked: b.checked})
    })
  }

  listChange(e: SelectItem, checked: boolean){
    this.determineMasterValue();
    this.entitySelected.emit({entity: e, checked: checked});
  }

  determineMasterValue() {
    const checked_count = Object.values(this.entities).filter(i=>i.checked).length;
    this.masterChecked = checked_count == this.entities.length;
    this.masterIndeterminate = checked_count > 0 && checked_count < this.entities.length;
  }

  clear() {
    Object.values(this.entities).forEach(b => b.checked = false);
    this.determineMasterValue();
  }
}

export class SelectItem implements Entity {
  checked: boolean;
  id: string;
  description: string;
  code: string;
  name: string;
  link: string;
  type: EntityType;

  constructor(item: Partial<SelectItem>, checker: (e: Entity) => boolean) {
    Object.assign(this, item);
    this.name = (this.description || this.code) || this.id;
    this.checked = checker(item as Entity);
  }
}