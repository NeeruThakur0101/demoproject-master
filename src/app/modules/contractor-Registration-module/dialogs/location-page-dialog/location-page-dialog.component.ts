import { Component, OnInit, Input, ViewEncapsulation, HostListener, Injectable, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { DialogRef, DialogContentBase, DialogService } from '@progress/kendo-angular-dialog';
import { ContractorLocationList } from './../../models/data-model';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
import { SelectEvent, RemoveEvent, FileInfo, FileRestrictions } from '@progress/kendo-angular-upload';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpProgressEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of, concat } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { environment } from 'src/environments/environment';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { Address, FacilityTypeModel, LocationTypeServiceModel, SpaceTypeModel, SelectType, StateServiceModel, VisualCueObject } from '../../components/contractor-location/model_location';
import { LocationDataService } from '../../components/contractor-location/location.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';

@Component({
    selector: 'app-location-page-dialog',
    templateUrl: './location-page-dialog.component.html',
    styleUrls: ['./location-page-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class LocationPageDialogComponent extends DialogContentBase
    implements OnInit {
    public static text: string;
    public uploadSaveUrl: string;
    public uploadRemoveUrl: string = 'removeUrl';
    public selectedFiles: any = [];
    // public title: any;
    public unchecked: boolean = false;
    @Input() public incomingData: ContractorLocationList;
    @Input() public physicalAddressData: Address;
    @Input() public IsRowDisable: boolean = false;


    public err: string = '';
    public isLocationFacilty: boolean = false;
    public isFacilityType: boolean = false;
    public locationModal: FormGroup = this.addLocationForm();
    public objLocation = new ContractorLocationList();
    public locationForm: FormGroup;
    public submitted: boolean = false;
    public opened: boolean = false;
    public uploadProgressValue: number = 0;
    public state: Array<StateServiceModel> = [];
    public stateData: Array<StateServiceModel>;
    public locationType: Array<LocationTypeServiceModel> = [];
    public locationTypeData: Array<LocationTypeServiceModel>;
    public facilityType: Array<FacilityTypeModel> = [];
    public facilityTypeData: Array<FacilityTypeModel>;
    public nameRegex: string = '^[a-zA-Z ,.\'-]+$';
    public spaceType: Array<SpaceTypeModel> = [];
    public spaceTypeData: Array<SpaceTypeModel>;
    public selectType: Array<SelectType> = [];
    public selectTypeData: Array<SelectType>;
    public isPhysicalAddress: boolean = true;
    public imageArray = [];
    public loginDetails: Array<SessionUser> = []; //  Array<LoginUser> = [];
    public CCOpsID: number;
    public newIncoming: VisualCueObject;
    public internalEmployee: boolean = false;
    public accessReadonly: boolean;
    public ContrID: number;
    public loggedInUserType: string;
    public pageContent: any;
    public header: string;
    public fileRestriction: FileRestrictions = {
        allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.png', '.bmp'],
        maxFileSize: 5242880
    };

    @ViewChild('ddlLocationType', { static: false }) public ddlLocationType;
    @ViewChild('ddlFacilityType', { static: false }) public ddlFacilityType;
    @ViewChild('ddlSpaceType', { static: false }) public ddlSpaceType;
    @ViewChild('ddlSpaceUsed', { static: false }) public ddlSpaceUsed;
    @ViewChild('ddlStateList', { static: false }) public ddlStateList;

    public uploadProgressEvent(e) {
        const index: number = this.selectedFiles.findIndex((element) => element.uid === e.files[0].uid);
        this.selectedFiles[index]['uploadProgress'] = e.percentComplete;
        if (e.percentComplete === 100) {
            this.imageArray.push(this.selectedFiles[index]);
        }
    }

    constructor(
        private _formBuilder: FormBuilder,
        private _DialogRef: DialogRef,
        private _srvDialog: DialogService,
        private _srvContrRegistration: ContractorRegistrationService,
        private _srvLanguage: InternalUserDetailsService, private _srvAuthentication: AuthenticationService,
        private _srvLocationData: LocationDataService
    ) {
        super(_DialogRef);
        this.locationModal = this._formBuilder.group({
            SerialNumber: [''],
            LocationNumber: [''],
            FacilityTypeORLocationName: ['', Validators.required],
            LocationStreetAddress: ['', Validators.required],
            City: ['', Validators.required],
            State: ['', Validators.required],
            PostalCode: ['', Validators.required],
            ContractorLocationTypeNumber: ['', Validators.required],
            IsPhysicalAddressSame: [''],
            ContractorFacilityTypeNumber: ['', Validators.required],
            SpaceHoldTypeNumber: ['', Validators.required],
            ContractorLocationSpaceUse: ['', Validators.required],
            OfficeOwnedIndicator: ['', Validators.required],
            ContractorFacilityTypeName: [''],
            SpaceHoldTypeText: [''],
            OfficeOwnedIndicatorName: [''],
            photoUpload: [''],
            SeparateOfficeFlag: [false],
            SeparateEntranceFlag: [false],
        });

        this.loginDetails = Array(this._srvAuthentication.Profile);
        this.CCOpsID = this.loginDetails[0].CCOpsID;

        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }

    @HostListener('mousedown')
    public onMousedown(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    @HostListener('mouseup')
    public onMouseup(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    ngOnInit() {
        this.locationModal = this.addLocationForm();
        this.fillStateDropDownData();
        const resourceId: number = this.loginDetails[0].ResourceID;
        const repoName: string = 'Location';
        this.uploadSaveUrl = environment.api_url + 'UploadDocument/InsertFile/' + repoName + '/' + resourceId + '/' + this.CCOpsID + '/' + this.loginDetails[0].ContrID;
        this.newIncoming = this.incomingData;

        this.header = this.incomingData !== undefined ? `${this.pageContent.Location_Info.Edit}` : `${this.pageContent.Location_Info.Add}`;
        // check if user is internal or contractor
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType; // if 'Internal'
        this.internalEmployee = this.loggedInUserType === 'Internal' ? true : false;
        this.ContrID = this.loginDetails[0].ContrID;

        // when data comes from grid to show visual cue
        // means id location facility type is Satellite Office then below
        // parameters are hide so there should be no visual cue on it
        if (this.loginDetails[0].ContrID > 0 && this.incomingData !== undefined) {
            if (this.isLocationFacilty === false) {
                this.newIncoming.isContractorFacilityTypeName = false;
                this.newIncoming.isSpaceHoldTypeName = false;
                this.newIncoming.isContractorLocationSpaceUse = false;
                this.newIncoming.isSpaceHoldTypeNumber = false;
                this.newIncoming.isOfficeOwnedIndicatorName = false;
            }
        }

        this.checkPrivilage();

        if (this.ContrID === 0 && this.loggedInUserType === 'Internal') {
            this.accessReadonly = true;
            this.locationModal.disable();
        }

        if (this.IsRowDisable && this.loggedInUserType !== 'Internal' && this.IsRowDisable === true) {
            this.locationModal.disable();
        }

    }

    private checkPrivilage(): void {
        if (this.loginDetails[0].ContrID > 0) {
            const accessType = this._srvAuthentication.getPageAccessPrivilege('Contractor Locations');

            if (!accessType.editAccess && accessType.readonlyAccess) {
                this.accessReadonly = true;
                this.locationModal.disable();
            }

        }
    }

    public numberOnly(event) {
        const pattern = /[0-9\+\-\ ]/;
        const inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode === 32 || inputChar === '-' || inputChar === '+') {
            return false;
        } else if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    public validationFacility() {
        const text = this.incomingData !== undefined ? this.incomingData.ContractorLocationTypeNumber : '';
        this.changeLocationType(text, '');
    }

    public validationAddress() {

        const physicalFlg = this.isPhysicalAddress;
        this.togglePhysicalAddress(physicalFlg);
    }

    @HostListener('window:beforeunload', ['$event'])
    public doSomething($event) {
        $event.preventDefault();
        if (this.fCancel()) {
            $event.returnValue = 'true';
        }
    }

    public async fillStateDropDownData() {

        const res = await this._srvLocationData.getDropdownData(this.loginDetails[0]);
        this.stateData = res.State;
        this.state = this.stateData.slice();
        this.locationTypeData = res.contractorLocationData;
        this.locationType = this.locationTypeData.slice();
        this.facilityTypeData = res.contractorfacilitydata;
        this.facilityType = this.facilityTypeData.slice();
        this.spaceTypeData = res.spaceusertypedata;
        this.spaceType = this.spaceTypeData.slice();
        this.selectTypeData = res.spaceholdtypedata;
        this.selectType = this.selectTypeData.slice();


        if ((this.incomingData && this.incomingData.IsPhysicalAddressSame === true) || this.isPhysicalAddress === true) {
            this.validationAddress();
        }
        this.validationFacility();
    }

    // state filter
    public handleFilterState(value) {
        this.state = this.stateData.filter((s) => s.Name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    // Location Filter
    public handleFilterLocation(value) {
        this.locationType = this.locationTypeData.filter((s) => s.ContractorLocationTypeTitleTranslated.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    public postalCodeValidatior(event: Event) {
        return this._srvContrRegistration.alphanumericEvaluator(event);
    }

    public handleFilterSpace(value) {
        this.spaceType = this.spaceTypeData.filter((s) => s.SpaceUseTypeTitle.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    public handleFilterSelect(value) {
        this.selectType = this.selectTypeData.filter((s) => s.SpaceHoldTypeTitle.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    public handleFilterFacilityType(value) {
        this.facilityType = this.facilityTypeData.filter((s) => s.ContractorFacilityTypeTitle.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    // convenience getter for easy access to form fields
    get locationFormControl() {
        return this.locationModal.controls;
    }
    public fCancel(): boolean {
        if (
            this.locationModal.controls['FacilityTypeORLocationName'].value !== '' ||
            this.locationModal.controls['LocationStreetAddress'].value !== '' ||
            this.locationModal.controls['City'].value !== '' ||
            this.locationModal.controls['State'].value !== '' ||
            this.locationModal.controls['PostalCode'].value !== '' ||
            this.locationModal.controls['ContractorLocationTypeNumber'].value !== '' ||
            this.locationModal.controls['ContractorFacilityTypeNumber'].value !== '' ||
            this.locationModal.controls['SpaceHoldTypeNumber'].value !== '' ||
            this.locationModal.controls['ContractorLocationSpaceUse'].value !== '' ||
            this.locationModal.controls['OfficeOwnedIndicator'].value !== ''
        ) {
            return true;
        }
    }
    public close() {
        if (this.locationModal.dirty === false) {
            this._DialogRef.close({ button: 'CANCEL' });
        } else {
            const dialogRef = this._srvDialog.open({
                content: SaveAlertComponent,
                width: 500
            });
            const dialog = dialogRef.content.instance; dialog.header = this.pageContent.Location_Info.Warning;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <h2>${this.pageContent.Location_Info.Location_Alert_Are_You_Sure_Alert}</h2>
                <p>${this.pageContent.Location_Info.Location_Alert_Not_Recover_Data}</p>
            </div>
        `;
            dialogRef.result.subscribe(result => {
                const resultFromDialog = result;
                if (resultFromDialog['button'] === 'Yes') {
                    this._DialogRef.close({ button: 'CANCEL' });
                }
            });
        }
    }
    public addLocationForm(): FormGroup {
        if (this.incomingData) {
            const formObj: ContractorLocationList = {
                SerialNumber: 0,
                LocationNumber: 0,
                FacilityTypeORLocationName: '',
                LocationStreetAddress: '',
                IsPhysicalAddressSame: false,
                City: '',
                State: '',
                StateName: '',
                PostalCode: '',
                // COMRESFlg: true,
                ContractorLocationTypeNumber: null,
                ContractorLocationTypeName: '',
                ContractorFacilityTypeNumber: null,
                SpaceHoldTypeNumber: null,
                ContractorLocationSpaceUse: 0,
                OfficeOwnedIndicator: null,
                ContractorFacilityTypeName: '',
                SpaceHoldTypeName: '',
                OfficeOwnedIndicatorName: '',
                SeparateOfficeFlag: false,
                SeparateEntranceFlag: false
            };

            this.isLocationFacilty = true ? this.incomingData.ContractorLocationTypeName !== 'Satellite Office' : false;
            this.isPhysicalAddress = this.incomingData.IsPhysicalAddressSame;
            this.isFacilityType = true ? this.incomingData.ContractorFacilityTypeNumber === 1 : false;

            formObj.SerialNumber = this.incomingData.SerialNumber;
            formObj.LocationNumber = this.incomingData.LocationNumber,
                formObj.IsPhysicalAddressSame = this.incomingData.IsPhysicalAddressSame;
            formObj.FacilityTypeORLocationName = this.incomingData.FacilityTypeORLocationName;
            formObj.LocationStreetAddress = this.incomingData.LocationStreetAddress;
            formObj.City = this.incomingData.City;
            formObj.State = this.incomingData.State;
            formObj.StateName = this.incomingData.StateName;
            formObj.PostalCode = this.incomingData.PostalCode;
            formObj.ContractorLocationTypeNumber = this.incomingData.ContractorLocationTypeNumber;
            formObj.ContractorLocationTypeName = this.incomingData.ContractorLocationTypeName;
            formObj.ContractorFacilityTypeNumber = this.incomingData.ContractorFacilityTypeNumber;
            formObj.SpaceHoldTypeNumber = this.incomingData.SpaceHoldTypeNumber;
            formObj.ContractorLocationSpaceUse = this.incomingData.ContractorLocationSpaceUse;
            formObj.OfficeOwnedIndicator = this.incomingData.OfficeOwnedIndicator;
            formObj.SeparateOfficeFlag = this.incomingData.SeparateOfficeFlag;
            formObj.SeparateEntranceFlag = this.incomingData.SeparateEntranceFlag;

            return this._formBuilder.group({
                SerialNumber: new FormControl(formObj.SerialNumber),
                LocationNumber: new FormControl(formObj.LocationNumber),
                FacilityTypeORLocationName: new FormControl(formObj.FacilityTypeORLocationName, Validators.required),
                IsPhysicalAddressSame: new FormControl(formObj.IsPhysicalAddressSame),
                LocationStreetAddress: new FormControl(formObj.LocationStreetAddress),
                City: new FormControl(formObj.City),
                State: new FormControl(formObj.State),
                PostalCode: new FormControl(formObj.PostalCode),
                ContractorLocationTypeNumber: new FormControl(
                    formObj.ContractorLocationTypeNumber
                ),
                ContractorFacilityTypeName: new FormControl(formObj.ContractorFacilityTypeName),
                ContractorFacilityTypeNumber: new FormControl(formObj.ContractorFacilityTypeNumber),
                SpaceHoldTypeText: new FormControl(formObj.SpaceHoldTypeName),
                SpaceHoldTypeNumber: new FormControl(formObj.SpaceHoldTypeNumber),
                ContractorLocationSpaceUse: new FormControl(formObj.ContractorLocationSpaceUse),
                OfficeOwnedIndicatorName: new FormControl(formObj.OfficeOwnedIndicatorName),
                OfficeOwnedIndicator: new FormControl(formObj.OfficeOwnedIndicator),
                SeparateOfficeFlag: new FormControl(formObj.SeparateOfficeFlag),
                SeparateEntranceFlag: new FormControl(formObj.SeparateEntranceFlag)
            });
        } else {
            return this.locationModal;
        }
    }
    onFormSubmitModal(): void {

        if (!this.locationModal.dirty) {
            this._DialogRef.close({ status: 'cancel', from: 'save' });
            return;
        }
        this.submitted = true;

        if (this.isPhysicalAddress === false && (this.locationModal.get('LocationStreetAddress').value === '' || this.locationModal.get('City').value === '' || this.locationModal.get('State').value === null || this.locationModal.get('PostalCode').value === '')) {
            this.locationModal.get('LocationStreetAddress').setValidators([Validators.required]);
            this.locationModal.get('City').setValidators([Validators.required]);
            this.locationModal.get('State').setValidators([Validators.required]);
            this.locationModal.get('PostalCode').setValidators([Validators.required]);
            this.locationModal.get('LocationStreetAddress').setValue(this.locationModal.value.LocationStreetAddress);
            this.locationModal.get('City').setValue(this.locationModal.value.City);
            this.locationModal.get('State').setValue(this.locationModal.value.State);
            this.locationModal.get('PostalCode').setValue(this.locationModal.value.PostalCode);
        }


        if (this.locationModal.invalid) {
            return;
        }

        if (this.isPhysicalAddress === false) {
            if (this.newIncoming) {
                this.newIncoming.isLocationStreetAddress = false,
                    this.newIncoming.isCity = false,
                    this.newIncoming.isStateName = false,
                    this.newIncoming.isPostalCode = false
            }
        }

        // set data in address fields if toggle true then data recieves from fileds
        // if No then data coming from contact page physical address tab
        if (this.isPhysicalAddress === true) {

            this.objLocation.LocationStreetAddress = this.physicalAddressData.StreetAddress;
            this.objLocation.City = this.physicalAddressData.City;

            this.objLocation.State = this.physicalAddressData.State;
            const ind = this.state.findIndex(x => x.Abbreviation === this.objLocation.State);
            this.objLocation.StateName = this.state[ind].Name;
            this.objLocation.State = (this.state[ind].ID).toString();
            this.objLocation.PostalCode = this.physicalAddressData.PostalCode;
        }
        else {
            this.objLocation.LocationStreetAddress = this.locationModal.value.LocationStreetAddress;
            this.objLocation.City = this.locationModal.value.City;

            this.objLocation.State = this.locationModal.value.State;
            const ind = this.state.findIndex(x => x.ID === parseInt(this.objLocation.State, 10));
            this.objLocation.StateName = this.state[ind].Name;

            this.objLocation.PostalCode = this.locationModal.value.PostalCode;
        }
        this.objLocation.SerialNumber = this.locationModal.value.SerialNumber;
        this.objLocation.LocationNumber = this.locationModal.value.LocationNumber;
        this.objLocation.FacilityTypeORLocationName = this.locationModal.value.FacilityTypeORLocationName;
        this.objLocation.ContractorLocationTypeNumber = this.locationModal.value.ContractorLocationTypeNumber;

        const indloc = this.locationType.findIndex(x => x.ContractorLocationTypeID === this.locationModal.value.ContractorLocationTypeNumber);
        this.objLocation.ContractorLocationTypeName = this.locationType[indloc].ContractorLocationTypeTitleTranslated;

        if (this.isLocationFacilty === true) {
            this.objLocation.ContractorFacilityTypeNumber = this.locationModal.value.ContractorFacilityTypeNumber;
            const indFacility = this.facilityType.findIndex(x => x.ContractorFacilityTypeID === this.locationModal.value.ContractorFacilityTypeNumber);
            this.objLocation.ContractorFacilityTypeName = this.facilityType[indFacility].ContractorFacilityTypeTitleTranslated;

            this.objLocation.SpaceHoldTypeNumber = this.locationModal.value.SpaceHoldTypeNumber;
            const indSpace = this.spaceType.findIndex(x => x.SpaceUseTypeID === this.locationModal.value.SpaceHoldTypeNumber);
            this.objLocation.SpaceHoldTypeName = this.spaceType[indSpace].SpaceUseTypeTitle;

            this.objLocation.ContractorLocationSpaceUse = parseInt(this.locationModal.value.ContractorLocationSpaceUse, 10);

            this.objLocation.OfficeOwnedIndicator = this.locationModal.value.OfficeOwnedIndicator;
            const indOwned = this.selectType.findIndex(x => x.SpaceHoldTypeID === this.locationModal.value.OfficeOwnedIndicator);
            this.objLocation.OfficeOwnedIndicatorName = (indOwned !== -1 ? this.selectType[indOwned].SpaceHoldTypeTitle : '');


        }
        else {
            this.objLocation.ContractorFacilityTypeNumber = null;
            this.objLocation.SpaceHoldTypeNumber = null;
            this.objLocation.ContractorLocationSpaceUse = null;
            this.objLocation.OfficeOwnedIndicator = null;
            this.objLocation.ContractorFacilityTypeName = '';
            this.objLocation.SpaceHoldTypeName = '';
            this.objLocation.OfficeOwnedIndicatorName = '';
        }
        this.objLocation.IsPhysicalAddressSame = this.isPhysicalAddress;
        this.objLocation.SeparateOfficeFlag = this.locationModal.value.SeparateOfficeFlag;
        this.objLocation.SeparateEntranceFlag = this.locationModal.value.SeparateEntranceFlag;
        this._DialogRef.close({ status: this.objLocation, button: 'SUBMIT' });
    }

    public changeLocationType(locID, status) {

        let id: number;
        if (status === 'change') {
            id = locID.ContractorLocationTypeID;
        }
        else {
            id = locID
        }
        if (id != null) {

            const index = this.locationType.findIndex(x => x.ContractorLocationTypeID === id)
            if (!(index > -1)) return;

            const text = this.locationType[index].ContractorLocationTypeTitle;

            if (text !== 'Satellite Office') {
                this.isLocationFacilty = true;
                this.locationModal.get('ContractorFacilityTypeNumber').setValidators([Validators.required]);
                this.locationModal.get('SpaceHoldTypeNumber').setValidators([Validators.required]);
                this.locationModal.get('ContractorLocationSpaceUse').setValidators([Validators.required]);
                this.locationModal.get('OfficeOwnedIndicator').setValidators([Validators.required]);
            }
            else {
                this.isLocationFacilty = false;
                this.locationModal.get('ContractorFacilityTypeNumber').setValidators(null);
                this.locationModal.get('SpaceHoldTypeNumber').setValidators(null);
                this.locationModal.get('ContractorLocationSpaceUse').setValidators(null);
                this.locationModal.get('OfficeOwnedIndicator').setValidators(null);

                this.locationModal.get('ContractorFacilityTypeNumber').setValue('');
                this.locationModal.get('SpaceHoldTypeNumber').setValue('');
                this.locationModal.get('ContractorLocationSpaceUse').setValue('');
                this.locationModal.get('OfficeOwnedIndicator').setValue('');
            }
        }
    }

    public changeFacility(textFacilty) {
        this.isFacilityType = textFacilty === 1 ? true : false;
    }

    // toggle physical address
    public togglePhysicalAddress(toggleValue) {

        if (toggleValue !== true) {

            this.locationModal.get('LocationStreetAddress').setValue('');
            this.locationModal.get('City').setValue('');
            this.locationModal.get('State').setValue(null);
            this.locationModal.get('PostalCode').setValue('');
            this.locationModal.get('LocationStreetAddress').setValidators([Validators.required]);
            this.locationModal.get('City').setValidators([Validators.required]);
            this.locationModal.get('State').setValidators([Validators.required]);
            this.locationModal.get('PostalCode').setValidators([Validators.required]);
        }
        else {
            this.locationModal.get('LocationStreetAddress').setValidators(null);
            this.locationModal.get('LocationStreetAddress').setValue('');
            this.locationModal.get('City').setValidators(null);
            this.locationModal.get('City').setValue('');
            this.locationModal.get('State').setValidators(null);
            this.locationModal.get('State').setValue('');
            this.locationModal.get('PostalCode').setValidators(null);
            this.locationModal.get('PostalCode').setValue('');
        }
        this.isPhysicalAddress = toggleValue;
    }

    public onFocus() {
        setTimeout(() => {

            if (this.ddlLocationType && this.ddlLocationType.wrapper.nativeElement.contains(document.activeElement)) {
                this.ddlLocationType.toggle(true);
            }

            if (this.ddlFacilityType && this.ddlFacilityType.wrapper.nativeElement.contains(document.activeElement)) {
                this.ddlFacilityType.toggle(true);
            }

            if (this.ddlSpaceType && this.ddlSpaceType.wrapper.nativeElement.contains(document.activeElement)) {
                this.ddlSpaceType.toggle(true);
            }

            if (this.ddlSpaceUsed && this.ddlSpaceUsed.wrapper.nativeElement.contains(document.activeElement)) {
                this.ddlSpaceUsed.toggle(true);
            }
        });

        if (this.ddlStateList && this.ddlStateList.wrapper.nativeElement.contains(document.activeElement)) {
            this.ddlStateList.toggle(true);
        }
    }

    public selectEventHandler(e: SelectEvent) {
        let extensions;
        let restrictionFlag: boolean = false;

        e.files.forEach((file: FileInfo) => {
            if (file.rawFile) {
                extensions = this.fileRestriction.allowedExtensions;

                if (extensions.includes(file.extension.toLowerCase())) {
                    this.readImage(file);
                } else {
                    restrictionFlag = true;
                }
            }
        });

        if (restrictionFlag) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <p>${this.pageContent.Company_Info.File_Validation}</p>
            </div>
        `;
        }
    }

    public readImage(input) {
        const parentThis = this;

        if (input.rawFile) {
            const reader = new FileReader();
            reader.onload = function (e) {

                let previewImg;
                if ((this.result as string).split(';')[0] === 'data:application/pdf') {
                    previewImg = 'assets/images/ico-pdf.svg';
                }
                else if ((this.result as string).split(';')[0] === 'data:text/plain') {
                    previewImg = 'assets/images/ico-txt.svg';
                }
                else if ((this.result as string).split(';')[0] === 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    (this.result as string).split(';')[0] === 'data:application/vnd.ms-excel') {
                    previewImg = 'assets/images/ico-excel.svg';
                }
                else if ((this.result as string).split(';')[0] === 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    (this.result as string).split(';')[0] === 'data:application/msword') {
                    previewImg = 'assets/images/ico-doc.svg';
                }
                else {
                    previewImg = this.result;
                }

                parentThis.selectedFiles.push({
                    preview: previewImg, // this.result,
                    name: input.name,
                    size: input.size,
                    uid: input.uid,
                    uploadProgress: 0
                });
            };
            reader.readAsDataURL(input.rawFile);
        }
    }

    clearEventHandler(e) {
        this.selectedFiles = [];
    }

    public remove(upload, uid: string) {
        upload.removeFilesByUid(uid);
    }

    public removeEventHandler(e: RemoveEvent) {
        this.selectedFiles = this.selectedFiles.filter(
            img => img.uid !== e.files[0].uid
        );
        this.imageArray = this.imageArray.filter(
            img => img.uid !== e.files[0].uid
        );
    }
}

@Injectable()
export class UploadInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url === 'saveUrl') {
            const events: Observable<HttpEvent<any>>[] = [0, 10, 30, 60, 100].map((x) => of({
                type: HttpEventType.UploadProgress,
                loaded: x,
                total: 100
            } as HttpProgressEvent).pipe(delay(1000)));

            const success = of(new HttpResponse({ status: 200 })).pipe(delay(1000));
            events.push(success);
            return concat(...events);
        }

        if (req.url === 'removeUrl') {
            return of(new HttpResponse({ status: 200 }));
        }

        return next.handle(req);
    }
}
