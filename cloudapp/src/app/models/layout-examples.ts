import { Layouts } from "./configuration";

export const LayoutExamples: Layouts = {
  /* https://www.worldlabel.com/Pages/wl-ol125.htm */
  avery_5163: {
    measure: 'in',
    topMargin: 0.5,
    leftMargin: 0.18,
    pageWidth: 8.5,
    orientation: 'portrait',
    width: 4,
    height: 2,
    horizontalGap: 0.14,
    verticalGap: 0,
    perPage: 10
  },
  /* https://www.worldlabel.com/Pages/wl-ol875.htm */
  avery_5160: {
    measure: 'in',
    topMargin: 0.5,
    leftMargin: 0.21975,
    pageWidth: 8.5,
    orientation: 'landscape',
    width: 2.625,
    height: 1,
    horizontalGap: 0.14,
    verticalGap: 0,
    perPage: 30
  }
}