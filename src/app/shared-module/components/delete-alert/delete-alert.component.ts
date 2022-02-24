import { Component, OnInit, Input } from '@angular/core';
import { DialogRef, DialogContentBase } from '@progress/kendo-angular-dialog';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { InternalUserDetailsService } from '../../services/internal-userDetails.service';

@Component({
    selector: 'app-delete-alert',
    template: `
        <kendo-dialog-titlebar>
            <div>
                {{ this.pageContent.General_Keys.General_Alert }}
            </div>
        </kendo-dialog-titlebar>

        <!-- popup content section -->
        <div class="popup-content">
            <div class="outer-block">
                <div class="inner-block">
                    <section class="white-block" [innerHTML]="alertMessage"></section>
                </div>
            </div>
        </div>
        <!-- footer section -->
        <div class="popup-footer">
            <button kendoButton type="button" (click)="onCancelAction()">{{ pageContent.General_Keys.General_No }}</button>
            <button kendoButton type="button" [primary]="true" (click)="close()">
                {{ pageContent.General_Keys.General_Yes }}
            </button>
        </div>
    `,
})
export class DeleteAlertComponent extends DialogContentBase implements OnInit {
    public dialogOpened: boolean = false;
    public pageContent: any;
    @Input() alertMessage: string = '';
    @Input() header: string = '';

    public open(component) {
        this[component + 'Opened'] = true;
    }
    public action(status) {
        this.dialogOpened = false;
    }

    constructor(public dialog: DialogRef, public $language: InternalUserDetailsService, private $auth: AuthenticationService, private _srvUniversal: UniversalService) {
        super(dialog);
        this.pageContent = this.$language.getPageContentByLanguage();

        if (this.alertMessage === '') {
            this.alertMessage = this.pageContent.General_Keys.General_Sure;
        }

        if (this.header === '') {
            this.header = this.pageContent.General_Keys.General_Exit;
        }
    }

    ngOnInit() {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);

        const anchorTags = document.getElementsByTagName("a");
        setTimeout(() => {
            this._srvUniversal.removeTooltip(anchorTags);
        }, 10);
    }

    public onCancelAction() {
        this.dialog.close({ button: 'Cancel' });
    }
    public close() {
        this.dialog.close({ button: 'Yes' });
    }
}
