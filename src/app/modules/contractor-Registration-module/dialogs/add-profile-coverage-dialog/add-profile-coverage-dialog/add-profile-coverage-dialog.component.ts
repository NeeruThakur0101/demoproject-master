import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { DialogRef, DialogService, DialogContentBase } from '@progress/kendo-angular-dialog';
import { NgForm } from '@angular/forms';
import { CoverageProfileService } from '../../../components/coverage-profile/coverage-profile.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';

@Component({
    selector: 'app-add-profile-coverage-dialog',
    templateUrl: './add-profile-coverage-dialog.component.html',
})
export class AddProfileCoverageDialogComponent extends DialogContentBase {
    @Input() incomingData: any;
    @Input() DataService: CoverageProfileService;
    @ViewChild('coverageProfileName') profileNameField: ElementRef;
    public pageContent: any;
    public dataModel: {
        profileName: string;
        PRISMClient: number;
        Division: number;
        ProgramType: number;
        tradeListType: number;
    } = {
        profileName: null,
        PRISMClient: null,
        Division: null,
        ProgramType: null,
        tradeListType: null,
    };
    constructor(public dialog: DialogRef, private _dialog: DialogService, public $language: InternalUserDetailsService, private $auth: AuthenticationService) {
        super(dialog);

        this.pageContent = this.$language.getPageContentByLanguage();
    }

    async getDivisionData(client) {
        this.dataModel.Division = null;
        const result = await this.DataService.getCreateCoverageProfileDropdown(client.PRISMClientID);
        this.incomingData['_prismDivision'] = result['_prismDivision'];
    }

    public onClickSave(myForm: NgForm) {
        this.profileNameField.nativeElement.classList.remove('err');
        if (!myForm.valid || myForm.value.profileName.trim() === '') {
            this.profileNameField.nativeElement.classList.add('err');
            return;
        }
        this.dialog.close({
            ContractorCoverageID: 0,
            CoverageProfileName: myForm.value.profileName.trim(),
            ClientID: myForm.value.PRISMClient ? myForm.value.PRISMClient.PRISMClientID : 0,
            DivisionID: myForm.value.Division ? myForm.value.Division.DivisionID : 0,
            SingleTradeID: myForm.value.tradeListType ? myForm.value.tradeListType.tradeListID : 0,
            ProgramTypeID: myForm.value.ProgramType ? myForm.value.ProgramType.ProgramTypeID : 0,
        });
    }

    public reset(myForm) {
        this.profileNameField.nativeElement.classList.remove('err');
        myForm.reset();
    }

    onClose() {
        if (
            this.dataModel.profileName !== null ||
            this.dataModel.PRISMClient !== null ||
            this.dataModel.Division !== null ||
            this.dataModel.ProgramType !== null ||
            this.dataModel.tradeListType !== null
        ) {
            const dialogRef = this._dialog.open({
                content: SaveAlertComponent,
                width: 500,
            });
            const _srvDialogRef = dialogRef.content.instance;
            _srvDialogRef.header = this.pageContent.Ownership_Info.Warning;
            _srvDialogRef.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.General_Keys.General_Sure}</p>
                                </div>
                            `;
            dialogRef.result.subscribe((result) => {
                const resultFromDialog = result;
                if (resultFromDialog['button'] === 'Yes') {
                    this.dialog.close({ button: 'CANCEL' });
                }
            });
        } else {
            this.dialog.close({ button: 'CANCEL' });
        }
    }
}
