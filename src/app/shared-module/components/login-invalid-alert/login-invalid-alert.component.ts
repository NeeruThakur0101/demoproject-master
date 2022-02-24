import { Component, Input, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from '../../services/internal-userDetails.service';

@Component({
  selector: 'app-login-invalid-alert',
  templateUrl: './login-invalid-alert.component.html',
  styleUrls: ['./login-invalid-alert.component.scss']
})
export class LoginInvalidAlertComponent extends DialogContentBase implements OnInit {

  public opened: boolean = false;
  public pageContent: any;
  @Input() alertMessage: string = '';
  constructor(public dialog: DialogRef, public $language: InternalUserDetailsService, private $auth: AuthenticationService) {
    super(dialog);
    this.pageContent = this.$language.getPageContentByLanguage();
    if (this.alertMessage === '') {
      this.alertMessage = `
    <div class="modal-alert info-alert">
    <p>${this.pageContent.General_Keys.General_One_Record}</p>
  </div>`;
    }
  }

  ngOnInit(): void {
  }

  public close() {
    this.dialog.close({ button: 'Yes' });
  }

}
