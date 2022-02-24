import { Component, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';

@Component({
    selector: 'app-dialog-delete-alerts',
    templateUrl: './dialog-delete-alerts.component.html',
    styleUrls: ['./dialog-delete-alerts.component.scss'],
})
export class DialogDeleteAlertsComponent extends DialogContentBase implements OnInit {
    constructor(public dialog: DialogRef) {
        super(dialog);
    }

    ngOnInit(): void {}
    public close() {
        this.dialog.close({ button: 'Yes' });
    }
}
