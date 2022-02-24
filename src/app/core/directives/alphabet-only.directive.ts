import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appAlphabetOnly]',
})
export class AlphabetOnlyDirective {
    constructor(private _el: ElementRef) {}
    key;
    @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent) {
        this.key = event.keyCode;
        if (((this.key >= 15 && this.key <= 64) || this.key >= 123 || (this.key >= 96 && this.key <= 105)) && !(this.key === 32 && this._el.nativeElement.value.length > 0)) {
            event.preventDefault();
        }
    }
}
