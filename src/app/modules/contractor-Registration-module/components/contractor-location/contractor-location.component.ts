import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UniversalService } from 'src/app/core/services/universal.service';
import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy, CompositeFilterDescriptor, filterBy, distinct } from '@progress/kendo-data-query';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from '@progress/kendo-angular-dialog';
import { LocationPageDialogComponent } from '../../dialogs/location-page-dialog/location-page-dialog.component';
import { SelectApplicationModel } from '../../models/data-model';
import { Router } from '@angular/router';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { CorrectionRequestComments, DeviceObj, LoginUser, PageObj } from 'src/app/core/models/user.model';
import { LocationData, ContractorLocationList, LocationInformation, VisualCueObject, PageChange, LocationDropdownData } from './model_location';
import { LocationDataService } from './location.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { Renderer2 } from '@angular/core';
@Component({
    selector: 'app-contractor-location',
    templateUrl: './contractor-location.component.html',
    styleUrls: ['./contractor-location.component.scss'],
})
export class ContractorLocationComponent implements OnInit, AfterViewInit {
    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;

    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    // mobile grid code
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: DeviceObj;

    public sort: SortDescriptor[] = [];
    public pageSize: number = 5;
    public skip: number = 0;
    public gridData: ContractorLocationList[] = [];
    public pageObj: PageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };

    public physicalAddressData: object = {};
    public locationForm: FormGroup;
    public resourceId: number;
    public saveNext: string = 'Save & Next'; // default
    public allowUnsort: boolean = true;

    public isOtherLocationApplied: boolean = false;
    public isOtherLocationSatelite: boolean = false;
    public selectedItem: VisualCueObject;
    public gridView: GridDataResult;
    public newObj: LocationInformation = {};
    public forwardedData: LocationData;
    public objProgram = new SelectApplicationModel();
    public loginDetails: Array<SessionUser> = [];
    public isFinalSaveButton: boolean = false;
    public dataForApproval: ContractorLocationList[] = [];
    public dataForApprovalContractor: ContractorLocationList[] = [];
    public approvalJsonLocation: ContractorLocationList[] = [];
    public loggedInUserType: string;
    public ContrID: number;
    public showPage: boolean = false;
    public accessReadonly: boolean = false;
    public pageContent: any;
    public AppliedLocationIndex: number;
    public SatelliteLocationIndex: number;
    public crComments: CorrectionRequestComments[];
    public filter: CompositeFilterDescriptor = null;
    public gridDataGrid: ContractorLocationList[] = filterBy(this.gridData, this.filter);
    public addLocation: ContractorLocationList[] = [];
    public dropdownData: LocationDropdownData;

    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this.gridData, filter);
    }
    public distinctPrimitive(fieldName: string) {
        return distinct(this.gridData, fieldName).map((item) => item[fieldName]);
    }

    constructor(
        private _srvContractSrv: ContractorRegistrationService,
        private _formBuilder: FormBuilder,
        private _srvDialog: DialogService,
        private _route: Router,
        private _srvDeviceDetector: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        public _srvAuthentication: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        public _srvLocationData: LocationDataService,
        private _srvStorage: StorageService,
        private renderer: Renderer2
    ) { }

    public async ngOnInit() {
        this.crComments = await this._srvContractorData.getPageComments('Facilities/Other Locations Information');
        this.LocationOninit();
        if (this.loggedInUserType === 'Internal') {
            this.saveNext = 'Next';
        }

        // mobile _srvDeviceDetector
        this.deviceResObj = this._srvUniversal.deviceResolution();
        this.deviceInfo = this._srvDeviceDetector.getDeviceInfo();
        this.isMobile = this._srvDeviceDetector.isMobile();
        this.isTab = this._srvDeviceDetector.isTablet();
        this.isDesktop = this._srvDeviceDetector.isDesktop();

        if (this.isMobile === true) {
            this.pageSize = 1;
            this.pageObj.buttonCount = 1;
        } else if (this.isTab === true) {
            if (window.screen.orientation.type === 'portrait-primary') {
                this.pageSize = 2;
                this.pageObj.buttonCount = 2;
            } else {
                this.pageSize = 5;
                this.pageObj.buttonCount = 5;
            }
        } else if (this.isDesktop === true) {
            this.pageSize = 10;
            this.pageObj.buttonCount = 10;
        }

        this.pageSize = this.deviceResObj.pageSize;
        this.pageObj = this.deviceResObj.pageObj;

        setTimeout(() => {
            this.heightCalculate();
        }, 1000);
    }

    public heightCalculate() {
        if (document.body) {
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this.renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    public async LocationOninit() {
        this.loginDetails = await Array(this._srvAuthentication.Profile);
        if (this.loginDetails) {
            this.resourceId = this.loginDetails[0].ResourceID;
            this.ContrID = this.loginDetails[0].ContrID;
        }
        this.loggedInUserType = await this._srvAuthentication.LoggedInUserType;

        this.pageContent = this._srvLanguage.getPageContentByLanguage();

        this.checkPrivilage();

        this.getJSON();

        this.loadData();

        this.locationForm = this._formBuilder.group({
            OtherNetworkOfficeLocations: ['', Validators.required],
            OtherSatelliteLocations: ['', Validators.required],
        });
    }

    private checkPrivilage(): void {
        if (this.ContrID > 0) {
            const accessType = this._srvAuthentication.getPageAccessPrivilege('Contractor Locations');
            if (!accessType.editAccess) {
                if (accessType.readonlyAccess) {
                    this.accessReadonly = true;
                } else {
                    this.showPage = true;
                    const dialogRef = this._srvDialog.open({
                        appendTo: this.containerRef,
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `<div class="modal-alert info-alert">
              <h2>${this.pageContent.Location_Info.Access_Denied}</h2>
              <p>${this.pageContent.Location_Info.Permission}</p>
             </div>`;
                    dialogRef.result.subscribe((val) => {
                        this._route.navigate(['contractorRegistration/company-information']);
                    });
                }
            }
        }
    }

    public sliderChange(pageIndex: number): void {
        this.skip = (pageIndex - 1) * this.pageSize;
    }

    public onPageChange(state: PageChange): void {
        this.pageSize = state.take;
    }

    // this function gets the data which we have already sent for approval
    public async getJsonForApprovalData() {
        const jsonResponse = await this._srvLocationData.getEventPageJSON(this.loginDetails[0]);
        this.dataForApproval =
            Object.keys(jsonResponse).length && jsonResponse[0].CCOpsData !== null ? JSON.parse(jsonResponse[0].CCOpsData).ContractorData.LocationInformation.ContractorLocationList : [];
        this.approvalJsonLocation = JSON.parse(JSON.stringify(this.dataForApproval));
        this.loadData();
    }

    private loadData(): void {
        const dataArr = [];
        this.gridData.forEach((element) => {
            const obj = {
                SerialNumber: element.SerialNumber,
                LocationNumber: element.LocationNumber,
                IsPhysicalAddressSame: element.IsPhysicalAddressSame,
                FacilityTypeORLocationName: element.FacilityTypeORLocationName,
                LocationStreetAddress: element.LocationStreetAddress,
                City: element.City,
                State: element.State,
                StateName: element.StateName,
                PostalCode: element.PostalCode,
                ContractorLocationTypeNumber: element.ContractorLocationTypeNumber,
                ContractorLocationTypeName: element.ContractorLocationTypeName,
                ContractorFacilityTypeNumber: element.ContractorFacilityTypeNumber,
                ContractorFacilityTypeName: element.ContractorFacilityTypeName,
                SpaceHoldTypeNumber: element.SpaceHoldTypeNumber,
                SpaceHoldTypeName: element.SpaceHoldTypeName,
                OfficeOwnedIndicatorName: element.OfficeOwnedIndicatorName,
                ContractorLocationSpaceUse: element.ContractorLocationSpaceUse,
                OfficeOwnedIndicator: element.OfficeOwnedIndicator,
                SeparateOfficeFlag: element.SeparateOfficeFlag,
                SeparateEntranceFlag: element.SeparateEntranceFlag,

                // increase these parameters to show the visual cues on the columns
                isFacilityTypeORLocationName: false,
                isLocationStreetAddress: false,
                isCity: false,
                isStateName: false,
                isPostalCode: false,
                isContractorLocationTypeName: false,
                isContractorFacilityTypeName: false,
                isSpaceHoldTypeNumber: false,
                isSpaceHoldTypeText: false,
                isOfficeOwnedIndicatorName: false,
                isContractorLocationSpaceUse: false,
                isSeparateOfficeFlag: false,
                isSeparateEntranceFlag: false,
            };
            dataArr.push(obj);
        });

        this.gridData = dataArr;

        // call function to show visual cues
        this.matchDataToshowVisualCue();

        this.gridView = {
            data: orderBy(this.gridData, this.sort),
            total: this.gridData.length,
        };
    }

    // if there is some data is pending for approval match with the old json data
    // if data is not same means data is not approved yet
    public matchDataToshowVisualCue() {
        if (this.dataForApproval !== undefined) {
            this.dataForApproval.forEach((element) => {
                // tslint:disable-next-line:forin
                for (const key in element) {
                    const ind = this.gridData.findIndex((x) => x.SerialNumber === element.SerialNumber);
                    if (ind !== -1) {
                        const objGrid = this.gridData[ind];
                        if (key !== 'SerialNumber' && objGrid.hasOwnProperty(key)) {
                            objGrid[key] = element[key];
                            objGrid['is' + key] = true;
                        }
                    } else {
                        // this code is used when we send complete row for approval
                        const obj: VisualCueObject = {
                            SerialNumber: this.gridData.length + 1,
                            LocationNumber: element.LocationNumber,
                            IsPhysicalAddressSame: element.IsPhysicalAddressSame,
                            FacilityTypeORLocationName: element.FacilityTypeORLocationName,
                            LocationStreetAddress: element.LocationStreetAddress,
                            City: element.City,
                            State: element.State,
                            StateName: element.StateName,
                            PostalCode: element.PostalCode,
                            ContractorLocationTypeNumber: element.ContractorLocationTypeNumber,
                            ContractorLocationTypeName: element.ContractorLocationTypeName,
                            ContractorFacilityTypeNumber: element.ContractorFacilityTypeNumber,
                            ContractorFacilityTypeName: element.ContractorFacilityTypeName,
                            SpaceHoldTypeNumber: element.SpaceHoldTypeNumber,
                            SpaceHoldTypeName: element.SpaceHoldTypeName,
                            OfficeOwnedIndicatorName: element.OfficeOwnedIndicatorName,
                            ContractorLocationSpaceUse: element.ContractorLocationSpaceUse,
                            OfficeOwnedIndicator: element.OfficeOwnedIndicator,
                            SeparateOfficeFlag: element.SeparateOfficeFlag,
                            SeparateEntranceFlag: element.SeparateEntranceFlag,
                            // increase these parameters to show the visual cues on the columns
                            isFacilityTypeORLocationName: true,
                            isLocationStreetAddress: true,
                            isCity: true,
                            isIsPhysicalAddressSame: true,
                            isStateName: true,
                            isPostalCode: true,
                            isContractorLocationTypeName: true,
                            isContractorFacilityTypeName: true,
                            isSpaceHoldTypeNumber: true,
                            isSpaceHoldTypeName: true,
                            isOfficeOwnedIndicatorName: true,
                            isContractorLocationSpaceUse: true,
                            isSeparateOfficeFlag: true,
                            isSeparateEntranceFlag: true,
                        };
                        this.gridData.push(obj);
                    }
                }
            });

            const girdDataView = JSON.parse(JSON.stringify(this.gridData));
            this.updateBottomToggles(girdDataView);
            this.validateLocation();

        }
    }

    public updateBottomToggles(girdDataView) {
        girdDataView = this.updateLanguageforGridData(girdDataView);

        this.AppliedLocationIndex = girdDataView.findIndex((x) => x.ContractorLocationTypeName === 'Applied/Active Other Location');
        this.isOtherLocationApplied = this.AppliedLocationIndex > -1 ? true : false;

        this.SatelliteLocationIndex = girdDataView.findIndex((x) => x.ContractorLocationTypeName === 'Satellite Office');
        this.isOtherLocationSatelite = this.SatelliteLocationIndex > -1 ? true : false;
    }

    public async getJSON() {
        // this code is used to get data from json or from db
        const dbDataResponse = await this._srvLocationData.getDbData(this.loginDetails[0]);
        this.dropdownData = await this._srvLocationData.getDropdownData(this.loginDetails[0]);

        if (this.ContrID > 0) {
            this.forwardedData = dbDataResponse;
            if (this.forwardedData.hasOwnProperty('LocationInformation')) {
                this.gridData = this.forwardedData.LocationInformation.ContractorLocationList;
                this.getJsonForApprovalData();
            }
            if (this.forwardedData.hasOwnProperty('ContactDetails')) {
                const physicalData = this.forwardedData;
                const addressType: any = physicalData.ContactDetails.Address;
                this.physicalAddressData = addressType.find((x) => x.AddressType === 'Physical');
            }
        }
        // this code is used when data is coming from json before submit the application
        else {
            this.forwardedData = dbDataResponse;
            // if loggedin user in internal employee and wants to see the data of prospective contractor
            this._srvContractSrv.funcInternalUserGoDirectlyToContractorPage(this.forwardedData.LocationInformation, 'LocationInformation');
            if (this.forwardedData.LocationInformation === null && this.loggedInUserType === 'Internal') return;

            const contactData = await this._srvLocationData.getContactData(this.loginDetails[0]);
            this.forwardedData.ContactDetails = contactData.ContactDetails;

            if (this.forwardedData.hasOwnProperty('LocationInformation') && this.forwardedData.LocationInformation !== null) {
                this.gridData = this.forwardedData.LocationInformation.ContractorLocationList;
                const girdDataView = JSON.parse(JSON.stringify(this.gridData));
                this.updateBottomToggles(girdDataView);
            }

            if (this.forwardedData.hasOwnProperty('ContactDetails')) {
                const physicalData = this.forwardedData;
                const addressType: any = physicalData.ContactDetails.Address;
                this.physicalAddressData = addressType.find((x) => x.AddressType === 'Physical');
            }

        }
    }

    private updateLanguageforGridData(gridDataSubmit) {
        gridDataSubmit.forEach((ele) => {
            const updateLocationLangName = this.dropdownData.contractorLocationData.find((obj) => obj.ContractorLocationTypeID === ele.ContractorLocationTypeNumber);
            if (updateLocationLangName !== undefined) ele.ContractorLocationTypeName = updateLocationLangName.ContractorLocationTypeTitle;
        });

        return gridDataSubmit;
    }

    private updateLanaguageforSaveaAndNext(gridDataSubmit) {
        gridDataSubmit.forEach((ele) => {
            const updateLocationLangName = this.dropdownData.contractorLocationData.find((obj) => obj.ContractorLocationTypeID === ele.ContractorLocationTypeNumber);
            if (updateLocationLangName !== undefined) ele.ContractorLocationTypeName = updateLocationLangName.ContractorLocationTypeTitle;
        });

        return gridDataSubmit;
    }

    public validateLocation() {
        let count: number = 0;
        const checkLocationArr: Array<string> = [];
        if (this.gridData.length < 3) {
            return true;
        }

        let gridDataSaveResponse = JSON.parse(JSON.stringify(this.gridData));
        gridDataSaveResponse = this.updateLanaguageforSaveaAndNext(gridDataSaveResponse);

        gridDataSaveResponse.forEach((item) => {
            if (item.ContractorLocationTypeName === 'Office Space' && checkLocationArr.indexOf('Office Space') === -1) {
                checkLocationArr.push(item.ContractorLocationTypeName);
                count++;
            } else if (item.ContractorLocationTypeName === 'Showroom Space' && checkLocationArr.indexOf('Showroom Space') === -1) {
                checkLocationArr.push(item.ContractorLocationTypeName);
                count++;
            } else if (item.ContractorLocationTypeName === 'Warehouse Space' && checkLocationArr.indexOf('Warehouse Space') === -1) {
                checkLocationArr.push(item.ContractorLocationTypeName);
                count++;
            }
        });

        const booleanCounter = count < 3 ? 'true' : 'false';
        this._srvStorage.setStorage(booleanCounter, 'LocationChangeCounter');

        return count >= 3 ? false : true;
    }

    public validateAppliedLocation() {
        if (this.isOtherLocationApplied) {
            let gridDataSaveResponse = JSON.parse(JSON.stringify(this.gridData));
            gridDataSaveResponse = this.updateLanaguageforSaveaAndNext(gridDataSaveResponse);
            const index = gridDataSaveResponse.findIndex((x) => x.ContractorLocationTypeName === 'Applied/Active Other Location');
            return index === -1 ? true : false;
        }
    }

    public validateSetteliteOffice() {
        if (this.isOtherLocationSatelite) {
            let gridDataSaveResponse = JSON.parse(JSON.stringify(this.gridData));
            gridDataSaveResponse = this.updateLanaguageforSaveaAndNext(gridDataSaveResponse);
            const index = gridDataSaveResponse.findIndex((x) => x.ContractorLocationTypeName === 'Satellite Office');
            return index === -1 ? true : false;
        }
    }
    public async onSave() {
        this.isFinalSaveButton = true;

        if (this.validateAppliedLocation()) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <p>${this.pageContent.Location_Info.Applied}</p>
                </div>
            `;
            this.isOtherLocationSatelite = false;
            return dialogRef;
        }
        if (this.validateSetteliteOffice()) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <p>${this.pageContent.Location_Info.Satellite}</p>
                </div>
            `;
            this.isOtherLocationSatelite = false;
            return dialogRef;
        }

        await this._srvContractorData.saveContractorData({ currentPage: 'Contractor Locations Page', nextPage: 'contractor-location' }, null, 'AddContractorLocation/EditLocationEventJsonData');
        this.crComments = await this._srvContractorData.getPageComments('Facilities/Other Locations Information');
        this.LocationOninit();
    }

    public async onSubmit() {
        if (this.loggedInUserType === 'Internal') {
            this._route.navigate(['/contractorRegistration/job-volume-information']);
        } else {
            this.isFinalSaveButton = true;
            if (this.validateLocation()) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <p>${this.pageContent.Location_Info.Min_Loc}</p>
                </div>
            `;
                return dialogRef;
            }

            if (this.validateAppliedLocation()) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <p>${this.pageContent.Location_Info.Applied}</p>
                </div>
            `;
                this.isOtherLocationApplied = false;
                return dialogRef;
            }
            if (this.validateSetteliteOffice()) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <p>${this.pageContent.Location_Info.Satellite}</p>
                </div>
            `;
                this.isOtherLocationSatelite = false;
                return dialogRef;
            }

            if (this.ContrID > 0) {
                if (this._srvAuthentication.Profile.EventName !== 'No Event' && this._srvAuthentication.Profile.ContrID > 0) {
                    await this._srvContractorData.saveContractorData(
                        { currentPage: 'Contractor Locations Page', nextPage: 'job-volume-information' },
                        null,
                        'AddContractorLocation/EditLocationEventJsonData'
                    );
                    this.crComments = await this._srvContractorData.getPageComments('Facilities/Other Locations Information');
                    this._route.navigate(['/contractorRegistration/job-volume-information']);
                    return;
                }
            } else {
                await this._srvContractSrv.saveLastPageVisited('job-volume-information');
                this._route.navigate(['/contractorRegistration/job-volume-information']);
            }
        }
    }

    public async saveDialogData() {
        this.newObj = {
            OtherNetworkOfficeLocations: this.isOtherLocationApplied,
            OtherSatelliteLocations: this.isOtherLocationSatelite,
            ContractorLocationList: this.addLocation,
            ResourceId: this.loginDetails[0].ResourceID,
            CCopsId: this.loginDetails[0].CCOpsID,
            LastPageVisited: 'contractor-location',
        };
        await this._srvLocationData.saveData(this.newObj);
        this.LocationOninit();
        this.forwardedData = await this._srvLocationData.getDbData(this.loginDetails[0]);
        if (this.forwardedData.hasOwnProperty('LocationInformation')) {
            this.gridData = this.forwardedData.LocationInformation.ContractorLocationList;
        }
    }

    //   collect for easy access to form fields
    get contractorLocationFormControl() {
        return this.locationForm.controls;
    }

    public locationResult(resultFromDialog, option) {
        const datafromDialog: ContractorLocationList = resultFromDialog['status'];
        const add: ContractorLocationList = {};
        Object.assign(add, {
            SerialNumber: option === 'edit' ? datafromDialog.SerialNumber : this.gridData.length + 1,
            LocationNumber: option === 'edit' ? datafromDialog.LocationNumber : null,
            IsPhysicalAddressSame: datafromDialog.IsPhysicalAddressSame,
            FacilityTypeORLocationName: datafromDialog.FacilityTypeORLocationName,
            LocationStreetAddress: datafromDialog.LocationStreetAddress,
            City: datafromDialog.City,
            // @ts-ignore
            State: parseInt(datafromDialog.State, 10),
            StateName: datafromDialog.StateName,
            PostalCode: datafromDialog.PostalCode.trim(),
            ContractorLocationTypeNumber: datafromDialog.ContractorLocationTypeNumber,
            ContractorLocationTypeName: datafromDialog.ContractorLocationTypeName,
            ContractorFacilityTypeNumber: datafromDialog.ContractorFacilityTypeNumber,
            ContractorFacilityTypeName: datafromDialog.ContractorFacilityTypeName === '' ? 'N/A' : datafromDialog.ContractorFacilityTypeName,
            SpaceHoldTypeNumber: datafromDialog.SpaceHoldTypeNumber,
            SpaceHoldTypeName: datafromDialog.SpaceHoldTypeName === '' ? null : datafromDialog.SpaceHoldTypeName,
            OfficeOwnedIndicatorName: datafromDialog.OfficeOwnedIndicatorName === '' ? null : datafromDialog.OfficeOwnedIndicatorName,
            ContractorLocationSpaceUse: datafromDialog.ContractorLocationSpaceUse,
            OfficeOwnedIndicator: datafromDialog.OfficeOwnedIndicator,
            SeparateOfficeFlag: datafromDialog.SeparateOfficeFlag,
            SeparateEntranceFlag: datafromDialog.SeparateEntranceFlag,
        });

        const index = this.gridData.findIndex((e) => e.SerialNumber === datafromDialog.SerialNumber);
        this.addLocation = [];
        let approvalObj: ContractorLocationList[] = [];

        if (index === -1) {
            this.gridData.push(add);
            this.addLocation.push(add);
            // when insert new entry for approval
            if (this.ContrID > 0) {
                if (this.loggedInUserType !== 'Internal') {
                    approvalObj = this.differenceLocation(add, {}, {});
                    this.saveContractorData(approvalObj);
                    return;
                } else {
                    this.matchJsonObjectsToSendForApproval('', add);
                }
            }
        } else {
            if (this.ContrID > 0) {
                if (this.loggedInUserType !== 'Internal') {
                    const DBData = this.forwardedData.LocationInformation.ContractorLocationList[index] === undefined ? {} : this.forwardedData.LocationInformation.ContractorLocationList[index];
                    const approvalIndex = this.dataForApproval.findIndex((e) => e.SerialNumber === this.gridData[index].SerialNumber);
                    const approval = this.dataForApproval[approvalIndex] === undefined ? {} : this.dataForApproval[approvalIndex];
                    approvalObj = this.differenceLocation(add, DBData, approval);
                    this.saveContractorData(approvalObj);
                    return;
                } else {
                    const oldData = this.forwardedData.LocationInformation.ContractorLocationList[index];
                    this.matchJsonObjectsToSendForApproval(oldData, add);
                }
            }

            this.addLocation.push(add);
        }

        if (this.ContrID === 0) {
            this.saveDialogData();
        }
    }

    public async saveContractorData(approvalObj: ContractorLocationList[]) {
        const ccopsData: LocationData = {
            LocationInformation: {
                ContractorLocationList: approvalObj,
            },
        };

        const finalObj = Object.keys(approvalObj[0]).length > 2 ? ccopsData : null;
        await this._srvContractorData.saveContractorData({ currentPage: 'Contractor Locations Page', nextPage: 'contractor-location' }, finalObj, 'AddContractorLocation/EditLocationEventJsonData');
        this.crComments = await this._srvContractorData.getPageComments('Facilities/Other Locations Information');
        this.LocationOninit();
    }

    // this function is used to find updated values and create a json for approval
    public async matchJsonObjectsToSendForApproval(oldData, updatedData) {
        const obj = {};
        if (oldData !== '' && oldData !== undefined) {
            for (const Key in oldData) {
                if (oldData[Key] !== updatedData[Key] || Key === 'SerialNumber' || Key === 'LocationNumber') {
                    obj[Key] = updatedData[Key];
                }
            }
        } else {
            for (const Key in updatedData) {
                if (updatedData['ContractorLocationTypeName'] !== 'Satellite Office') {
                    obj[Key] = updatedData[Key];
                } else {
                    if (Key !== 'ContractorFacilityTypeName' && Key !== 'SpaceHoldTypeText' && Key !== 'OfficeOwnedIndicatorName' && Key !== 'ContractorLocationSpaceUse') {
                        obj[Key] = updatedData[Key];
                    }
                }
            }
        }

        const ind = this.dataForApproval.findIndex((x) => x.SerialNumber === obj['SerialNumber']);
        if (ind !== -1) {
            if (Object.keys(obj).length <= 2 && obj.hasOwnProperty('SerialNumber') && obj.hasOwnProperty('LocationNumber')) {
                this.dataForApproval.splice(ind, 1);
            } else {
                this.dataForApproval[ind] = obj;
            }
        } else {
            this.dataForApproval.push(obj);
        }

        // this function is used only when logged in user is internal
        // employee and wants to updated the form.
        if (this.loggedInUserType === 'Internal') {
            this.sendJsonInternalEmployee();
        }

        // this block is common for contractor or internal employee
        const ccopsData = {
            LocationInformation: {
                ContractorLocationList: this.dataForApproval,
            },
        };

        if (this.loggedInUserType === 'Internal') {
            this.objProgram.Contr_ID = this.ContrID;
        }

        this.objProgram.Contr_ID = this.ContrID;
        this.objProgram.ResourceId = this.resourceId;
        this.objProgram.ContractorResourceNumber = this._srvAuthentication.Profile.ContractorResourceID;
        this.objProgram.ContractorResourceID = this._srvAuthentication.Profile.ContractorResourceID;
        this.objProgram.CCOpsData = JSON.stringify(this.dataForApproval.length > 0 ? ccopsData : null);
        this.objProgram.PageName = 'Contractor Locations Page';
        this.objProgram.CCOpsID = this.loginDetails[0].CCOpsID;

        if (this.loggedInUserType !== 'Internal') {
            this._srvContractorData.saveContractorData({ currentPage: 'Contractor Locations Page', nextPage: 'job-volume-information' }, ccopsData, 'AddContractorLocation/EditLocationEventJsonData');
            this.crComments = await this._srvContractorData.getPageComments('Facilities/Other Locations Information');
            return;
        }

        await this._srvLocationData.saveInternalData(this.objProgram);
        this.dataForApproval = [];
        this.getJSON();
    }

    public differenceLocation(tgt, src, approvalJSON) {
        if (Array.isArray(tgt)) {
            // if you got array
            return tgt; // just copy it
        }
        const obj: ContractorLocationList[] = [];
        const rst: ContractorLocationList = {};

        // if you got object
        // tslint:disable-next-line:forin
        for (const k in tgt) {
            // visit all fields
            if (approvalJSON.hasOwnProperty(k)) {
                if (approvalJSON[k] !== null && typeof approvalJSON[k] === 'object') {
                    // if field contains object (or array because arrays are objects too)
                    rst[k] = this.differenceLocation(tgt[k], src[k], approvalJSON[k]); // diff the contents
                } else if (approvalJSON[k] !== tgt[k]) {
                    // if field is not an object and has changed
                    rst[k] = tgt[k]; // use new value
                }
                // otherwise just skip it
            } else {
                if (src[k] !== null && typeof src[k] === 'object') {
                    // if field contains object (or array because arrays are objects too)
                    rst[k] = this.differenceLocation(tgt[k], src[k], approvalJSON[k]); // diff the contents
                } else if (src[k] !== tgt[k]) {
                    // if field is not an object and has changed
                    rst[k] = tgt[k]; // use new value
                }
                // otherwise just skip it
            }

            rst.LocationNumber = tgt['LocationNumber'];
            rst.SerialNumber = tgt['SerialNumber'];
        }

        if (!Object.keys(rst).length) {
            return;
        } else {
            const ind = this.dataForApproval.findIndex((x) => x.SerialNumber === rst['SerialNumber']);
            if (ind !== -1) {
                if (Object.keys(rst).length <= 2 && rst.hasOwnProperty('SerialNumber') && rst.hasOwnProperty('LocationNumber')) {
                    this.dataForApproval.splice(ind, 1);
                } else {
                    obj.push(rst);
                }
            } else {
                obj.push(rst);
            }
        }
        return obj;
    }

    // this bunch of code is used to make json which is not updated by contractor and different from the master json
    public async sendJsonInternalEmployee() {
        // dataForApprovalContractor is used when internal employee log in
        // and wants to updated some value but contractor already have some visual cue
        this.dataForApprovalContractor = JSON.parse(JSON.stringify(this.approvalJsonLocation));
        if (this.loggedInUserType === 'Internal') {
            const arrayInternal: ContractorLocationList[] = [];
            this.dataForApproval.forEach((element) => {
                let index: number;
                if (this.dataForApprovalContractor != null || this.dataForApprovalContractor !== undefined) {
                    index = this.dataForApprovalContractor.findIndex((x) => x.SerialNumber === element.SerialNumber);
                } else {
                    index = -1;
                }
                let objInternal: ContractorLocationList = {};
                if (index !== -1) {
                    const oldDataContractor: ContractorLocationList = this.dataForApprovalContractor[index];
                    if (Object.keys(this.dataForApprovalContractor[index]).length !== Object.keys(element).length) {
                        for (const Key in element) {
                            if (!oldDataContractor.hasOwnProperty(Key) || Key === 'SerialNumber' || Key === 'LocationNumber') {
                                objInternal[Key] = element[Key];
                            }
                        }
                        arrayInternal.push(objInternal);
                    }
                } else {
                    objInternal = element;
                    arrayInternal.push(objInternal);
                }
                this.dataForApproval = arrayInternal;
            });
        }
    }

    public openDialogForm(option: string, curData?) {
        // add data from dialog to datagrid
        if (option === 'ADD') {
            setTimeout(() => {
                window.scroll({
                    top: 0,
                    left: 0,
                    behavior: 'smooth',
                });
            }, 5);

            const dialogRef = this._srvDialog.open({
                content: LocationPageDialogComponent,
                width: 500,
            });
            const contractorInfo = dialogRef.content.instance;
            contractorInfo.physicalAddressData = this.physicalAddressData;
            dialogRef.result.subscribe((result) => {
                const resultFromDialog = result;
                if (resultFromDialog['button'] === 'SUBMIT') {
                    this.locationResult(resultFromDialog, 'add');
                }
            });
        } else if (option === 'EDIT') {
            setTimeout(() => {
                window.scroll({
                    top: 0,
                    left: 0,
                    behavior: 'smooth',
                });
            }, 5);

            this.selectedItem = curData;
            const dialogRef = this._srvDialog.open({
                content: LocationPageDialogComponent,
                width: 500,
            });
            const contractorInfo = dialogRef.content.instance;
            contractorInfo.incomingData = this.selectedItem;
            contractorInfo.physicalAddressData = this.physicalAddressData;

            const indx = this.dataForApproval.findIndex((x) => x.SerialNumber === this.selectedItem.SerialNumber);
            contractorInfo.IsRowDisable = indx > -1 ? this.dataForApproval[indx]['IsRowDisable'] : false;

            dialogRef.result.subscribe((result) => {
                const resultFromDialog = result;
                if (resultFromDialog['button'] === 'SUBMIT') {
                    this.locationResult(resultFromDialog, 'edit');
                }
            });
        }
    }

    async onback() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            this._srvContractorData.saveContractorData({ currentPage: 'Contractor Locations Page', nextPage: 'legal-questions' }, null, 'AddContractorLocation/EditLocationEventJsonData');
            this._route.navigate(['/contractorRegistration/legal-questions']);
            return;
        }

        if (this.loggedInUserType === 'Internal') {
            this._route.navigate(['/contractorRegistration/legal-questions']);
        } else {
            this.newObj = {
                LastPageVisited: 'legal-questions',
            };
            await this._srvContractSrv.saveLastPageVisited('legal-questions');
            this._route.navigate(['/contractorRegistration/legal-questions']);
        }
    }

    ngAfterViewInit() {
        // layout data
        this._srvUniversal.gridLayout.subscribe((layout: any) => {
            this.deviceInfo = this._srvDeviceDetector.getDeviceInfo();
            if (Object.keys(layout).length > 0) {
                this.pageSize = layout.pageSize;
                this.pageObj = layout.pageObj;
                this.skip = 0;
                if (this.isTab === true) {
                    if (window.screen.orientation.type === 'portrait-primary') {
                        this.pageSize = 2;
                        this.pageObj.buttonCount = 2;
                    } else {
                        this.pageSize = 5;
                        this.pageObj.buttonCount = 5;
                    }
                }
            }
        });
    }
}
