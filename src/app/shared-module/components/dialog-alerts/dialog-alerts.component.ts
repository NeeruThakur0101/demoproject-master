import { Component, OnInit, Input } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { InternalUserDetailsService } from '../../services/internal-userDetails.service';

@Component({
    selector: 'app-dialog-alerts',
    templateUrl: './dialog-alerts.component.html',
    styleUrls: ['./dialog-alerts.component.scss'],
})
export class DialogAlertsComponent extends DialogContentBase implements OnInit {
    public opened: boolean = false;
    public pageContent: any;
    @Input() alertMessage: string = '';
    constructor(public dialog: DialogRef, public $language: InternalUserDetailsService, private $auth: AuthenticationService, private _srvUniversal: UniversalService) {
        super(dialog);
        this.pageContent = this.$language.getPageContentByLanguage();
        if (this.alertMessage === '') {
            this.alertMessage = `
      <div class="modal-alert info-alert">
      <p>${this.pageContent.General_Keys.General_One_Record}</p>
    </div>`;
        }
    }

    ngOnInit() {
        const anchorTags = document.getElementsByTagName("a");
        setTimeout(() => {
            this._srvUniversal.removeTooltip(anchorTags);
        }, 10);
    }

    public close() {
        this.dialog.close({ button: 'Yes' });
    }


}
