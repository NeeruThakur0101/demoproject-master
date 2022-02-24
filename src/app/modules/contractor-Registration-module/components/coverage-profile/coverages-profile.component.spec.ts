import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogRef, DialogService, DialogsModule } from '@progress/kendo-angular-dialog';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';

import { CoverageProfileComponent } from './coverage-profile.component';
import { CoverageProfileService } from './coverage-profile.service';

describe('CoverageProfileComponent', () => {
    let component: CoverageProfileComponent;
    let fixture: ComponentFixture<CoverageProfileComponent>;
    let _dialog: DialogRef;
    let _srvContractorRegistration: ContractorRegistrationService;
    let _srvAuthentication: AuthenticationService;
    let _srvLanguage: InternalUserDetailsService;
    let _srvContractorData: ContractorDataService;
    let _srvCoverageProfile: CoverageProfileService;

    beforeEach(async(() => {
        _srvContractorRegistration = jasmine.createSpyObj('ContractorRegistrationService', ['funcInternalUserGoDirectlyToContractorPage']);
        _srvAuthentication = jasmine.createSpyObj('AuthenticationService', ['getPageAccessPrivilege']);
        _srvLanguage = jasmine.createSpyObj('InternalUserDetailsService', ['getPageContentByLanguage']);
        _srvContractorData = jasmine.createSpyObj('ContractorDataService', ['getPageComments']);
        _srvCoverageProfile = jasmine.createSpyObj('CoverageProfileService', ['getPageJSONData', 'validateUser', 'Profile']);
        TestBed.configureTestingModule({
            declarations: [CoverageProfileComponent],
            providers: [
                { provide: CoverageProfileService, useValue: _srvCoverageProfile },
                { provide: ContractorRegistrationService, useValue: _srvContractorRegistration },
                { provide: AuthenticationService, useValue: _srvAuthentication },
                { provide: InternalUserDetailsService, useValue: _srvLanguage },
                { provide: ContractorDataService, useValue: _srvContractorData },
            ],
            imports: [RouterTestingModule, DialogsModule, HttpClientModule],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoverageProfileComponent);
        component = fixture.componentInstance;
        // _srvCoverageProfile.Profile.ContrID = 0;
        component.pageContent = {
            Coverage_Profile: {
                Coverage_Profile_Information_Page_Header: `Coverage Profile Information`,
                Coverage_Profile_Type: `Coverage Profile Type`,
                Select_Profile: `Please select a profile that you would like to create or modify:`,
                State_Covered: `States Covered:`,
                Counties_Covered: `Counties Covered:`,
                Postal_Codes_Covered: `Postal Codes Covered:`,
                Postal_Codes_Not_Covered: `Postal Codes Not Covered:`,
                State_Provinces: `STATE(S)/PROVINCE(S)`,
                State_Province: `State/Province`,
                Select_State_Provinces_Services: `Please select the State(s)/Province(s) you provide services.`,
                State_Provinces_Create: `Create`,
                State_Provinces_Modify: `Modify`,
                State_Provinces_Copy: `Copy`,
                State_Provinces_Back: `Back`,
                State_Provinces_Next: `Next`,
                Counties_Regions: `COUNTIES/REGIONS`,
                Please_Select_Counties_Regions: `Please select the counties/regions you provide service.`,
                Counties_Regions_Create: `Create`,
                Counties_Regions_Modify: `Modify`,
                Counties_Regions_Copy: `Copy`,
                Counties_Regions_Back: `Back`,
                Counties_Regions_Save_Next: `Save & Next`,
                Postal_Codes: `POSTAL CODES`,
                Postal_Codes_Create: `Create`,
                Postal_Codes_Modify: `Modify`,
                Postal_Codes_Copy: `Copy`,
                Select_Provided_Details: `Select all that apply and provide the requested details in the required fields.`,
                Postal_Codes_Back: `Back`,
                Postal_Codes_Save_Next: `Save & Next`,
                Add_Atleast_One_Record_Warning: `Please add at least one record .`,
                Profile_Selection_Dialog_Box: `This profile section allows you to identify your coverage area and select the state and postal codes where your company will provide services. By selecting your coverage territory you are stating that you have the required business and contractor license(s) to perform work in this area. You must create a General profile. This General profile is your main profile that will capture the postal code coverage territory for all of your trades and programs. If you will be servicing the same coverage territory for all trades  then the ONLY profile you will need to use is the General profile. If you select to service a larger or smaller coverage territory for a specific trade  you may create a separate profile for that trade. We require that you will cover the postal codes you indicate without assessing any additional charges. If this is not the case  you will need to adjust your coverage territory profile accordingly. The only exception is to the Catastrophe profile please indicate any areas you would consider providing assistance in a catastrophic situation. Changes made to your coverage territory will be submitted to Membership Services for processing and approval. If your changes are approved  you will receive notification of acceptance. If your changes are not approved  you will be contacted by a Contractor Connection representative. Please note that completion of a profile change does not imply you will receive work assignment or be activated for a program. In order to receive assignments you must be selected for a client program.`,
                Coverage_Profile_60_Miles_Warning_Message: `There are some postal codes that are greater than 60 miles from your physical location by continuing the save  you are agreeing that this is correct.Do you want to proceed?`,
                Saved_Data_Warning: `Exit from saved data`,
                Handle: 'Handles home improvement/remodeling work requested directly by property holder/owner',
                ST: 'ST',
                Countys: 'County/Region',
                Postal: 'Postal Code',
                Save: `Save`,
                Delete: 'Delete',
                Add_Contractor_Coverage_Type: 'Add Contractor Coverage Type',
                Cov_Name: `Contractor Coverage Name`,
                Select_Client: `Select Client (If needed)`,
                Select_Division: `Select Division (If needed)`,
                Select_Program: `Select Program (If needed)`,
                Select_Trade: `Select Trade (If needed)`,
                Reset: 'Reset',
                Coverage_Copy_Utility: 'Coverage Copy Utility',
                Source_Profile: ' The Source profile you will be copying from is:',
                Please_Choose: 'Please choose your destination profile below and click the "Copy Profile" button.',
                Please_Note: 'Please Note',
                Notes: 'Changes made to your coverage area including these copied changes will be submitted to Membership Services for processing. Notification will be sent to the email address(s) in your profile once changes have been implemented. If you have questions, please contact your membership Services Coordinator.',
                Cancel: ' Cancel',
                Copy_Profile: 'Copy Profile',
                Success: 'Success',
                Profile_Created: `profile created successfully.`,
                Error: `Error`,
                Wrong: `Something went wrong can't create profile at this moment .`,
                Copy_Profile_Text: `Your profile has been copied.`,
                Are_You_Sure: `Are you sure?`,
                Are_You_Sure_Text: `You will not be able to recover this profile.`,
                Deleted: `Deleted`,
                Deleted_Text: `Your profile has been deleted.`,
                Not_Deleted: `Not Deleted`,
                Not_Deleted_Text: `Something went wrong your record is not deleted.`,
                Cancelled: `Cancelled`,
                Save_Profile: `Your profile is save :)`,
                Access_Denied: `Access Denied.`,
                Send_Mail: 'Send Mail',
                Add_New_Profile: `Add New Profile`,
                Warning: `Warning`,
                Alert: `Alert`,
                Sure_Unsaved: `Data unsaved. Are you sure you want to proceed without saving?`,
                State_Validation: `Please select atleast one state.`,
                County_Validation: `Please select atleast one county corresponding to each selected state.`,
                Postal_Validation: `Please select atleast one postal code corresponding to each selected county.`,
                Postal_Unsaved_Data: `Changes done are not saved, do you like to proceed without saving?`,
                Profile_Deleted: `Profile Deleted`,
                Alert_On_Deleted_Profile: `Create/Copy function cannot be performed until deleted profile Approved/Disapproved from Internal user.`,
                Not_Copied: `Not Copied`,
                Not_Copied_Text: `Something went wrong your record is not copied.`,
            },
        };

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call functions at construct', () => {
        expect(component._srvCoverageProfile.validateUser).toHaveBeenCalled();
    });
    it('should call language method at construct', () => {
        component._srvLanguage.getPageContentByLanguage;
        expect(component.pageContent).toBeDefined();
    });
});
