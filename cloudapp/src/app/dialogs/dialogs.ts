export interface DialogData {
  title: string;
  text: string | any[];
  cancel: string;
  ok: string;
  type: DialogType;
}

export enum DialogType {
  OK = 'ok',
  OK_CANCEL = 'ok-cancel',
}

export const DEFAULT_DIALOG_OPTIONS: DialogData = {
  title: '',
  text: '',
  cancel: 'Cancel',
  ok: 'OK',
  type: DialogType.OK_CANCEL
}