import { Component, OnInit, Input } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
@Component({
    selector: 'app-dialog-cancel-alerts',
    templateUrl: './dialog-cancel-alerts.component.html',
    styleUrls: ['./dialog-cancel-alerts.component.scss'],
})
export class DialogCancelAlertsComponent extends DialogContentBase implements OnInit {
    constructor(public dialog: DialogRef) {
        super(dialog);
    }

    ngOnInit(): void {}
    public close() {
        this.dialog.close({ button: 'Yes' });
    }
}
