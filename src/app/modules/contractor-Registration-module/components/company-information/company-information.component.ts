import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { DialogAlertsComponent } from './../../../../shared-module/components/dialog-alerts/dialog-alerts.component';
import { ContractorRegistrationService } from './../../services/contractor-Registration.service';
import { SaveAlertComponent } from './../../../../shared-module/components/save-alert.component';
import { RepositoryDialogComponent } from './../../dialogs/repository-dialog/repository-dialog.component';
import { DialogService } from '@progress/kendo-angular-dialog';
import { CompanyInformation, SelectApplicationModel } from './../../models/data-model';
import { Component, OnInit, OnDestroy, HostListener, ViewChild, AfterViewInit, ElementRef, Renderer2, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { AuthenticationService, PageAccess, SessionUser } from 'src/app/core/services/authentication.service';
import { CorrectionRequestComments, DeviceObj, LoginUser } from 'src/app/core/models/user.model';
import { Abbriviation, ApprovalJson, CompanyDetails, CompanyType, Frenchise, Vendor } from './company-interface.model';
import { CompanyService } from './company.service';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { UniversalService } from 'src/app/core/services/universal.service';
import * as moment from 'moment';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
@Component({
    selector: 'app-company-information',
    templateUrl: './company-information.component.html',
    styleUrls: ['./company-information.component.scss'],
})
export class CompanyInformationComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;
    public loadFormHTML: boolean = false;
    public radioFlag: boolean = false;
    public registerForm: FormGroup;
    public submitted: boolean = false;
    public marked: boolean = true;
    public dbaName: boolean = true;
    public companyData: CompanyDetails;
    public vendors: Vendor[];
    public forwardedData: CompanyDetails;
    public dataForApprovalContractorApproval: CompanyDetails;
    public revertData: CompanyDetails;
    public supportedFlgFormControl: FormControl[];
    public preferredFlgFormControl: FormControl[];
    public selectedRadio: number;
    private saveJSON: Subscription;
    public objProgram = new SelectApplicationModel();
    public accountId: number;
    public resourceId: number;
    public countryId: number;
    public formDirtyState: boolean = false;
    public federalBinNumberMask: string = '00-0000000';
    public crComments: CorrectionRequestComments[];
    @ViewChild('dropdownlist', { static: false }) public dropdownlist: DropDownListComponent;
    public Frenchise: Frenchise[] = [];
    public FrenchiseData: Frenchise[];
    public Abbreviationlist: Abbriviation[] = [];
    public AbbreviationlistData: Abbriviation[];
    public defaultItemFranchise: Frenchise = { FranchiseName: 'Select Franchise Affiliation', FranchiseID: null };
    public taxLabel: string;
    public min: Date = new Date(1900, 0, 1);
    public max: Date = new Date(Date.now());
    public loginDetails: Array<SessionUser> = [];
    public toggleBackButton: boolean = true;
    public url: string;
    public approvalGetObject: ApprovalJson;
    public isdis: boolean = true;

    public loggedInUserType: string;
    public ContrID: number;
    public readonlyMode: boolean = false;
    public prefFlag: boolean;
    public $pagePrivilege: PageAccess = { readonlyAccess: false, editAccess: true };
    public hidePage: boolean = false;
    public deviceInfo: DeviceObj;
    public pageContent: any;
    public json = {
        CompanyName: false,
        CompanyLegalName: false,
        WebSite: false,
        ContractorFederalTaxNumber: false,
        ContractorFranchiseSelectedNumber: false,
        ContractorCountryCode: false,
        ContractorXactNetAddress: false,
        ContractorSymbilityAddress: false,
        ContractorOpeningDate: false,
        ContractorPercentOfOverallBusinessSubContracted: false,
        CountOfEmployeesInContractorCompany: false,
        ContractorCentralHeardMethod: false,
        ContractorEmployeeUniformFlag: false,
        ContractorEmployeeIdentificationFlag: false,
        WorkersCompanyMinimumRequirementFlag: false,
        ContractorMoistureData: [],

        // for disable functionality
        IsCompanyNameDisable: false,
        IsCompanyLegalNameDisable: false,
        IsContractorCentralHeardMethodDisable: false,
        IsContractorCountryCodeDisable: false,
        IsContractorFederalTaxNumberDisable: false,
        IsContractorFranchiseSelectedNumberDisable: false,
        IsContractorOpeningDateDisable: false,
        IsContractorPercentOfOverallBusinessSubContractedDisable: false,
        IsContractorSymbilityAddressDisable: false,
        IsContractorXactNetAddressDisable: false,
        IsCountOfEmployeesInContractorCompanyDisable: false,
        IsContractorEmployeeIdentificationFlagDisable: false,
        IsContractorEmployeeUniformFlagDisable: false,
        IsWorkersCompanyMinimumRequirementFlagDisable: false,
        IsWebSiteDisable: false,
        IsContractorMoistureDataDisable: false,
        IsContractorMoistureSupportedDataDisable: false
    };
    public visualCueObject = this.json;
    public approvalJSONCue = this.json;
    public approvalGetObjectUnchanged: ApprovalJson;
    constructor(
        private _srvCompany: CompanyService,
        private formBuilder: FormBuilder,
        private _route: Router,
        private _srvDialog: DialogService,
        private _srvContractor: ContractorRegistrationService,
        public _srvAuth: AuthenticationService,
        private _srvUniversal: UniversalService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        private renderer: Renderer2,
        private intlService: IntlService
    ) {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.defaultItemFranchise.FranchiseName = this.pageContent.Company_Info.Select_Franchise_Affiliation;
    }

    @HostListener('window:beforeunload')
    canDeactivate(): boolean {
        if (this.formDirtyState === true) {
            return false;
        } else {
            return true;
        }
    }
    @HostListener('mousedown')
    onMousedown(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    @HostListener('mouseup')
    onMouseup(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
    public async ngOnInit() {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService> this.intlService).localeId = this._srvAuth.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.crComments = await this._srvContractorData.getPageComments('Company Information');
        this.callMain();
    }

    ngAfterViewInit() {
        // layout data
        this._srvUniversal.gridLayout.subscribe((layout: any) => { });
        this.deviceInfo = this._srvUniversal.deviceResolution();
    }

    public callMain() {
        this.loginDetails = [];
        this.loggedInUserType = this._srvAuth.LoggedInUserType;
        this.loginDetails = Array(this._srvAuth.Profile);
        if (this.loginDetails) {
            this.resourceId = this.loginDetails[0].ResourceID;
            this.countryId = this.loginDetails[0].CountryID;
            this.ContrID = this.loginDetails[0].ContrID;
            if (this.countryId === 1) {
                this.taxLabel = this.pageContent.Company_Info.Federal_Tax_ID;
            } else if (this.countryId === 2) {
                this.taxLabel = this.pageContent.Company_Info.Bin_Number;
            }

            if (this.ContrID === 0 && this.loggedInUserType === 'Internal') {
                this.readonlyMode = true;
            }
        }
        this.financialData();
    }

    public async getPendingApprovalData() {
        const res: EditContractor[] = await this._srvCompany.GetEventPageJson(this.loginDetails[0].ContrID, this.resourceId, this.loginDetails[0].CCOpsID);
        this.approvalGetObject =
            res.length > 0 && res[0].CCOpsData && JSON.parse(res[0].CCOpsData).ContractorData.CompanyDetails
                ? JSON.parse(res[0].CCOpsData).ContractorData.CompanyDetails
                : res.length > 0 && res[0].CCOpsData && JSON.parse(res[0].CCOpsData).ContractorData.CompanyDetails
                    ? JSON.parse(res[0].CCOpsData).ContractorData.CompanyDetails
                    : {};
        if (this.approvalGetObject.ContractorMoistureData) {
            this.approvalGetObject.ContractorMoistureData.forEach((el) => (el.pendingFlag = true));
        }
        this.visualCueProcess();
    }

    public visualCueProcess() {
        this.approvalGetObjectUnchanged = JSON.parse(JSON.stringify(this.approvalGetObject));
        if (this.approvalGetObject.ContractorMoistureData) {
            this.revertData.CompanyDetails.ContractorMoistureData.forEach((item1) =>
                this.approvalGetObject.ContractorMoistureData.map((item2) => {
                    if (item2.PreferredFlag !== item1.PreferredFlag && item2.VendorNumber === item1.VendorNumber) {
                        item2.visualPrefCue = true;
                    }
                    if (item2.SupportedFlag !== item1.SupportedFlag && item2.VendorNumber === item1.VendorNumber) {
                        item2.visualSupCue = true;
                    }
                })
            );
        }

        if (this.approvalGetObject.hasOwnProperty('ContractorMoistureData')) {
            this.approvalGetObject.ContractorMoistureData.forEach((t) => {
                for (const [idx, obj] of this.forwardedData.CompanyDetails.ContractorMoistureData.entries()) {
                    if (obj.VendorNumber === t.VendorNumber) {
                        this.forwardedData.CompanyDetails.ContractorMoistureData[idx] = { ...this.forwardedData.CompanyDetails.ContractorMoistureData[idx], ...t };
                        return;
                    }
                }
                this.forwardedData.CompanyDetails.ContractorMoistureData.push(t);
            });
        }
        if (!this.approvalGetObject.ContractorMoistureData) {
        } else {
            this.approvalGetObject.ContractorMoistureData = this.forwardedData.CompanyDetails.ContractorMoistureData;
        }

        this.revertData.CompanyDetails.ContractorMoistureData.forEach((ele, ind) => {
            this.visualCueObject.ContractorMoistureData[ind].VendorNumber = ele.VendorNumber;
        });
        this.approvalJSONCue = JSON.parse(JSON.stringify(this.approvalGetObject));
        Object.keys(this.approvalJSONCue).map((key) => {
            if (key !== 'ContractorMoistureData' && !key.includes('Disable')) {
                this.approvalJSONCue[key] = true;
            }
        });
        if (this.approvalJSONCue.ContractorMoistureData) {
            this.approvalJSONCue.ContractorMoistureData = this.approvalJSONCue.ContractorMoistureData.filter((el) => el.pendingFlag === true);
            this.approvalJSONCue.ContractorMoistureData.forEach((moistData) => {
                moistData.visualPrefCue = true;
                moistData.visualSupCue = true;
                const moistureDataVCIndex = this.visualCueObject.ContractorMoistureData.findIndex((vc) => vc.VendorNumber === moistData.VendorNumber);
                if (moistureDataVCIndex !== -1) {
                    this.visualCueObject.ContractorMoistureData[moistureDataVCIndex] = moistData;
                }
            });
            delete this.approvalJSONCue.ContractorMoistureData;
        }
        this.visualCueObject = { ...this.visualCueObject, ...this.approvalJSONCue };
        this.visualCueObject.ContractorMoistureData = this.visualCueObject.ContractorMoistureData.sort((a, b) => {
            return a.VendorNumber - b.VendorNumber;
        });

        const mergedData = { ...this.forwardedData.CompanyDetails, ...this.approvalGetObject };
        this.forwardedData = { CompanyDetails: mergedData };
        this.dataForApprovalContractorApproval = JSON.parse(JSON.stringify(this.forwardedData));
        if (typeof this.visualCueObject.ContractorFranchiseSelectedNumber !== 'boolean') {
            mergedData.ContractorFranchiseSelectedNumber = null;
        } else {
            if (typeof mergedData.ContractorFranchiseSelectedNumber !== 'number') {
                mergedData.ContractorFranchiseSelectedNumber = null;
            }
        }
        this.patchCompanyForm();
    }

    public objectsAreSame(x, y) {
        let objectsAreSame = true;
        for (const propertyName in x) {
            if (x[propertyName] !== y[propertyName]) {
                objectsAreSame = y[propertyName];
                break;
            }
        }
        return objectsAreSame;
    }
    // fetching dropdown values and initializing form
    public async financialData() {
        const text = {
            CompanyDetails: {
                CompanyName: null,
                CompanyLegalName: null,
                WebSite: null,
                ContractorFederalTaxNumber: null,
                ContractorFranchiseSelectedNumber: null,
                ContractorCountryCode: null,
                ContractorXactNetAddress: null,
                ContractorSymbilityAddress: null,
                ContractorOpeningDate: null,
                ContractorPercentOfOverallBusinessSubContracted: null,
                ContractorCentralHeardMethod: null,
                CountOfEmployeesInContractorCompany: null,
                ContractorEmployeeUniformFlag: false,
                ContractorEmployeeIdentificationFlag: false,
                WorkersCompanyMinimumRequirementFlag: false,
                ContractorMoistureData: [],
            },
        };
        this.companyData = text;
        const res: CompanyType = await this._srvCompany.GetCompanyType();
        this.FrenchiseData = res.frenchise;
        this.Frenchise = this.FrenchiseData.slice();
        this.AbbreviationlistData = res.abbreviationlist;
        this.Abbreviationlist = this.AbbreviationlistData.slice();
        this.vendors = res.vendors;

        // if moisture data set dynamically
        this.vendors.forEach((element) => {
            const objMosture = {
                visualPrefCue: false,
                visualSupCue: false,
                VendorNumber: 0,
            };
            this.visualCueObject.ContractorMoistureData.push(objMosture);
        });

        this.vendors.forEach(() => {
            this.companyData.CompanyDetails.ContractorMoistureData.push({
                SupportedFlag: false,
            });
        });
        this.vendors = this.vendors.sort((a, b) => {
            return a.VendorID - b.VendorID;
        });
        this.supportedFlgFormControl = this.vendors.map((control) => new FormControl(''));

        this.registerForm = this.formBuilder.group({
            CompanyName: [''],
            CompanyLegalName: ['', Validators.required],
            WebSite: ['', Validators.pattern(/^((https?|ftp|smtp):\/\/)?(www.)?[a-zA-Z0-9À-ú]+(\.[a-zA-Z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/)],
            ContractorFederalTaxNumber: ['', [Validators.required, Validators.minLength(9)]],
            ContractorFranchiseSelectedNumber: [''],
            ContractorCountryCode: ['', Validators.required],
            ContractorXactNetAddress: [''],
            ContractorSymbilityAddress: [''],
            ContractorOpeningDate: ['', Validators.required],
            ContractorPercentOfOverallBusinessSubContracted: [null, Validators.required],
            CountOfEmployeesInContractorCompany: [null, Validators.required],
            ContractorCentralHeardMethod: ['', Validators.required],
            ContractorEmployeeUniformFlag: [false],
            ContractorEmployeeIdentificationFlag: [false],
            WorkersCompanyMinimumRequirementFlag: [false],
            SupportedFlag: new FormArray(this.supportedFlgFormControl),
            PreferredFlag: [''],
        });
        setTimeout(() => {
            this.registerForm.patchValue({
                ContractorCountryCode: this.countryId,
            });
        }, 1000);
        // fetch user access privilege
        if (this.loginDetails[0].ContrID > 0) {
            this.$pagePrivilege = this._srvAuth.getPageAccessPrivilege('Company Information');
            if (!this.$pagePrivilege.editAccess && this.$pagePrivilege.readonlyAccess) {
                this.registerForm.disable();
            } else if (!this.$pagePrivilege.editAccess && !this.$pagePrivilege.readonlyAccess) {
                this.hidePage = true;
            }
        }

        this.onChanges(); // form state check
        this.loadFormHTML = true;
        this.companyDetails();
    }

    public async companyDetails() {
        this.forwardedData = null;
        this.forwardedData = await this._srvCompany.GetCompanyDetails();
        // this condition is used when page is open by clicking contractor from internal user
        // and there is no data on company page (means contractor is in phase 1)
        if (this.forwardedData.CompanyDetails === null) {
            this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer);
        }
        const result = this.forwardedData;
        if (this.loginDetails[0].ContrID > 0 && this._srvAuth.Profile.EventName !== 'No Event') {
            this.toggleBackButton = true;
            this.revertData = JSON.parse(JSON.stringify(result));
            this.getPendingApprovalData();
        } else if (this.loginDetails[0].ContrID > 0 && this._srvAuth.Profile.EventName === 'No Event') {
            this.toggleBackButton = false;
            this.revertData = JSON.parse(JSON.stringify(result));
            this.getPendingApprovalData();
        } else {
            this.toggleBackButton = true;
            this._srvContractor.funcInternalUserGoDirectlyToContractorPage(result.CompanyDetails, 'CompanyDetails');
            this.forwardedData = result;
            if (this.forwardedData.CompanyDetails === null && this.loggedInUserType === 'Internal') return;
            this.revertData = result;
            this.patchCompanyForm();
        }
    }
    public patchCompanyForm() {
        if (this.forwardedData.hasOwnProperty('CompanyDetails') && this.forwardedData.CompanyDetails !== null) {
            if (this.forwardedData.CompanyDetails.CompanyName === this.forwardedData.CompanyDetails.CompanyLegalName) {
                this.dbaName = true;
                this.marked = true;
            } else {
                this.dbaName = false;
                this.marked = false;
                const companyName = this.registerForm.get('CompanyName');
                companyName.setValidators([Validators.required]);
            }

            this.companyData = this.forwardedData;
            this.companyData.CompanyDetails.ContractorMoistureData.sort((n1, n2) => n1.VendorNumber - n2.VendorNumber);
            this.radioFlag = true;
            const preferredArray = this.companyData.CompanyDetails.ContractorMoistureData;
            preferredArray.forEach((data, index) => {
                if (preferredArray[index].PreferredFlag === true) {
                    // radio button id is stored to select the radio button from the group in next step
                    this.selectedRadio = preferredArray[index].VendorNumber;
                }
            });

            this.registerForm.controls.PreferredFlag.patchValue(this.selectedRadio);
            const openingDate =
                this.companyData.CompanyDetails.ContractorOpeningDate !== null
                    ? this.companyData.CompanyDetails.ContractorOpeningDate.replace(new RegExp(/-/gm), '/')
                    : this.companyData.CompanyDetails.ContractorOpeningDate;
            this.registerForm.patchValue({
                CompanyName: this.companyData.CompanyDetails.CompanyName,
                CompanyLegalName: this.companyData.CompanyDetails.CompanyLegalName,
                WebSite: this.companyData.CompanyDetails.WebSite,
                ContractorFederalTaxNumber: this.companyData.CompanyDetails.ContractorFederalTaxNumber,
                ContractorFranchiseSelectedNumber: this.companyData.CompanyDetails.ContractorFranchiseSelectedNumber,
                ContractorXactNetAddress: this.companyData.CompanyDetails.ContractorXactNetAddress,
                ContractorSymbilityAddress: this.companyData.CompanyDetails.ContractorSymbilityAddress,
                ContractorOpeningDate:
                    this.companyData.CompanyDetails.ContractorOpeningDate !== null && this.companyData.CompanyDetails.ContractorOpeningDate !== 'Invalid date' ? new Date(openingDate) : null,
                ContractorPercentOfOverallBusinessSubContracted: this.companyData.CompanyDetails.ContractorPercentOfOverallBusinessSubContracted,
                CountOfEmployeesInContractorCompany: this.companyData.CompanyDetails.CountOfEmployeesInContractorCompany,
                ContractorCentralHeardMethod: this.companyData.CompanyDetails.ContractorCentralHeardMethod,
                ContractorEmployeeUniformFlag: this.companyData.CompanyDetails.ContractorEmployeeUniformFlag,
                ContractorEmployeeIdentificationFlag: this.companyData.CompanyDetails.ContractorEmployeeIdentificationFlag,
                WorkersCompanyMinimumRequirementFlag: this.companyData.CompanyDetails.WorkersCompanyMinimumRequirementFlag,
                SupportedFlag: this.companyData.CompanyDetails.ContractorMoistureData.map((control) => control.SupportedFlag),
            });
        }

        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer);
    }
    // form state being checked
    public onChanges(): void {
        this.registerForm.valueChanges.subscribe((val) => {
            if (val) {
                this.formDirtyState = true;
            }
        });
    }

    //  getter for easy access to form fields
    get companyInfoFormControl() {
        return this.registerForm.controls;
    }

    // toggler to check-uncheck kendo switch
    public toggleVisibility(e) {
        const companyLegalName = this.registerForm.get('CompanyLegalName').value;
        const companyName = this.registerForm.get('CompanyName');
        if (e.target.checked === true) {
            this.registerForm.patchValue({ CompanyName: companyLegalName });
            companyName.setValidators(null);
        } else {
            this.registerForm.patchValue({ CompanyName: null });
            companyName.setValidators([Validators.required]);
        }
        this.marked = e.target.checked;
    }

    // converting date
    public convertDate(date: string) {
        const enteredDate = new Date(date);
        const newdate = moment(enteredDate).format('YYYY-MM-DD');
        return newdate;
    }
    // submitting form
    public async onSubmit(target: HTMLElement) {
        this.submitted = true;
        // stop here if form is invalid
        if (this.registerForm.invalid) {
            target.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        const finalObject: CompanyInformation = Object.assign({}, this.registerForm.value);
        const contractorMoistureArray = [];
        this.vendors.forEach((element, index) => {
            contractorMoistureArray.push({
                VendorNumber: element.VendorID,
                PreferredFlag: finalObject['PreferredFlag'] === element.VendorID ? true : false,
                SupportedFlag: finalObject['SupportedFlag'][index],
            });
        });

        const newObj = {
            CompanyDetails: {
                CompanyName: finalObject['CompanyName'] === '' ? finalObject['CompanyLegalName'] : finalObject['CompanyName'],
                CompanyLegalName: finalObject['CompanyLegalName'],
                WebSite: finalObject['WebSite'],
                ContractorFederalTaxNumber: finalObject['ContractorFederalTaxNumber'],
                ContractorFranchiseSelectedNumber: finalObject['ContractorFranchiseSelectedNumber'],
                ContractorCountryCode: finalObject['ContractorCountryCode'],
                ContractorXactNetAddress: finalObject['ContractorXactNetAddress'],
                ContractorSymbilityAddress: finalObject['ContractorSymbilityAddress'],
                ContractorOpeningDate: this.convertDate(finalObject['ContractorOpeningDate']),
                ContractorPercentOfOverallBusinessSubContracted: parseInt(finalObject['ContractorPercentOfOverallBusinessSubContracted'], 10),
                ContractorCentralHeardMethod: finalObject['ContractorCentralHeardMethod'],
                CountOfEmployeesInContractorCompany: parseInt(finalObject['CountOfEmployeesInContractorCompany'], 10),
                ContractorEmployeeUniformFlag: finalObject['ContractorEmployeeUniformFlag'],
                ContractorEmployeeIdentificationFlag: finalObject['ContractorEmployeeIdentificationFlag'],
                WorkersCompanyMinimumRequirementFlag: finalObject['WorkersCompanyMinimumRequirementFlag'],
                ContractorMoistureData: contractorMoistureArray,
            },
        };
        if (this.loggedInUserType === 'Internal') {
            this.sendJsonInternalEmployee(newObj);
            return;
        }

        if (this.loginDetails[0].ContrID > 0) {
            let approvalObject: any;
            approvalObject = this._srvContractor.differenceCompany(newObj.CompanyDetails, this.revertData.CompanyDetails, this.approvalGetObject);
            if (approvalObject.hasOwnProperty('CompanyLegalName') === true && this.marked === true) {
                approvalObject['CompanyName'] = approvalObject['CompanyLegalName'];
            }
            const moistureDataObj = [];
            if (this.approvalGetObjectUnchanged.hasOwnProperty('ContractorMoistureData') || this.revertData.CompanyDetails.ContractorMoistureData) {
                let pendingMoistureData: any;
                if (this.approvalGetObjectUnchanged.hasOwnProperty('ContractorMoistureData')) {
                    pendingMoistureData = this.approvalGetObjectUnchanged.ContractorMoistureData.filter((el) => el.pendingFlag === true);
                }
                newObj.CompanyDetails.ContractorMoistureData.forEach((el, ind) => {
                    if (this.approvalGetObjectUnchanged.hasOwnProperty('ContractorMoistureData')) {
                        if (pendingMoistureData.some((pendingEl) => pendingEl.VendorNumber === el.VendorNumber)) {
                            const pendingIndex = pendingMoistureData.findIndex((pendingEl) => pendingEl.VendorNumber === el.VendorNumber);
                            if (
                                newObj.CompanyDetails.ContractorMoistureData[ind].SupportedFlag !== pendingMoistureData[pendingIndex].SupportedFlag ||
                                newObj.CompanyDetails.ContractorMoistureData[ind].PreferredFlag !== pendingMoistureData[pendingIndex].PreferredFlag
                            ) {
                                const obj = {
                                    SupportedFlag: newObj.CompanyDetails.ContractorMoistureData[ind].SupportedFlag,
                                    VendorNumber: newObj.CompanyDetails.ContractorMoistureData[ind].VendorNumber,
                                    PreferredFlag: newObj.CompanyDetails.ContractorMoistureData[ind].PreferredFlag,
                                };
                                moistureDataObj.push(obj);
                            }
                        } else if (this.revertData.CompanyDetails.ContractorMoistureData.some((dbEl) => dbEl.VendorNumber === el.VendorNumber)) {
                            const dbIndex = this.revertData.CompanyDetails.ContractorMoistureData.findIndex((dbEl) => dbEl.VendorNumber === el.VendorNumber);
                            if (
                                newObj.CompanyDetails.ContractorMoistureData[ind].SupportedFlag !== this.revertData.CompanyDetails.ContractorMoistureData[dbIndex].SupportedFlag ||
                                newObj.CompanyDetails.ContractorMoistureData[ind].PreferredFlag !== this.revertData.CompanyDetails.ContractorMoistureData[dbIndex].PreferredFlag
                            ) {
                                const obj = {
                                    SupportedFlag: newObj.CompanyDetails.ContractorMoistureData[ind].SupportedFlag,
                                    VendorNumber: newObj.CompanyDetails.ContractorMoistureData[ind].VendorNumber,
                                    PreferredFlag: newObj.CompanyDetails.ContractorMoistureData[ind].PreferredFlag,
                                };
                                moistureDataObj.push(obj);
                            }
                        }
                    } else if (this.revertData.CompanyDetails.ContractorMoistureData.some((dbEl) => dbEl.VendorNumber === el.VendorNumber)) {
                        const dbIndex = this.revertData.CompanyDetails.ContractorMoistureData.findIndex((dbEl) => dbEl.VendorNumber === el.VendorNumber);
                        if (
                            newObj.CompanyDetails.ContractorMoistureData[ind].SupportedFlag !== this.revertData.CompanyDetails.ContractorMoistureData[dbIndex].SupportedFlag ||
                            newObj.CompanyDetails.ContractorMoistureData[ind].PreferredFlag !== this.revertData.CompanyDetails.ContractorMoistureData[dbIndex].PreferredFlag
                        ) {
                            const obj = {
                                SupportedFlag: newObj.CompanyDetails.ContractorMoistureData[ind].SupportedFlag,
                                VendorNumber: newObj.CompanyDetails.ContractorMoistureData[ind].VendorNumber,
                                PreferredFlag: newObj.CompanyDetails.ContractorMoistureData[ind].PreferredFlag,
                            };
                            moistureDataObj.push(obj);
                        }
                    }
                });

                if (moistureDataObj.length > 0) {
                    approvalObject.ContractorMoistureData = moistureDataObj;
                } else {
                    delete approvalObject.ContractorMoistureData;
                }
            }
            const combinedObj = { ...approvalObject };
            let result: number;
            if (Object.keys(combinedObj).length) {
                result = await this._srvContractorData.saveContractorData(
                    { currentPage: 'Company Information Page', nextPage: 'contact-information' },
                    { CompanyDetails: combinedObj },
                    'CompanyInfo/EditEventCompanyInfo'
                );
            } else {
                result = await this._srvContractorData.saveContractorData({ currentPage: 'Company Information Page', nextPage: 'contact-information' }, null, 'CompanyInfo/EditEventCompanyInfo');
            }
            if (result === 1) {
                this.crComments = await this._srvContractorData.getPageComments('Company Information');
                if (this._srvAuth.Profile.EventName === 'No Event') {
                    this.submitted = false;
                    this.visualCueObject.ContractorMoistureData = [];
                    this.callMain();
                } else {
                    if (this._srvAuth.Profile.EventName !== 'Profile Changes Correction Request') {
                        this._route.navigate(['/contractorRegistration/contact-information']);
                    } else {
                        this.callMain();
                    }
                }
            } else {
                this.unsuccess();
            }
            return;
        }

        const sendingObj: CompanyDetails = newObj;
        if (this.loginDetails[0].ContrID === 0) {
            (sendingObj['ResourceId'] = this.loginDetails[0].ResourceID), (sendingObj['CCopsId'] = this.loginDetails[0].CCOpsID), (sendingObj['LastPageVisited'] = 'contact-information');
        }
        const response = await this._srvCompany.SaveData(sendingObj);
        if (response === 1) {
            this._route.navigate(['/contractorRegistration/contact-information']);
        }
    }

    public async sendJsonInternalEmployee(companyForm) {
        const dbData = this.dataForApprovalContractorApproval;
        const approvalObject: any = this._srvContractor.differenceCompany(companyForm.CompanyDetails, dbData.CompanyDetails, {});

        if (approvalObject.hasOwnProperty('CompanyLegalName') === true && this.marked === true) {
            approvalObject['CompanyName'] = approvalObject['CompanyLegalName'];
        }
        let objectsAreSame = true;
        const ContractorMoistureData = [];
        companyForm.CompanyDetails.ContractorMoistureData.forEach((el, index) => {
            if (
                companyForm.CompanyDetails.ContractorMoistureData[index].SupportedFlag !== dbData.CompanyDetails.ContractorMoistureData[index].SupportedFlag ||
                companyForm.CompanyDetails.ContractorMoistureData[index].PreferredFlag !== dbData.CompanyDetails.ContractorMoistureData[index].PreferredFlag
            ) {
                objectsAreSame = false;

                const obj = {
                    SupportedFlag: companyForm.CompanyDetails.ContractorMoistureData[index].SupportedFlag,
                    VendorNumber: companyForm.CompanyDetails.ContractorMoistureData[index].VendorNumber,
                    PreferredFlag: companyForm.CompanyDetails.ContractorMoistureData[index].PreferredFlag,
                };
                ContractorMoistureData.push(obj);
            }
        });

        if (ContractorMoistureData.length > 0) {
            approvalObject.ContractorMoistureData = ContractorMoistureData;
        } else {
            delete approvalObject.ContractorMoistureData;
        }

        if (typeof approvalObject.ContractorFranchiseSelectedNumber !== 'number') {
            delete approvalObject.ContractorFranchiseSelectedNumber;
        }

        this.objProgram.Contr_ID = this.ContrID;
        this.objProgram.ResourceId = this.resourceId;
        this.objProgram.CCOpsID = this.loginDetails[0].CCOpsID;
        this.objProgram.ContractorResourceNumber = this._srvAuth.Profile.ContractorResourceID;
        this.objProgram.ContractorResourceID = this._srvAuth.Profile.ContractorResourceID;
        this.objProgram.CCOpsData = JSON.stringify({ CompanyDetails: approvalObject });
        this.objProgram.PageName = 'Company Information Page';
        const res: number = await this._srvCompany.saveInternalData(this.objProgram);
        if (res === 1) {
            this.submitted = false;
            this.callMain();
        } else {
            this.unsuccess();
        }
        return;
    }

    // photo repository function
    public onRepositoryOpen() {
        const dialogRef = this._srvDialog.open({
            content: RepositoryDialogComponent,
            width: 700,
        });
        const contractorInfo = dialogRef.content.instance;
        dialogRef.result.subscribe((result) => { });
    }
    // previous page navigation function
    public async onBackClick() {
        if (this.loginDetails[0].ContrID === 0 && this.loggedInUserType === 'Internal') {
            const res: number = await this._srvContractor.saveLastPageVisited('select-program');
            if (res === 1) {
                this._route.navigate(['/contractorRegistration/select-program']);
            }
            return;
        }
        if (this.registerForm.dirty) {
            const dialogRef = this._srvDialog.open({
                content: SaveAlertComponent,
            });
            const dialog = dialogRef.content.instance;
            dialog.header = this.pageContent.Job_Volume_Info.Warning; // 'Warning';
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                <h2>${this.pageContent.General_Keys.Global_Alert_Data_Unsaved} </h2>
                                <p>${this.pageContent.General_Keys.Global_Alert_Data_Unsaved_Stmt}</p>
                            </div>
                            `;
            dialogRef.result.subscribe((res) => {
                if (res['button'] === 'Yes') {
                    this.onBackClickFunction();
                }
            });
        } else {
            this.onBackClickFunction();
        }
    }
    // readonly mode next page _route
    public nextPage() {
        this._route.navigate(['/contractorRegistration/contact-information']);
    }
    public async onBackClickFunction() {
        if (this.loginDetails[0].ContrID === 0) {
            const res: number = await this._srvContractor.saveLastPageVisited('select-program');
            if (res === 1) {
                this._route.navigate(['/contractorRegistration/select-program']);
            }
        } else {
        }
    }

    // Franchise Filter
    public handleFilterFranchise(value) {
        this.Frenchise = this.FrenchiseData.filter((s) => s.FranchiseName.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    // numeric character validator
    public isNumber(evt) {
        const charCode = evt.which ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    // focus dropdown
    public onFocus(event: any) {
        // Close the list if the component is no longer focused
        setTimeout(() => {
            if (this.dropdownlist.wrapper.nativeElement.contains(document.activeElement)) {
                this.dropdownlist.toggle(true);
            }
        });
    }

    public unsuccess() {
        this.callMain();
        const dialogRef = this._srvDialog.open({
            content: DialogAlertsComponent,
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>Something went wrong. Please try again later!</p>
                                </div>
                            `;
    }

    // unsubscribe services
    public ngOnDestroy(): void {
        if (this.saveJSON) {
            this.saveJSON.unsubscribe();
        }
    }
}
