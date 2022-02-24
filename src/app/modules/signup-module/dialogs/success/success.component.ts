import { Component, OnInit, Input } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent extends DialogContentBase implements OnInit {
  @Input() contractorName: string;
  @Input() language : string;
  public pageContent : any;
  constructor(public dialog: DialogRef, private _srvLanguage : InternalUserDetailsService) {
    super(dialog);
  }
  ngOnInit() {
    this.pageContent = this._srvLanguage.getPageContentByLanguageForSignup(this.language);
  }
  closePopupSuccess(data) {
    this.dialog.close({ status: data });
  }
}