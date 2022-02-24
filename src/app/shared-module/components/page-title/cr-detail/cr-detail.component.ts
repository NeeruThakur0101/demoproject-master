import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Component, Input, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';

@Component({
    selector: 'app-cr-detail',
    template: `
        <!-- <kendo-dialog title="Reassign Contractor Action"     (close)="close()" [minWidth]="500" [width]="100"> -->
        <kendo-dialog-titlebar class="hasDialog">
            <h1>{{ pageContent?.CR_Detail?.Correction_Request_Details }}</h1>
            <button type="button" (click)="close()">&times;</button>
        </kendo-dialog-titlebar>
        <!-- popup content section -->
        <div class="popup-content">
            <div class="outer-block">
                <div class="inner-block">
                    <!-- popup content -->
                    <section class="white-block">
                        <!-- form block starts -->
                        <section class="correction-request-list">
                            <ul>
                                <li *ngFor="let comment of comments">{{ comment.Comment }}</li>
                            </ul>
                        </section>
                    </section>
                </div>
            </div>
        </div>
        <!-- footer section -->
        <div class="popup-footer">
            <button kendoButton (click)="close()" [primary]="true">
                {{ pageContent?.CR_Detail?.Close }}
            </button>
        </div>
        <!-- </kendo-dialog> -->
    `,
    styleUrls: [],
})
export class CrDetailComponent extends DialogContentBase implements OnInit {
    @Input() comments: any;
    pageContent: any;
    constructor(_dialog: DialogRef, private _srvAuthentication: AuthenticationService, private _srvLanguage: InternalUserDetailsService) {
        super(_dialog);
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }

    ngOnInit(): void {}

    public close() {
        this.dialog.close({ button: 'Yes' });
    }
}
