import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from '../../services/internal-userDetails.service';
import { CrDetailComponent } from './cr-detail/cr-detail.component';

@Component({
    selector: 'app-page-title',
    template: `
        <h1 kendoTooltip class="right" position="right">
            <span *ngIf="comments?.length" class="cr-info">CR</span> {{ pageName }}
            <span *ngIf="comments?.length" class="ico-hammer" (click)="openCRPop()" [title]="pageContent?.CR_Detail?.Click_to_view_correction_request_details"></span>
        </h1>
        <ng-container #container></ng-container>
    `,
    styleUrls: [],
})
export class PageTitleComponent implements OnInit {
    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;
    @Input() pageName: string;
    @Input() comments: any;
    pageContent: any;
    constructor(private $dialogSrv: DialogService, private _srvAuthentication: AuthenticationService, public _srvLanguage: InternalUserDetailsService) {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }

    ngOnInit(): void {}
    openCRPop() {
        const alertDialog = this.$dialogSrv.open({
            content: CrDetailComponent,
            appendTo: this.containerRef,
            width: 500,
        });
        const dialogInstance = alertDialog.content.instance;
        dialogInstance.comments = this.comments && this.comments[0].Comment;
    }
}
