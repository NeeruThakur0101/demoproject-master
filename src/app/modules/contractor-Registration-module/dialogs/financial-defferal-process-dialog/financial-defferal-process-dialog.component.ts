import { Component, OnInit } from '@angular/core';
import { DialogRef, DialogContentBase } from '@progress/kendo-angular-dialog';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';

@Component({
    selector: 'app-financial-defferal-process-dialog',
    templateUrl: './financial-defferal-process-dialog.component.html',
    styleUrls: ['./financial-defferal-process-dialog.component.scss'],
})
export class FinancialDefferalProcessDialogComponent extends DialogContentBase implements OnInit {
    public pageContent: any;
    constructor(public dialog: DialogRef, private $auth: AuthenticationService, public $language: InternalUserDetailsService) {
        super(dialog);
    }

    ngOnInit() {
        this.pageContent = this.$language.getPageContentByLanguage();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
    }
    closePopupFinancialDeferal(data) {
        this.dialog.close({ status: data });
    }
}
