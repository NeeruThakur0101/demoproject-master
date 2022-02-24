import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { DatePipe } from '@angular/common';
import { ContractorReassign } from '../../components/internal-landing/internal-landing.model';
import { InternalLandingService } from '../../components/internal-landing/internal-landing.service';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

@Component({
    selector: 'app-reassign-contracrtor-action',
    templateUrl: './reassign-contracrtor-action.component.html',
    styleUrls: ['./reassign-contracrtor-action.component.scss'],
})
export class ReassignContracrtorActionComponent extends DialogContentBase implements OnInit {
    public formgroup: FormGroup;
    public pageContent: any;
    public reassignToList: ContractorReassign[];
    public minDate: Date;
    private filterData: ContractorReassign[];
    @Input() recruitingRole: boolean;
    @Input() reassignData: any; // it holds the objects from different meddalions so object may very
    @Input() recruitingRoleName: string;
    @Input() repResourceId: number;
    constructor(
        private _srvInternal: InternalLandingService,
        public dialog: DialogRef,
        private _srvAuth: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        private _datePipe: DatePipe,
        public intlService: IntlService
    ) {
        super(dialog);
    }

    ngOnInit(): void {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService> this.intlService).localeId = this._srvAuth.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.minDate = new Date();
        this.getDropdownData();
        this.initFormgroup();
    }

    public async getDropdownData() {
        const contrId = this.reassignData.ContrID || this.reassignData.ContractorID;
        const resourceId = this._srvAuth.ProfileInternal.ResourceID;
        this.reassignToList = await this._srvInternal.GetRepresentativeDropDown(this.repResourceId, resourceId, contrId, this.recruitingRoleName);
        this.filterData = JSON.parse(JSON.stringify(this.reassignToList));
    }
    private initFormgroup() {
        this.formgroup = new FormGroup({
            contractor: new FormControl(this.reassignData.ContractorName),
            contRecruiter: new FormControl(this.reassignData.Rep),
            reassignTo: new FormControl(null, [Validators.required]),
            reassignUntil: new FormControl(null),
        });
    }
    public close() {
        this.dialog.close({ status: 'cancel' });
    }
    public filterDropdown(ev) {
        this.reassignToList = this.filterData.slice().filter((value) => value.RepName.toLowerCase().indexOf(ev.toLowerCase()) !== -1);
    }
    public async reassignClicked() {
        const reassignPost = {
            ContrID: this.reassignData.ContrID || this.reassignData.ContractorID,
            RepresentativeResourceID: this.formgroup.controls.reassignTo.value,
            ExpirationDate: this._datePipe.transform(this.formgroup.controls.reassignUntil.value, 'MM/dd/yyyy'),
            LoggedInResourceID: this._srvAuth.ProfileInternal.ResourceID
        };
        const res = await this._srvInternal.InsertLandingReassignment(reassignPost);
        if (res === 1) this.dialog.close({ status: 'reassign' });
    }
}
