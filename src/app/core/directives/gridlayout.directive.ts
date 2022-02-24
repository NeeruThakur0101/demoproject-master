import { UniversalService } from './../services/universal.service';
import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[appGridlayout]'
})
export class GridlayoutDirective {
    public innerWidth: number;
    public innerHeight: number;
    public pageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true
    };
    public pageHeight = 0;
    public pageSize: number = 10;
    public finalOutput = {  pageSize: this.pageSize, pageObj: this.pageObj };
    constructor(private universal: UniversalService) { }


    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.pageHeight = 364;
        this.pageObj = {
            buttonCount: 2,
            info: true,
            type: 'numeric',
            pageSizes: true,
            previousNext: true
        };
        this.pageSize = 10;

        this.pageHeight = window.innerHeight - 240;
        if (window.innerWidth <= 680) {
            this.pageSize = 1;
            this.pageObj = {
                buttonCount: 1,
                info: true,
                type: 'numeric',
                pageSizes: true,
                previousNext: true
            };
        } else if (window.innerWidth > 680 && window.innerWidth <= 900) {
            this.pageSize = 2;
            this.pageObj = {
                buttonCount: 2,
                info: true,
                type: 'numeric',
                pageSizes: true,
                previousNext: true
            };
        } else if (window.innerWidth > 900) {
            this.pageSize = 10;
            this.pageObj = {
                buttonCount: 10,
                info: true,
                type: 'numeric',
                pageSizes: true,
                previousNext: true
            };
        }

        this.finalOutput.pageObj = this.pageObj;
        this.finalOutput.pageSize = this.pageSize;
        this.universal.gridLayout.next(this.finalOutput);

    }


}
