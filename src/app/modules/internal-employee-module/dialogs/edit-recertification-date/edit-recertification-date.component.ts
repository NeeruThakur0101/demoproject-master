import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ContractorOperationService } from '../../components/contractor-operation/contractor-operation.service';

@Component({
    selector: 'app-edit-recertification-date',
    template: `
        <!-- <kendo-dialog title="Edit Recertification Date"     (close)="close()" [minWidth]="500" [width]="100"> -->
        <kendo-dialog-titlebar class="hasDialog">
            <h1>{{ pageContent?.Edit_Recertification_Date?.Edit_Recertification_Date }}</h1>
            <button type="button" (click)="close()">&times;</button>
        </kendo-dialog-titlebar>

        <!-- popup content section -->
        <div class="popup-content">
            <div class="outer-block">
                <div class="inner-block">
                    <!-- popup content -->
                    <section class="white-block">
                        <!-- form block starts -->
                        <section class="form-block">
                            <div class="form-control">
                                <kendo-textbox-container required floatingLabel="{{ pageContent?.Edit_Recertification_Date?.Contractor }}">
                                    <input kendoTextBox [disabled]="true" value="({{ _srvAuth.Profile.ContrID }}) {{ _srvAuth.Profile.CompanyName }}" />
                                </kendo-textbox-container>
                            </div>
                            <div class="form-control">
                                <kendo-textbox-container required floatingLabel="{{ pageContent?.Edit_Recertification_Date?.Enter_New_Recertification_Date }}" class="date-picker">
                                    <kendo-datepicker [(value)]="value">
                                    <kendo-datepicker-messages toggle="{{ pageContent.General_Keys.Toggle_Calender }}"></kendo-datepicker-messages>
                                    </kendo-datepicker>
                                </kendo-textbox-container>
                            </div>
                        </section>
                    </section>
                </div>
            </div>
        </div>
        <!-- footer section -->
        <div class="popup-footer">
            <button kendoButton (click)="close()">{{ pageContent?.Edit_Recertification_Date?.Cancel }}</button>
            <button kendoButton [disabled]="value ? false : true" (click)="save()" [primary]="true">{{ pageContent?.Edit_Recertification_Date?.Save }}</button>
        </div>
        <!-- </kendo-dialog> -->
    `,
    styles: [],
})
export class EditRecertificationDateComponent extends DialogContentBase implements OnInit {
    public value: string;
    public loginInternal: SessionUser;
    public pageContent: any;
    constructor(
        dialog: DialogRef,
        private _srvOperation: ContractorOperationService,
        private _datepipe: DatePipe,
        public _srvAuth: AuthenticationService,
        public _srvLangauge: InternalUserDetailsService,
        public intlService: IntlService
    ) {
        super(dialog);
        this.pageContent = this._srvLangauge.getPageContentByLanguage();
    }

    ngOnInit(): void {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService> this.intlService).localeId = this._srvAuth.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.loginInternal = this._srvAuth.ProfileInternal;
    }

    public close() {
        this.dialog.close({ button: 'Yes' });
    }
    public async save() {
        await this._srvOperation.editRecertDate(this._datepipe.transform(this.value, 'MM/dd/yyyy'), this.loginInternal.ResourceID);
        this.dialog.close({ status: 'save' });
    }
}
