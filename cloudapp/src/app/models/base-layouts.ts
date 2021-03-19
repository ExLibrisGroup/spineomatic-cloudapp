import { Layouts } from "./configuration";

export const BaseLayouts: Layouts = {
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
  },
  /* https://www.demco.com/demco-reg-gaylord-reg-processing-spine-labels-1-12-x-78 */
  'Demco Spine 1 1/2 x 7/8': {
    measure: 'in',
    topMargin: 0.68,
    leftMargin: 0.31,
    pageWidth: 8.5,
    orientation: 'portrait',
    width: 0.87,
    height: 1.5,
    horizontalGap: 0.12,
    verticalGap: 0.13,
    perPage: 48
  },
  /* https://www.demco.com/demco-reg-gaylord-reg-processing-spine-labels-34-x-1-14 */
  'Demco Spine 3/4 x 1 1/4': {
    measure: 'in',
    topMargin: 0.25,
    leftMargin: 0.25,
    pageWidth: 8.5,
    orientation: 'landscape',
    width: 1.25,
    height: .75,
    horizontalGap: 0,
    verticalGap: 0.1,
    perPage: 84
  },
}