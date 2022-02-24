
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterBy' })
export class OwnershipFilterPipe implements PipeTransform {
  constructor() {}
  transform(items: any): any {

    if (items.length) {
      const filteredOwnershipList = [];

      for (let i = 0; i <= items.length; i++) {
        items[i].ContactPhone =
          items[i].ContactPhone.toString().slice(0, 3) +
          '-' +
          items[i].ContactPhone.toString().slice(3, 6) +
          '-' +
          items[i].ContactPhone.toString().slice(6, 10);
        filteredOwnershipList.push(items[i]);
      }
      return filteredOwnershipList;
    } else {
      return [];
    }
  }
}
