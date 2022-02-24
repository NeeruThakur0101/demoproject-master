import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone'
})
export class PhonePipe implements PipeTransform {

  // transform(value: unknown, ...args: unknown[]): unknown {
  //   return null;
  // }

  transform(rawNum) {
      if(rawNum){
        rawNum = rawNum.charAt(0) !== 0 ? '' + rawNum : '' + rawNum;

        let newStr = '';
        let i = 0;

        for (; i < Math.floor(rawNum.length / 3) - 1; i++) {
          newStr = newStr + rawNum.substr(i * 3, 3) + '-';
        }

        return newStr + rawNum.substr(i * 3);
      }
  }

}
