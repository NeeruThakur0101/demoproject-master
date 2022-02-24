import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { Component, Input } from '@angular/core';
import { CoverageProfile } from '../../components/coverage-profile/models';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';

@Component({
    selector: 'app-copy-coverage-profile',
    templateUrl: './copy-coverage-profile.component.html',
    styleUrls: ['./copy-coverage-profile.component.scss'],
})

export class CopyCoverageProfileComponent extends DialogContentBase {
    @Input() stateProfiles: CoverageProfile[];
    @Input() selectedProfile: CoverageProfile;
    public pageContent : any;
    selectedDropDown: CoverageProfile;
    constructor(public dialog: DialogRef, private $auth: AuthenticationService,
        public $language: InternalUserDetailsService) { super(dialog);
    this.pageContent = this.$language.getPageContentByLanguage();

    }
}