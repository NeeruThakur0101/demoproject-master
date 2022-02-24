import { DialogRef, DialogContentBase } from '@progress/kendo-angular-dialog';
import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent extends DialogContentBase implements OnInit {
    public dialogOpened: boolean = false;
    @Input() alertMessage: string = '';
    @Input() header: string = '';

    public onCancelAction() {
        this.dialog.close({ button: 'Cancel' });
    }
    public close() {
        this.dialog.close({ button: 'Yes' });
    }

    constructor(public dialog: DialogRef) {
        super(dialog);
        if (this.alertMessage == '') {
            this.alertMessage = 'Are you sure you want to delete?';
        }

        if (this.header == '') {
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
    }
}
