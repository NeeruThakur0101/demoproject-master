import { AuthenticationService, PageAccess } from './../../../../core/services/authentication.service';
import { Component, ViewChild, ElementRef, OnInit, ViewContainerRef } from '@angular/core';
import { CoverageProfileService } from './coverage-profile.service';
import { CoverageProfilePage, ProfileCoverageObject, CoverageProfile, State, County, PostalCode, CoverageException, DataToSend, CounterVisualCue, ProfileDataStatus } from './models';
import { CopyCoverageProfileComponent } from '../../dialogs/copy-coverage-profile/copy-coverage-profile.component';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
import { DialogService } from '@progress/kendo-angular-dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AddProfileCoverageDialogComponent } from '../../dialogs/add-profile-coverage-dialog/add-profile-coverage-dialog/add-profile-coverage-dialog.component';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { CorrectionRequestComments } from 'src/app/core/models/user.model';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-coverage-profile',
    templateUrl: './coverage-profile.component.html',
})
export class CoverageProfileComponent implements OnInit {
    Page: CoverageProfilePage = { loadingState: true, pageAccess: true };
    @ViewChild('allCounties') allCountiesCheckbox: ElementRef;
    @ViewChild('allPostalCodes') allPostalCodeCheckbox: ElementRef;
    @ViewChild('CdkVirtualScrollViewport') virtualScrollViewport: CdkVirtualScrollViewport;
    @ViewChild('litigacy') statesTab: ElementRef;
    @ViewChild('bankruptcy') countiesTab: ElementRef;
    @ViewChild('BusinessLicences') postalCodesTab: ElementRef;

    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;
    public pageContent: any;
    public crComments: CorrectionRequestComments[];
    public activeAccord = '';
    public createButton: boolean;
    public copyButton: boolean;
    public deleteButton: boolean;
    public saveButton: boolean;
    public allStatesDisabled: boolean;
    public allCountyDisabled: boolean;
    public allPostalDisabled: boolean;
    public allStatesCheckbox: boolean;
    private pagination: number = 1;
    private isMaxPostalLength: boolean = false;
    public totalCoveredPostal: number = 0;
    public totalUncoveredPostal: number = 0;
    private dataToSend: DataToSend;
    private stateDataToSend: DataToSend;
    private timeout: any;
    private isAllPostalCheck: boolean = null;
    postalAllCheckBox: HTMLInputElement;
    private isPostalTabOpen: boolean = false;
    private isCreateProfile: boolean;
    public counterCue: CounterVisualCue = { state: false, county: false, postalCode: false };
    public $pagePrivilege: PageAccess = { readonlyAccess: false, editAccess: false };
    public counterStats = { stateCount: 0, countyCount: 0, postalCoveredCount: 0, postalUncoveredCount: 0 };
    public postalChangesId: Array<{ CountyRegionID: number; PostalId: string }> = [];
    public checkedState: number[] = [];
    public uncheckedCountyIds: number[];
    public stateIDsOfUncheckedCounties: number[];
    public countyList: number[] = [];
    public countyID: number[] = [];
    public stateId: number[] = [];
    public stateProvinceID: number[] = [];
    public profileDataStatus: ProfileDataStatus[];

    constructor(
        public _srvCoverageProfile: CoverageProfileService,
        private _route: Router,
        private _dialog: DialogService,
        private _activatedRoute: ActivatedRoute,
        private _srvContractorRegistration: ContractorRegistrationService,
        private _srvAuthentication: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService
    ) {
        // Check if user loggedIn
        this._srvCoverageProfile.validateUser();

        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }

    async ngOnInit() {
        this._srvCoverageProfile.PageObject = [];
        this.crComments = await this._srvContractorData.getPageComments('Profile Coverage');
        this.$pagePrivilege = this._srvAuthentication.getPageAccessPrivilege('Coverage Profile Information');
        if (!this.$pagePrivilege.editAccess && !this.$pagePrivilege.readonlyAccess && this._srvCoverageProfile.Profile.ContrID > 0) {
            this.accessDenied();
            return;
        }
        // Loading States & CoverageProfiles
        await this.StateProfileData();

        // Conditional get data for [prospect contractor] else for [registered contractor] / [Internal User]
        if (this._srvCoverageProfile.Profile.ContrID === 0) {
            const data = await this._srvCoverageProfile.getPageJSONData();

            this._srvContractorRegistration.funcInternalUserGoDirectlyToContractorPage(data.CoverageProfileInformation, 'LegalIssueDetails');

            this.Page.DB_JSON = data.CoverageProfileInformation ? data.CoverageProfileInformation : [];

            if (this._srvCoverageProfile.Profile.UserType === 'Internal' && !this.Page.DB_JSON.length) {
                this._srvContractorRegistration.funcInternalUserGoDirectlyToContractorPage(this.Page.DB_JSON, 'CoverageProfileInformation');
            }
        } else {
            // Get ProfileCoverages saved in DataBase
            this.Page.DB_JSON = (await this._srvCoverageProfile.getPageJSONData()).CoverageProfileInformation;
            // Get ProfileCoverages pending for approval
            await this.getPendingData();
        }
        // Initial configuration to load if any
        this.loadConfigurationbyCoverageProfile(this.Page.SelectedProfile);
    }

    async getPendingData() {
        this.Page.Contractor_JSON = [];
        const coverageCount = await this._srvCoverageProfile.getCoverageListCount();
        const numberOfPages = this._srvCoverageProfile.getPaginationConfiguration(coverageCount);

        for (let i = 0; i < numberOfPages; i++) {
            // Get ProfileCoverages pending for approval
            let contractorChanges = await this._srvCoverageProfile.getContractorChanges(i + 1);

            // Check if data pending for approval.
            contractorChanges = contractorChanges.length && contractorChanges[0].CCOpsData ? JSON.parse(contractorChanges[0].CCOpsData).ContractorData : null;
            const pendingData = contractorChanges ? JSON.parse(JSON.stringify(contractorChanges.CoverageProfileInformation)) : [];
            this.Page.Contractor_JSON = [...pendingData, ...this.Page.Contractor_JSON];
        }
    }

    // to wait for the postalcode api to hit on scroll down
    debounce(event) {
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            this.scrollToBottom(event);
        }, 200);
    }
    // api call on scroll to bottom of postal code
    async scrollToBottom(event) {
        if (event.target.scrollHeight - event.target.clientHeight - 1 < event.target.scrollTop && this.isMaxPostalLength) {
            //added condition this.Page.PostalCodes[0] && to avoid undefined
            if (this.Page.PostalCodes[0] && this.Page.PostalCodes.length !== this.Page.PostalCodes[0].TotalPostalCodesCount) {
                this.pagination = this.pagination + 1;
                await this.getPostalCodes(this.stateProvinceID.toString(), this.countyID.toString(), this.pagination);
            } else {
                return;
            }
        }
    }

    // Get stateProfile data on dropdown list & state tab
    async StateProfileData() {
        // Get states and profiles data from CoverageProfileService
        const StateProfiles = await this._srvCoverageProfile.getStateProfileData();
        // Assign CoverageProfiles & Set selected profile to General
        this.Page.CoverageProfiles = StateProfiles.CoverageProfileTypeName;
        // Initialize all coverage profile disable false
        this.Page.CoverageProfiles.forEach((p) => (p.disable = false));
        // Assign States
        this.Page.States = StateProfiles.State;
        // Initialize all states checkbox to false
        this.Page.States.forEach((s) => {
            s.checked = false;
            s.pendingApproval = false;
        });
        // Find if coverage profile id
        const id = +this._activatedRoute.snapshot.params.id;
        if (!isNaN(id)) {
            const profile = this.Page.CoverageProfiles.find((p) => p.ContractorCoverageTypeID === id);
            if (profile) {
                this.Page.SelectedProfile = profile;
            } else {
                this.Page.SelectedProfile = this.Page.CoverageProfiles.find((cp) => cp.ContractorCoverageTypeTitle === 'General');
            }
            return;
        }

        this.Page.SelectedProfile = this.Page.CoverageProfiles.find((cp) => cp.ContractorCoverageTypeTitle === 'General');
    }

    // Get Counties data on county tab
    async getCountiesByStateIDs(stateIDs: string) {
        // Show loader
        this.Page.loadingState = true;
        // Get counties data from CoverageProfileService by state IDs: string (,) separated
        const Counties = await this._srvCoverageProfile.getCountiesByStateIDs(stateIDs);
        // Initiating all new counties checkbox to false
        Counties.forEach((c) => (c.checked = false));
        // Clubbing with current counties on page
        this.Page.Counties = [...this.Page.Counties, ...Counties];
        // Sort by stateAbbrivation and then by county
        this.Page.Counties.sort((a, b) => (a.StateAbbreviation > b.StateAbbreviation ? 1 : b.StateAbbreviation > a.StateAbbreviation ? -1 : 0));
        // Sort by Name property of Counties
        // this.Page.Counties.sort((a, b) => (a.Name > b.Name ? 1 : b.Name > a.Name ? -1 : 0));

        // Hide loader
        this.Page.loadingState = false;
    }

    // Get ProfileData data on postal code tab
    async getPostalCodes(stateIDs: string, countyIDs: string, PageNo: number) {
        // Show loader
        this.Page.loadingState = true;
        // Get PostalCodes data from CoverageProfileService by state & county IDs: string (,) separated
        const PostalCodes = await this._srvCoverageProfile.getPostalCodesByStatesAndCountiesIDs(stateIDs, countyIDs, PageNo, this.Page.SelectedProfile.ContractorCoverageTypeID);
        // Clubbing with current postalCodes on page
        PostalCodes.map((postal) => {
            if (this.isAllPostalCheck !== null) {
                postal.IsChecked = this.isAllPostalCheck;
            }
        });
        this.Page.PostalCodes = [...this.Page.PostalCodes, ...PostalCodes];
        // phase one internal disable
        if (this._srvCoverageProfile.Profile.ContrID === 0 && this._srvCoverageProfile.Profile.UserType === 'Internal') {
            this.Page.PostalCodes.map((postalcode) => (postalcode.disable = true));
        }
        //disable postal code for read access
        if (this._srvCoverageProfile.Profile.ContrID > 0 && !this.$pagePrivilege.editAccess && this.$pagePrivilege.readonlyAccess) this.Page.PostalCodes.map((p) => (p.disable = true));

        if (this._srvCoverageProfile.Profile.ContrID !== 0 && !this.isCreateProfile) {
            this.dataBindingPhaseTwo(this.Page.SelectedProfile.ContractorCoverageTypeID);
            this.visualCueOnLoad(this.Page.SelectedProfile.ContractorCoverageTypeID);
            this.disableInEvent(this.Page.SelectedProfile.ContractorCoverageTypeID);
            this.disablePhaseTwoForInternal();
        }

        //counter not to be updated after page 1
        if (PageNo === 1) {
            this.totalCoveredPostal = this.Page.PostalCodes[0].ContractorPostalCodeCoveredCount;
            this.totalUncoveredPostal = this.Page.PostalCodes[0].ContractorPostalCodeNotCoveredCount;
        }

        this.isMaxPostalLength = this.Page.PostalCodes.length >= 2000 ? true : false;
        // Sort by CountyRegionName property of postalCodes
        if (this._srvCoverageProfile.Profile.CountryID === 1) {
            this.Page.PostalCodes.sort((a, b) => (a.CountyRegionName > b.CountyRegionName ? 1 : b.CountyRegionName > a.CountyRegionName ? -1 : 0));
        } else {
            this.Page.PostalCodes.sort((a, b) => (a.PostalId > b.PostalId ? 1 : b.PostalId > a.PostalId ? -1 : 0));
        }

        // Hide loader
        this.Page.loadingState = false;
    }

    //to disable profile data in phase 1 for internal
    disablePhaseOneForInternal() {
        if (this._srvCoverageProfile.Profile.UserType === 'Internal') {
            this.Page.States.map((state) => (state.disable = true));
            this.Page.Counties.map((county) => (county.disable = true));
            this.Page.PostalCodes.map((postalcode) => (postalcode.disable = true));
            this.allStatesDisabled = true;
            this.allCountyDisabled = true;
            this.allPostalDisabled = true;
        }
    }

    // to disable profile data in phase 2 for internal
    disablePhaseTwoForInternal() {
        if (this._srvCoverageProfile.Profile.UserType === 'Internal') {
            this.Page.States.map((state) => {
                if (state.pendingApproval) state.disable = true;
            });
            this.Page.Counties.map((county) => {
                if (county.pendingApproval) county.disable = true;
            });
            this.Page.PostalCodes.map((postalcode) => {
                if (postalcode.pendingApproval) postalcode.disable = true;
                this.allPostalDisabled = true;
            });
        }
    }

    // to disable event data in other events
    disableInEvent(profileId: number) {
        if (this.Page.Contractor_JSON.length && this._srvCoverageProfile.Profile.UserType !== 'Internal') {
            for (const coverageObj of this.Page.Contractor_JSON) {
                // disable only when isRowDisable is true and profile matches
                if (coverageObj.IsRowDisable && coverageObj.CoverageProfileTypeNumber === profileId) {
                    // disable create, copy, delete if any field is disable in event
                    this.createButton = true;
                    this.copyButton = true;
                    this.deleteButton = true;
                    // disable state from each object
                    this.Page.States.forEach((state) => {
                        if (state.ID === coverageObj.StateProvinceID) state.disable = true;
                    });
                    this.allStatesDisabled = true;
                    // disable county whenever county name matches, except for the case when state is removed
                    if (!coverageObj.hasOwnProperty('IsStateRemovedFlag')) {
                        this.Page.Counties.forEach((county) => {
                            if (county.ID === coverageObj.CountyRegionNumber) county.disable = true;
                        });
                        this.allCountyDisabled = true;
                    }
                    // postal code disable
                    if (coverageObj.hasOwnProperty('IsCountyCreatedObj')) {
                        this.Page.PostalCodes.forEach((p) => {
                            if (p.CountyRegionID === coverageObj.CountyRegionNumber) p.disable = true;
                        });
                        this.allPostalDisabled = true;
                    } else {
                        const filteredException = coverageObj.ContractorCoverageException.filter((res) => !res.IsIncludedFlag);
                        const mergeException = [...filteredException, ...coverageObj.ContractorCoverageIncludedException];
                        if (mergeException.length) {
                            for (const exception of mergeException) {
                                this.Page.PostalCodes.forEach((p) => {
                                    if (p.PostalId === exception.PostalNumber) p.disable = true;
                                });
                            }
                            this.allPostalDisabled = true;
                        }
                    }
                }
            }
        }
    }

    // to disable the deleted profile
    disableDeletedProfile(profileId: number) {
        if (this._srvCoverageProfile.Profile.ContrID !== 0) {
            // const { pendingData } = this.filterProfileData(profileId);
            for (const object of this.profileDataStatus) {
                if (object.IsProfileRemoved && object.CoverageProfileTypeNumber == profileId) {
                    //disable allcheck boxes
                    this.allStatesDisabled = true;
                    //disable create,copy and delete button
                    this.createButton = true;
                    this.copyButton = true;
                    this.deleteButton = true;
                    //disable save button
                    this.saveButton = true;
                    this.Page.States.forEach((s) => {
                        s.checked = false;
                        s.pendingApproval = false;
                    });
                    this.Page.Counties = [];
                    this.counterCue.state = false;
                    this.counterCue.county = false;
                    this.counterCue.postalCode = false;
                    this.validationAlertDialog(this.pageContent.Coverage_Profile.Alert_On_Deleted_Profile, 'moveToGeneral');
                    return false;
                }
            }
        }
        this.Page.loadingState = false;
        return true;
    }

    disableDeleteForGeneral(profileId: number) {
        // if all the other profiles are deleted and pending for approval disbale copy from general
        if (profileId === 1) {
            const isProfileRemoved = this.profileDataStatus.filter((res) => res.CoverageProfileTypeNumber !== profileId && res.IsProfileRemoved);
            if (this.Page.CoverageProfiles.length - 1 === isProfileRemoved.length) this.copyButton = true;
        }
        // if all the other profiles are in pending  for approval disbale copy from general
        const isPendingProfile = this.profileDataStatus.filter((res) => res.CoverageProfileTypeNumber !== profileId && res.IsPendingData);
        if (this.Page.CoverageProfiles.length - 1 === isPendingProfile.length) this.copyButton = true;
    }

    // Populate page if data is already there, called upon OnInit and CoverageProfile change
    async loadConfigurationbyCoverageProfile(profile: CoverageProfile) {
        this.isAllPostalCheck = null;
        this.stateDataToSend = { CoverageProfileInformation: [] };
        this.dataToSend = { CoverageProfileInformation: [] };
        this.postalChangesId = [];
        this.stateProvinceID = [];
        this.countyID = [];
        let PageObj: ProfileCoverageObject[] = [];
        this.isCreateProfile = false;

        const profileStatus = await this._srvCoverageProfile.getProfileDataStatus();
        this.profileDataStatus = profileStatus === null ? [] : profileStatus;
        // if profile deleted return
        if (!this.disableDeletedProfile(profile.ContractorCoverageTypeID)) return;
        this.saveButton = false;
        //===== added to set default tab to state after save //
        this.statesTab.nativeElement.click();
        // Populate page object for marking saved changes
        PageObj =
            this._srvCoverageProfile.Profile.ContrID === 0
                ? this.Page.DB_JSON
                    ? this.Page.DB_JSON
                    : []
                : [...this.Page.DB_JSON, ...this.Page.Contractor_JSON.sort((a: any, b: any) => b.IsRemovedFlag - a.IsRemovedFlag)];
        // Filter objects for selected profile only
        PageObj = PageObj.filter((obj) => obj.CoverageProfileTypeNumber === profile.ContractorCoverageTypeID);
        // Reset state checkbox and flush Counties & Postal codes everytime coverage profile changes
        this.Page.States.forEach((s) => {
            s.checked = false;
            s.pendingApproval = false;
            s.disable = false;
        });
        this.Page.Counties = [];
        this.Page.PostalCodes = [];
        this.allStatesCheckbox = false;
        // Set buttons configuration
        if (this._srvCoverageProfile.Profile.ContrID !== 0) {
            if (PageObj.length) {
                // If current profile has coverage data
                this.createButton = true;
                this.copyButton = false;
                this.deleteButton = profile.ContractorCoverageTypeTitle === 'General';
                // For internal user if current profile has pending changes
                if (this._srvCoverageProfile.Profile.ContrID !== 0) {
                    if (this.Page.Contractor_JSON.find((c) => c.CoverageProfileTypeNumber === profile.ContractorCoverageTypeID)) {
                        this.copyButton = true;
                        if (this._srvCoverageProfile.Profile.UserType === 'Internal') this.deleteButton = true;
                    }
                }
                this.allStatesDisabled = false;
                this.Page.States.forEach((s) => (s.disable = false));
            } else {
                this.createButton = false;
                this.copyButton = true;
                this.deleteButton = true;
                this.allStatesDisabled = true;
                this.Page.States.forEach((s) => (s.disable = true));
            }
        }
        // Get Counties for selected states if any
        const removedState = [];
        for (const obj of PageObj) {
            if (obj.IsStateRemovedFlag) {
                removedState.push(obj.StateProvinceID);
            }
        }
        let stateIds = [...new Set(PageObj.map((c) => c.StateProvinceID))];
        stateIds = stateIds.filter((val) => !removedState.includes(val));
        if (stateIds.length) {
            await this.getCountiesByStateIDs(stateIds.join(','));
        }
        // Get PostalCodes for selected states and thier selected counties if any
        let isRemovedCounty = [];
        PageObj.forEach((val) => {
            if (val.IsRemovedFlag) {
                isRemovedCounty.push(val.CountyRegionNumber);
            }
        });
        let countyIds = [...new Set(PageObj.map((c) => c.CountyRegionNumber))];
        countyIds = countyIds.filter((val) => !isRemovedCounty.includes(val));

        if (stateIds.length && countyIds.length) {
            this.countyID = countyIds;
            this.stateProvinceID = stateIds;
            await this.getPostalCodes(stateIds.join(','), countyIds.join(','), 1);
        }
        // Traversing through db and contractor data
        PageObj.forEach((coverageObj) => {
            const stateFound: State = this.Page.States.find((s) => s.ID === coverageObj.StateProvinceID); //s.Name === coverageObj.StateProvinceName
            const countyFound: County = this.Page.Counties.find((c) => c.ID === coverageObj.CountyRegionNumber);
            const postalCodesFound: PostalCode[] = [];
            coverageObj.ContractorCoverageException.forEach((ex) => {
                const postalCode = this.Page.PostalCodes.find((p) => p.PostalId === ex.PostalNumber);
                if (postalCode) {
                    postalCodesFound.push(postalCode);
                }
            });
            if (coverageObj.CoverageProfileNumber === null && coverageObj.IsRemovedFlag) {
                const deletedProfile = this.Page.CoverageProfiles.find((p) => p.ContractorCoverageTypeID === coverageObj.CoverageProfileTypeNumber);
                if (deletedProfile && this.Page.DB_JSON.find((c) => c.CoverageProfileTypeNumber === deletedProfile.ContractorCoverageTypeID)) {
                    deletedProfile.disable = true;
                }
            }
            // Process checkboxes for States/Counties/PostalCodes
            stateFound.checked = true;
            if (countyFound) {
                countyFound.checked = true;
                if (this._srvAuthentication.Profile.ContrID === 0) this._srvCoverageProfile.processCountyObject(this.Page.States, this.Page.Counties, this.Page.SelectedProfile);
            }
            postalCodesFound.forEach((p) => {
                p.IsChecked = false;
                p.excluded = 'excluded';
                this._srvCoverageProfile.processPostalCodeWithinCountyObject(p, this.Page.SelectedProfile);
            });
        });
        if (this._srvCoverageProfile.Profile.ContrID !== 0) {
            // phase two data binding for selected profile
            this.dataBindingPhaseTwo(profile.ContractorCoverageTypeID);
            // visual cue addtion after data binding
            this.visualCueOnLoad(profile.ContractorCoverageTypeID);
            // to disable one event data in another
            this.disableInEvent(profile.ContractorCoverageTypeID);
            // to disable pending data for internal
            this.disablePhaseTwoForInternal();
            // to disable all check/uncheck for internal
            this.disableAllCheck();
            // to add visual cue on counter
            this.counterCue = this.counterVisual(profile.ContractorCoverageTypeID);
            this.disableDeleteForGeneral(profile.ContractorCoverageTypeID);
        } else {
            // phase one data binding
            this.dataBindingPhaseOne();
            //  to disable phase one data for internal
            this.disablePhaseOneForInternal();
            // to track for the change of counter for phase 1 back button
            this.counterStats = this.counterChangeTrack();
        }
        // Process state of AllCheck Checkbox on page
        this.processAllSelectionCheckboxes();
        this.Page.loadingState = false;
    }

    filterProfileData(profileId: number) {
        const dbData = this.Page.DB_JSON.filter((obj) => obj.CoverageProfileTypeNumber === profileId);
        const pendingData = this.Page.Contractor_JSON.filter((obj) => obj.CoverageProfileTypeNumber === profileId);
        return { dbData, pendingData };
    }
    visualCueOnState(profileId: number) {
        const { dbData, pendingData } = this.filterProfileData(profileId);
        // if the profile do not have data in permanent DB
        if (!dbData.length && pendingData.length) {
            for (const pendObj of pendingData) {
                this.Page.States.forEach((s) => {
                    if (pendObj.StateProvinceID === s.ID) s.pendingApproval = true;
                });
                this.Page.Counties.forEach((c) => {
                    if (pendObj.StateProvinceID === c.StateProvinceID) c.pendingApproval = true;
                });
                this.Page.PostalCodes.forEach((p) => {
                    if (p.CountyRegionID === pendObj.CountyRegionNumber) p.pendingApproval = true;
                });
            }
        }
        // to check if new state has been added then add visual cue to all the counties from the list
        if (dbData.length && pendingData.length) {
            // to fetch state in pending but not in DB
            let statenNotInDB = pendingData.filter((o1) => !dbData.some((o2) => o1.StateProvinceID === o2.StateProvinceID));
            for (const obj of statenNotInDB) {
                this.Page.Counties.forEach((c) => {
                    if (c.StateProvinceID === obj.StateProvinceID) c.pendingApproval = true;
                });
            }
        }
    }
    //  to add visual cue in phase 2 pending data for each selected profile
    visualCueOnLoad(profileId: number) {
        this.visualCueOnState(profileId);
        for (const coverageObj of this.Page.Contractor_JSON) {
            // visual cue on state
            const stateObj = this.Page.States.find((s) => s.ID === coverageObj.StateProvinceID && coverageObj.CoverageProfileTypeNumber === profileId);
            if (stateObj) stateObj.pendingApproval = true;
            // visual Cue on county
            if (coverageObj.CountyRegionNumber !== null) {
                const countyObj = this.Page.Counties.find((c) => c.ID === coverageObj.CountyRegionNumber && coverageObj.CoverageProfileTypeNumber === profileId);
                if (countyObj) countyObj.pendingApproval = true;
                if (coverageObj.hasOwnProperty('IsCountyCreatedObj') && coverageObj.CoverageProfileTypeNumber === profileId) {
                    this.Page.PostalCodes.map((res) => {
                        if (coverageObj.CountyRegionNumber === res.CountyRegionID) res.pendingApproval = true;
                    });
                }
            }
            // visual cue on postal code
            if (coverageObj.CoverageProfileTypeNumber === profileId) {
                const filteredException = coverageObj.ContractorCoverageException.filter((res) => !res.IsIncludedFlag);
                const mergeException = [...filteredException, ...coverageObj.ContractorCoverageIncludedException];
                if (mergeException.length) {
                    for (const exception of mergeException) {
                        const postalPending = this.Page.PostalCodes.find((p) => p.PostalId === exception.PostalNumber);
                        if (postalPending) postalPending.pendingApproval = true;
                    }
                } else {
                    this.Page.PostalCodes.map((p) => {
                        if (p.CountyRegionID === coverageObj.CountyRegionNumber) {
                            p.pendingApproval = true;
                        }
                    });
                }
            }
        }
    }
    // Process all selection checkboxes
    processAllSelectionCheckboxes() {
        // fetch user access privilege
        if (this._srvCoverageProfile.Profile.ContrID > 0) {
            if (!this.$pagePrivilege.editAccess && this.$pagePrivilege.readonlyAccess) {
                // all check/uncheck disabled
                this.allStatesDisabled = true;
                this.allCountyDisabled = true;
                this.allPostalDisabled = true;

                // lists checkbox disabled
                this.Page.States.forEach((s) => (s.disable = true));
                this.Page.Counties.forEach((c) => (c.disable = true));

                //create/copy/delete button disbaled
                this.copyButton = true;
                this.createButton = true;
                this.deleteButton = true;

                this.Page.SelectedProfile.disable = true;
                this.Page.loadingState = false;
                // setTimeout(() => {
                this.saveButton = true;
                // }, 500);
            }
        }

        // Had no choice but to opt this
        const waitingForCounties = setInterval(() => {
            if (this.allCountiesCheckbox) {
                //         if (this._srvCoverageProfile.Profile.UserType === 'Internal' && this._srvCoverageProfile.Profile.ContrID === 0) {
                //             this.allCountiesCheckbox.nativeElement.disabled = true;
                //             this.Page.Counties.forEach((c) => (c.disable = true));
                //         }
                this.allStatesCheckbox = !!!this.Page.States.find((s) => !s.checked);
                this.allCountiesCheckbox.nativeElement.checked = !!!this.Page.Counties.find((c) => !c.checked);
                //         const waitingForPostalCodes = setInterval(() => {
                //             if (this.allPostalCodeCheckbox) {
                //                 if (this._srvCoverageProfile.Profile.UserType === 'Internal' && this._srvCoverageProfile.Profile.ContrID === 0) {
                //                     this.allPostalCodeCheckbox.nativeElement.disabled = true;
                //                     this.Page.PostalCodes.forEach((p) => (p.disable = true));
                //                 }
                // this.allPostalCodeCheckbox.nativeElement.checked = !!!this.Page.PostalCodes.find((p) => !p.IsChecked);
                //                 }
                //                 clearInterval(waitingForPostalCodes);
                //             }, 500);
                clearInterval(waitingForCounties);
            }
        }, 500);
    }
    // Process when state is been removed
    async removeCountiesOnStateUncheck(state: State) {
        let stateDBObj: ProfileCoverageObject;
        let statePenObj: ProfileCoverageObject;
        const countiesToRemove = this.Page.Counties.filter((c) => c.StateProvinceID === state.ID);
        const profilesToRemove = this.Page.PostalCodes.filter((p) => p.StateProvinceID === state.ID);
        if (this._srvCoverageProfile.Profile.ContrID !== 0) {
            // check first state present in DB or Pending if present remove then only, if state is already in pending to be removed donot create new state remove object
            stateDBObj = this.Page.DB_JSON.find(
                (coverageObj) => coverageObj.StateProvinceID === state.ID && coverageObj.CoverageProfileTypeNumber === this.Page.SelectedProfile.ContractorCoverageTypeID
            );
            statePenObj = this.Page.Contractor_JSON.find(
                (coverageObj) => coverageObj.StateProvinceID === state.ID && coverageObj.CoverageProfileTypeNumber === this.Page.SelectedProfile.ContractorCoverageTypeID
            );
        }

        // for ph 2 contractor and internal user
        if (this._srvCoverageProfile.Profile.ContrID !== 0 && (stateDBObj || statePenObj) && !(statePenObj && statePenObj.hasOwnProperty('IsStateRemovedFlag'))) {
            const obj: ProfileCoverageObject = {};
            obj.CoverageProfileTypeNumber = this.Page.SelectedProfile.ContractorCoverageTypeID;
            obj.CoverageProfileTypeName = this.Page.SelectedProfile.ContractorCoverageTypeTitle;
            obj.CoverageProfileNumber = null;
            obj.CountyRegionNumber = null;
            obj.CountyName = null;
            obj.StateProvinceID = state.ID;
            obj.StateProvinceAbbreviationName = state.Abbreviation;
            obj.StateProvinceName = state.Name;
            obj.CountryNumber = this._srvCoverageProfile.Profile.CountryID;
            obj.IsStateRemovedFlag = true;
            obj.ContractorCoverageException = [];
            obj.ContractorCoverageIncludedException = [];
            this.stateDataToSend.CoverageProfileInformation.push(obj);
        }

        this.Page.Counties = this.Page.Counties.filter((c) => !countiesToRemove.includes(c));
        this.Page.PostalCodes = this.Page.PostalCodes.filter((p) => !profilesToRemove.includes(p));
        countiesToRemove.forEach((c) => (c.checked = false)); // Set their checkbox to false for removal
        if (this._srvAuthentication.Profile.ContrID === 0) this._srvCoverageProfile.processCountyObject(this.Page.States, countiesToRemove, this.Page.SelectedProfile);
    }
    // State Checkboxes Process ===================================================================
    async statesCheckboxChange(checkbox: HTMLInputElement, state: State = null) {
        const userCheck = this._srvCoverageProfile.Profile.UserType !== 'Internal' && this._srvCoverageProfile.Profile.ContrID !== 0;
        if (state === null) {
            // Gather new state ids for api call.
            const newStateIds = checkbox.checked ? this.Page.States.filter((s) => s.checked === false).map((s) => s.ID) : undefined;
            // this.checkedState = newStateIds;
            if (newStateIds && newStateIds.length) {
                this.stateProvinceID = newStateIds;
                await this.getCountiesByStateIDs(newStateIds.join(','));
                if (userCheck) {
                    this.stateDataToSend.CoverageProfileInformation = [];
                    this.onStateCountyCheckUnCheck(true);
                }
            } else {
                this.stateProvinceID = [];
            }
            // Check/uncheck individual checkbox
            this.Page.States.forEach((s) => {
                if (s.disable) {
                    return;
                }
                s.checked = checkbox.checked;
                if (!s.checked) {
                    this.removeCountiesOnStateUncheck(s);
                }
            });
        } else {
            state.checked = checkbox.checked ? true : false;
            if (checkbox.checked) {
                this.stateProvinceID.push(state.ID);
            } else {
                this.stateProvinceID = this.stateProvinceID.filter((s) => s !== state.ID);
            }
            if (state.checked) {
                if (userCheck) this.removeStateDataOnCheck(state.ID);
                await this.getCountiesByStateIDs(state.ID.toString());
                if (userCheck) this.onStateCountyCheckUnCheck(true);
            } else {
                this.removeCountiesOnStateUncheck(state);
            }
            this.allStatesCheckbox = this.Page.States.findIndex((c) => c.checked === false) !== -1 ? false : true;
        }
        this.processAllSelectionCheckboxes();
    }
    // get County List =======================
    getCountyOnCheckBox(checkbox: HTMLInputElement, county: County) {
        let changedCounties: County[];
        if (county === null) {
            if (this._srvCoverageProfile.Profile.ContrID !== 0) {
                if (checkbox.checked) {
                    changedCounties = this.onStateCountyCheckUnCheck(false).UnSavedCounties; //this.Page.Counties.filter((c) => c.checked === false);
                } else {
                    changedCounties = this.onStateCountyCheckUnCheck(false).SavedCounties;
                }
            } else {
                this.Page.Counties.map((c) => (checkbox.checked ? (c.checked = true) : (c.checked = false)));
            }

            if (checkbox.checked) {
                this.countyID = this.Page.Counties.map((c) => c.ID);
            } else {
                this.Page.Counties.forEach((c) => {
                    if (!c.checked) {
                        // Process when county is been removed
                        const profilesToRemove = this.Page.PostalCodes.filter((p) => p.CountyRegionID === c.ID);
                        this.Page.PostalCodes = this.Page.PostalCodes.filter((p) => !profilesToRemove.includes(p));
                    }
                });
                this.countyID = [];
            }
        } else {
            county.checked = checkbox.checked ? true : false;
            this.allCountiesCheckbox.nativeElement.checked = this.Page.Counties.findIndex((c) => c.checked === false) !== -1 ? false : true;
            if (checkbox.checked) {
                this.stateProvinceID = [...new Set([...this.stateId, ...this.stateProvinceID])];
                this.countyID.push(county.ID);
            } else {
                this.countyID = this.countyID.filter((res) => res !== county.ID);
                // Process when county is been removed
                const profilesToRemove = this.Page.PostalCodes.filter((p) => p.CountyRegionID === county.ID);
                this.Page.PostalCodes = this.Page.PostalCodes.filter((p) => !profilesToRemove.includes(p));
            }
        }
        this.countiesCheckboxChange(checkbox, county, changedCounties);
    }
    // add visual cue and remove postal code from postalcode array
    addVisualCueRemovePostalCode(checkbox: HTMLInputElement) {
        this.Page.Counties.forEach((c) => {
            if (c.disable) return;
            c.checked = checkbox.checked;
            if (!c.checked) {
                // Process when county is been removed
                this.removePostalCode(c);
            }
        });
    }

    removePostalCode(county: County) {
        const profilesToRemove = this.Page.PostalCodes.filter((p) => p.CountyRegionID === county.ID);
        this.Page.PostalCodes = this.Page.PostalCodes.filter((p) => !profilesToRemove.includes(p));
    }

    // County Checkboxes Process ==================================================================
    async countiesCheckboxChange(checkbox: HTMLInputElement, county: County, changedCounties: County[]) {
        if (county === null) {
            // only ph 2 contractor

            if (this._srvCoverageProfile.Profile.ContrID !== 0) {
                this.dataToSend.CoverageProfileInformation = [];
                changedCounties.forEach((cnt) => {
                    const obj: ProfileCoverageObject = {};
                    obj.CoverageProfileTypeNumber = this.Page.SelectedProfile.ContractorCoverageTypeID;
                    obj.CoverageProfileTypeName = this.Page.SelectedProfile.ContractorCoverageTypeTitle;
                    obj.CoverageProfileNumber = null;
                    obj.CountyRegionNumber = cnt.ID;
                    obj.CountyName = cnt.Name;
                    obj.StateProvinceID = cnt.StateProvinceID;
                    obj.StateProvinceAbbreviationName = cnt.StateAbbreviation;
                    obj.StateProvinceName = this.Page.States.filter((s) => s.Abbreviation === cnt.StateAbbreviation).shift().Name;
                    obj.CountryNumber = this._srvCoverageProfile.Profile.CountryID;
                    obj.IsRemovedFlag = !checkbox.checked;
                    obj.ContractorCoverageException = [];
                    obj.ContractorCoverageIncludedException = [];
                    obj.IsCountyCreatedObj = true;
                    this.dataToSend.CoverageProfileInformation.push(obj);
                });
            }

            this.addVisualCueRemovePostalCode(checkbox);
        } else {
            county.checked = checkbox.checked;
            if (county.checked) {
            } else {
            }

            // only ph 2 contractor
            if (this._srvCoverageProfile.Profile.ContrID !== 0) {
                // to add remove county object from payload
                if (this.addRemoveCountyOnCheckUncheck(county.StateProvinceID, county.ID)) return;

                const obj: ProfileCoverageObject = {};
                obj.CoverageProfileTypeNumber = this.Page.SelectedProfile.ContractorCoverageTypeID;
                obj.CoverageProfileTypeName = this.Page.SelectedProfile.ContractorCoverageTypeTitle;
                obj.CoverageProfileNumber = null;
                obj.CountyRegionNumber = county.ID;
                obj.CountyName = county.Name;
                obj.StateProvinceID = county.StateProvinceID;
                obj.StateProvinceAbbreviationName = county.StateAbbreviation;
                obj.StateProvinceName = this.Page.States.filter((s) => s.Abbreviation === county.StateAbbreviation).shift().Name;
                obj.CountryNumber = this._srvCoverageProfile.Profile.CountryID;
                obj.IsRemovedFlag = !checkbox.checked;
                obj.ContractorCoverageException = [];
                obj.ContractorCoverageIncludedException = [];
                obj.IsCountyCreatedObj = true;
                this.dataToSend.CoverageProfileInformation.push(obj);
            }
        }
        if (this._srvAuthentication.Profile.ContrID === 0) this._srvCoverageProfile.processCountyObject(this.Page.States, this.Page.Counties, this.Page.SelectedProfile);
        this.processAllSelectionCheckboxes();

        // Refresh data after checkbox changes for contractor only
        if (this._srvCoverageProfile.Profile.UserType !== 'Internal' && this._srvCoverageProfile.Profile.ContrID !== 0) {
            this.countiesTab.nativeElement.click();
        }
    }

    // will be called in phase 2 only
    async refreshPageOnSave() {
        // Get ProfileCoverages saved in DataBase
        this.Page.DB_JSON = (await this._srvCoverageProfile.getPageJSONData()).CoverageProfileInformation;
        // Get ProfileCoverages pending for approval
        await this.getPendingData();
        await this.loadConfigurationbyCoverageProfile(this.Page.SelectedProfile);
    }
    async fetchPostalCode() {
        if (!this.isPostalTabOpen) {
            this.postalChangesId = [];
            this.Page.PostalCodes = [];
            this.isPostalTabOpen = true;
            await this.getPostalCodes(this.stateProvinceID.toString(), this.countyID.toString(), 1);
            if (this._srvCoverageProfile.Profile.ContrID !== 0 && !this.isCreateProfile) this.processVisualCueForPostalCodeOnTabClick(this.Page.PostalCodes);
        }
    }
    // process to remove object from save payload on check
    removeStateDataOnCheck(stateID) {
        this.stateDataToSend.CoverageProfileInformation = this.stateDataToSend.CoverageProfileInformation.filter((item) => item.StateProvinceID !== stateID);
    }
    // process
    addRemoveCountyOnCheckUncheck(stateID: number, countyID: number) {
        for (let i = 0; i < this.dataToSend.CoverageProfileInformation.length; i++) {
            if (this.dataToSend.CoverageProfileInformation[i].StateProvinceID === stateID && this.dataToSend.CoverageProfileInformation[i].CountyRegionNumber === countyID) {
                this.dataToSend.CoverageProfileInformation.splice(i, 1);
                return true;
            }
        }
    }
    onStateCountyCheckUnCheck(isState: boolean) {
        const profile = this.Page.SelectedProfile;
        let PageObj: ProfileCoverageObject[] = [];
        let SavedCounties: County[] = [];
        let UnSavedCounties: County[] = [];
        let count = 0;
        PageObj = [...this.Page.DB_JSON, ...this.Page.Contractor_JSON.sort((a: any, b: any) => b.IsRemovedFlag - a.IsRemovedFlag)];
        PageObj = PageObj.filter((obj) => obj.CoverageProfileTypeNumber === profile.ContractorCoverageTypeID);
        for (const coverageObj of PageObj) {
            count++;
            if (isState) {
                // if the state is unchecked and checked again annd have some county check
                const index = this.Page.Counties.findIndex((c) => c.ID === coverageObj.CountyRegionNumber);
                if (index !== -1) this.Page.Counties[index].checked = true;
                if (count === PageObj.length) return;
            } else {
                const index = this.Page.Counties.findIndex((c) => c.ID === coverageObj.CountyRegionNumber);
                if (index !== -1) SavedCounties.push(this.Page.Counties[index]);
            }
        }
        for (const county of this.Page.Counties) {
            count++;
            const index = PageObj.findIndex((c) => c.CountyRegionNumber === county.ID);
            if (index === -1) UnSavedCounties.push(county);
        }
        return { SavedCounties, UnSavedCounties };
    }
    // counter management
    counterChangeTrack() {
        return {
            stateCount: this.CoverageStats('States').count,
            countyCount: this.CoverageStats('Counties').count,
            postalCoveredCount: this.totalCoveredPostal,
            postalUncoveredCount: this.totalUncoveredPostal,
        };
    }

    //process postal code visual cue on postal tab click
    processVisualCueForCountyTabClick() {
        if (this._srvCoverageProfile.Profile.ContrID !== 0) this.visualCueOnLoad(this.Page.SelectedProfile.ContractorCoverageTypeID);
    }

    //process postal code visual cue on postal tab click
    processVisualCueForPostalCodeOnTabClick(postalCode: PostalCode[]) {
        this.visualCueOnLoad(this.Page.SelectedProfile.ContractorCoverageTypeID);
    }
    // data binding for both contractor and internal user
    dataBindingPhaseTwo(profileId: number) {
        //state check uncheck
        if (!this.isPostalTabOpen) {
            for (const state of this.Page.States) {
                const stateDBObj = this.Page.DB_JSON.find((coverageObj) => coverageObj.StateProvinceID === state.ID && coverageObj.CoverageProfileTypeNumber === profileId);
                const statePenObj = this.Page.Contractor_JSON.find((coverageObj) => coverageObj.StateProvinceID === state.ID && coverageObj.CoverageProfileTypeNumber === profileId);
                state.checked = (stateDBObj || statePenObj) && !(statePenObj && statePenObj.hasOwnProperty('IsStateRemovedFlag')) ? true : false; //!statePenObj?.IsStateRemovedFlag
            }
            // county check uncheck
            for (const county of this.Page.Counties) {
                const countyDBObj = this.Page.DB_JSON.find((coverageObj) => coverageObj.CountyRegionNumber === county.ID && coverageObj.CoverageProfileTypeNumber === profileId);
                const countyPenObj = this.Page.Contractor_JSON.find((coverageObj) => coverageObj.CountyRegionNumber === county.ID && coverageObj.CoverageProfileTypeNumber === profileId);
                county.checked = (countyDBObj || countyPenObj) && !(countyPenObj && countyPenObj.hasOwnProperty('IsRemovedFlag') && countyPenObj.IsRemovedFlag) ? true : false;
            }
        }
        // postal code check uncheck
        for (const coverageObj of this.Page.Contractor_JSON) {
            let filteredException: CoverageException[];
            if (coverageObj.CoverageProfileTypeNumber === profileId) {
                if (coverageObj && coverageObj.ContractorCoverageException) {
                    filteredException = coverageObj.ContractorCoverageException.filter((res) => !res.IsIncludedFlag);
                }

                for (const excludedException of filteredException) {
                    const excluded = this.Page.PostalCodes.find((p) => p.PostalId === excludedException.PostalNumber);
                    if (excluded) excluded.IsChecked = false;
                }
                if (coverageObj && coverageObj.ContractorCoverageIncludedException) {
                    for (const includedException of coverageObj.ContractorCoverageIncludedException) {
                        const included = this.Page.PostalCodes.find((p) => p.PostalId === includedException.PostalNumber);
                        if (included) included.IsChecked = true;
                    }
                }
            }
        }
    }
    // data binding for phase 1 prospective contractor
    dataBindingPhaseOne() {
        //state check uncheck
        for (const state of this.Page.States) {
            const stateDBObj = this.Page.DB_JSON.find((coverageObj) => coverageObj.StateProvinceID === state.ID);
            state.checked = stateDBObj ? true : false;
        }
        // county check uncheck
        for (const county of this.Page.Counties) {
            const countyDBObj = this.Page.DB_JSON.find((coverageObj) => coverageObj.CountyRegionNumber === county.ID);
            county.checked = countyDBObj ? true : false;
        }
    }
    // PostalCode Checkbox Process ===================================================================
    async postalCodesCheckboxChange(checkbox: HTMLInputElement, postalCode: PostalCode) {
        if (postalCode === null) {
            this.postalCount('all', checkbox.checked);
            this.isAllPostalCheck = checkbox.checked;
            this.postalAllCheckBox = checkbox;
            this.Page.PostalCodes.forEach(async (p) => {
                if (p.disable) {
                    return;
                }
                // Adding visual cue to profile
                if (this._srvCoverageProfile.Profile.ContrID !== 0) {
                    // to empty exceptions & inclusion arrays if all postal checked unchecked
                    this.dataToSend.CoverageProfileInformation.map((coverageobj, index) => {
                        if (!coverageobj['IsCountyCreatedObj']) {
                            this.dataToSend.CoverageProfileInformation.splice(index, 1);
                        } else {
                            coverageobj.ContractorCoverageException = [];
                            coverageobj.ContractorCoverageIncludedException = [];
                        }
                    });
                }
                if (!p.IsChecked) this.isPostalCodeChange(p);
                p.IsChecked = checkbox.checked;
                p.excluded = !checkbox.checked ? 'excluded' : '';
                // Send Contractor Data
                if (this._srvCoverageProfile.Profile.ContrID !== 0) {
                } else {
                    // Process postalCode data for api
                    this._srvCoverageProfile.processPostalCodeWithinCountyObject(p, this.Page.SelectedProfile);
                }
            });
            if (checkbox.checked) {
                const obj: ProfileCoverageObject = {};
                obj.CoverageProfileTypeNumber = this.Page.SelectedProfile.ContractorCoverageTypeID;
                obj.CoverageProfileTypeName = this.Page.SelectedProfile.ContractorCoverageTypeTitle;
                obj.CoverageProfileNumber = null;
                obj.CountyRegionNumber = null;
                obj.CountyName = null;
                obj.StateProvinceID = null;
                obj.StateProvinceAbbreviationName = null;
                obj.StateProvinceName = null;
                obj.CountryNumber = this._srvCoverageProfile.Profile.CountryID;
                obj.ContractorCoverageException = [];
                obj.ContractorCoverageIncludedException = [];
                obj.isAllPostalCodeChecked = this.isAllPostalCheck;

                this.dataToSend.CoverageProfileInformation.push(obj);
            } else {
                this.dataToSend.CoverageProfileInformation = [];
            }
            return;
        }
        this.postalCount('single', checkbox.checked);
        this.isPostalCodeChange(postalCode);

        postalCode.excluded = !checkbox.checked ? 'excluded' : '';
        postalCode.IsChecked = checkbox.checked;

        // Process postalCode data for api
        this._srvCoverageProfile.processPostalCodeWithinCountyObject(postalCode, this.Page.SelectedProfile);

        // Send Contractor Data
        if (this._srvCoverageProfile.Profile.ContrID !== 0) {
            this.postalCodeIncludeExcludeArray(postalCode, this.Page.SelectedProfile);
            if (this.postalCodesTab) this.postalCodesTab.nativeElement.click();
        }
    }

    postalCodeIncludeExcludeArray(postalCode: PostalCode, selectedProfile: CoverageProfile) {
        // Find if object already in collection
        let index = this.dataToSend.CoverageProfileInformation.findIndex(
            (county) => county.CountyRegionNumber === postalCode.CountyRegionID && county.CoverageProfileTypeNumber === selectedProfile.ContractorCoverageTypeID
        );
        if (index === -1) {
            const obj: ProfileCoverageObject = {};
            obj.CoverageProfileTypeNumber = this.Page.SelectedProfile.ContractorCoverageTypeID;
            obj.CoverageProfileTypeName = this.Page.SelectedProfile.ContractorCoverageTypeTitle;
            obj.CoverageProfileNumber = null;
            obj.CountyRegionNumber = postalCode.CountyRegionID;
            obj.CountyName = postalCode.CountyRegionName;
            obj.StateProvinceID = postalCode.StateProvinceID;
            obj.StateProvinceAbbreviationName = postalCode.StateAbbreviation;
            obj.StateProvinceName = this.Page.States.filter((s) => s.Abbreviation === postalCode.StateAbbreviation).shift().Name;
            obj.CountryNumber = this._srvCoverageProfile.Profile.CountryID;
            obj.IsRemovedFlag = false;
            obj.ContractorCoverageException = [];
            obj.ContractorCoverageIncludedException = [];
            obj.isAllPostalCodeChecked = this.isAllPostalCheck;
            this.dataToSend.CoverageProfileInformation.push(obj);
            index = this.dataToSend.CoverageProfileInformation.length - 1;
        }
        const obj: CoverageException = {};
        obj.CoverageExceptionNumber = null;
        obj.CoverageProfileNumber = null;
        obj.PostalNumber = postalCode.PostalId;

        if (postalCode.IsChecked && this.dataToSend.CoverageProfileInformation[index].ContractorCoverageException) {
            const exceptionIndex = this.dataToSend.CoverageProfileInformation[index].ContractorCoverageException.findIndex((p) => p.PostalNumber === postalCode.PostalId);
            if (exceptionIndex !== -1) {
                this.dataToSend.CoverageProfileInformation[index].ContractorCoverageException.splice(exceptionIndex, 1);
            } else {
                this.dataToSend.CoverageProfileInformation[index].ContractorCoverageIncludedException.push(obj);
            }
        } else {
            if (this.dataToSend.CoverageProfileInformation[index].ContractorCoverageIncludedException) {
                const inclusionIndex = this.dataToSend.CoverageProfileInformation[index].ContractorCoverageIncludedException.findIndex((p) => p.PostalNumber === postalCode.PostalId);
                if (inclusionIndex !== -1) {
                    this.dataToSend.CoverageProfileInformation[index].ContractorCoverageIncludedException.splice(inclusionIndex, 1);
                } else {
                    this.dataToSend.CoverageProfileInformation[index].ContractorCoverageException.push(obj);
                }
            }
        }
        const coverageObj = this.dataToSend.CoverageProfileInformation[index];
        if (!coverageObj.ContractorCoverageException.length && !coverageObj.ContractorCoverageIncludedException.length && !coverageObj['IsCountyCreatedObj']) {
            this.dataToSend.CoverageProfileInformation.splice(index, 1);
        }
    }

    inclusionArrayBinding() {
        for (const objToSave of this.dataToSend.CoverageProfileInformation) {
            let dbExceptionArray: CoverageException[] = [];
            if (objToSave.ContractorCoverageIncludedException.length) {
                const index = this.Page.DB_JSON.findIndex((obj) => obj.CountyRegionNumber === objToSave.CountyRegionNumber);
                if (index !== -1 && this.Page.DB_JSON[index].ContractorCoverageException.length) {
                    dbExceptionArray = this.Page.DB_JSON[index].ContractorCoverageException;
                }
                for (const dbExcludedPOstal of dbExceptionArray) {
                    const index = objToSave.ContractorCoverageIncludedException.findIndex((res) => res.PostalNumber === dbExcludedPOstal.PostalNumber);
                    if (index !== -1) {
                        objToSave.ContractorCoverageIncludedException[index].CoverageExceptionNumber = dbExcludedPOstal.CoverageExceptionNumber;
                        objToSave.ContractorCoverageIncludedException[index].CoverageProfileNumber = dbExcludedPOstal.CoverageProfileNumber;
                    }
                }
            }
        }
    }

    postalCount(checkType: string, isChecked: boolean) {
        if (checkType === 'all') {
            this.totalCoveredPostal = isChecked ? this.Page.PostalCodes[0].TotalPostalCodesCount : 0;
            this.totalUncoveredPostal = isChecked ? 0 : this.Page.PostalCodes[0].TotalPostalCodesCount;
        } else {
            this.totalCoveredPostal = isChecked ? this.totalCoveredPostal + 1 : this.totalCoveredPostal - 1;
            this.totalUncoveredPostal = isChecked ? this.totalUncoveredPostal - 1 : this.totalUncoveredPostal + 1;
        }
    }
    // Get coverage stats
    CoverageStats(key: string) {
        if (key !== 'PostalCodes') {
            return {
                count: this.Page[key] ? this.Page[key].filter((obj) => obj.checked).length : 0,
                excluded: this.Page[key] ? this.Page[key].filter((obj) => !obj.checked).length : 0,
            };
        } else {
            return {
                count: this.Page[key] ? this.Page[key].filter((obj) => obj.IsChecked).length : 0,
                excluded: this.Page[key] ? this.Page[key].filter((obj) => !obj.IsChecked).length : 0,
            };
        }
    }
    counterVisual(profileID: number) {
        const counterVisualCue: CounterVisualCue = { state: false, county: false, postalCode: false };

        const profileStatus = this.profileDataStatus.find((profile) => profile.CoverageProfileTypeNumber === profileID);
        // if profile data is copied apply cue to all the counters
        if (profileStatus && profileStatus.IsCopiedProfile) {
            counterVisualCue.state = true;
            counterVisualCue.county = true;
            counterVisualCue.postalCode = true;
        } else {
            const { dbData, pendingData } = this.filterProfileData(profileID);

            //state counter cue
            const dbStateIds = [...new Set(dbData.map((state) => state.StateProvinceID))];
            const penStateIds = [...new Set(pendingData.map((state) => state.StateProvinceID))];
            const addedStateId = penStateIds.filter((penId) => !dbStateIds.includes(penId));
            const removedState = pendingData.some((obj) => obj.IsStateRemovedFlag);
            if (addedStateId.length || removedState) {
                counterVisualCue.state = true;
                counterVisualCue.county = true;
                counterVisualCue.postalCode = true;
            }

            // county counter cue
            if (pendingData.some((obj) => obj.IsCountyCreatedObj)) {
                counterVisualCue.county = true;
                counterVisualCue.postalCode = true;
            }

            //postal code counter cue
            const isException = pendingData.some((obj) => obj.ContractorCoverageException.length || obj.ContractorCoverageIncludedException.length);
            if (isException) counterVisualCue.postalCode = true;
        }

        return counterVisualCue;
    }
    // Add new profile for internal user
    async onAddProfileClick() {
        const result = await this._srvCoverageProfile.getCreateCoverageProfileDropdown(0);
        const addProfileDialog = this._dialog.open({ content: AddProfileCoverageDialogComponent, width: 500 });
        const dialog = addProfileDialog.content.instance;
        dialog.incomingData = result;
        dialog.DataService = this._srvCoverageProfile;
        addProfileDialog.result.subscribe(async (res) => {
            if (Object.keys(res).length && res['button'] !== 'CANCEL') {
                const response = await this._srvCoverageProfile.createCoverageProfile(res);
                if (response === 1) {
                    const cancelRef = this._dialog.open({ content: DialogAlertsComponent, width: 500 });
                    const cancelIns: DialogAlertsComponent = cancelRef.content.instance;
                    cancelIns.alertMessage = `
                        <div class="modal-alert confirmation-alert">
                            <h2>${this.pageContent.Coverage_Profile.Success}</h2>
                            <p><strong>${res['CoverageProfileName']}</strong> ${this.pageContent.Coverage_Profile.Profile_Created}</p>
                        </div>
                    `;
                    // Ask to return added profile so one more call can be saved
                } else {
                    this.failAlert(this.pageContent.Coverage_Profile.Error, this.pageContent.Coverage_Profile.Wrong);
                }
            }
        });
    }
    // on create button click
    onCreateButtonClick() {
        this.createButton = true;
        this.allStatesDisabled = false;
        this.allCountyDisabled = false;
        this.allPostalDisabled = false;
        this.Page.States.forEach((s) => (s.disable = false));

        this.isCreateProfile = true;
    }
    // to remove deleted pending profile from "destination" in copy dropdown
    removePendingDeletedProfile() {
        let updateProfileList: CoverageProfile[] = this.Page.CoverageProfiles;
        for (const profileStatus of this.profileDataStatus) {
            updateProfileList = updateProfileList.filter((p) => p.ContractorCoverageTypeID !== profileStatus.CoverageProfileTypeNumber);
        }
        updateProfileList = updateProfileList.filter((p) => p.ContractorCoverageTypeID !== this.Page.SelectedProfile.ContractorCoverageTypeID);

        return updateProfileList;
    }
    // on copy button click
    onCopyButtonClick() {
        if (this._srvCoverageProfile.Profile.UserType === 'Internal') {
            const safeProfiles = this.removePendingDeletedProfile();

            const copyProfileDialog = this._dialog.open({ content: CopyCoverageProfileComponent, width: 500 });
            const instance = copyProfileDialog.content.instance;
            instance.stateProfiles = safeProfiles;
            instance.selectedProfile = this.Page.SelectedProfile;
            copyProfileDialog.result.subscribe(async (res) => {
                if (Object.keys(res).length) {
                    const dataToPost = {
                        CONTR_ID: this._srvCoverageProfile.Profile.ContrID,
                        SourceCoverageProfileTypeID: this.Page.SelectedProfile.ContractorCoverageTypeID,
                        DestinationCoverageProfileTypeID: res['ContractorCoverageTypeID'],
                    };

                    const result = await this._srvCoverageProfile.copyCoverageProfileInternal(dataToPost);
                    if (result === 1) {
                        this.successAlert(this.pageContent.Coverage_Profile.Success, this.pageContent.Coverage_Profile.Copy_Profile_Text);

                        this.statesTab.nativeElement.click();
                        // Get ProfileCoverages saved in DataBase
                        this.Page.DB_JSON = (await this._srvCoverageProfile.getPageJSONData()).CoverageProfileInformation;
                        // Get ProfileCoverages pending for approval
                        this.getPendingData();
                    } else {
                        this.failAlert(this.pageContent.Coverage_Profile.Not_Copied, this.pageContent.Coverage_Profile.Not_Copied_Text);
                    }
                }
            });
        }

        if (this._srvCoverageProfile.Profile.UserType !== 'Internal') {
            const copyProfileDialog = this._dialog.open({ content: CopyCoverageProfileComponent, width: 500 });
            const instance = copyProfileDialog.content.instance;
            instance.stateProfiles = [...this.removePendingDeletedProfile()];
            instance.selectedProfile = this.Page.SelectedProfile;

            copyProfileDialog.result.subscribe(async (res) => {
                if (Object.keys(res).length) {
                    const copyProfileData = {
                        DestinationCoverageProfileTypeName: res['ContractorCoverageTypeTitle'],
                        SourceCoverageProfileTypeID: this.Page.SelectedProfile.ContractorCoverageTypeID,
                        DestinationCoverageProfileTypeID: res['ContractorCoverageTypeID'],
                    };
                    const result = await this._srvCoverageProfile.copyCoverageProfileContractor(copyProfileData);
                    if (result === 1) {
                        this.successAlert(this.pageContent.Coverage_Profile.Success, this.pageContent.Coverage_Profile.Copy_Profile_Text);
                        this.crComments = await this._srvContractorData.getPageComments('Profile Coverage');
                        // Refresh data after checkbox changes for contractor only
                        this.statesTab.nativeElement.click();
                        this.refreshPageOnSave();
                    } else {
                        this.failAlert(this.pageContent.Coverage_Profile.Not_Copied, this.pageContent.Coverage_Profile.Not_Copied_Text);
                    }
                }
            });
        }
    }
    onDeleteButtonClick() {
        const dialogRef = this._dialog.open({ content: SaveAlertComponent, width: 500 });
        const dialog = dialogRef.content.instance;
        dialog.header = this.pageContent.Coverage_Profile.Warning;
        dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <h2>${this.pageContent.Coverage_Profile.Are_You_Sure} </h2>
                <p>${this.pageContent.Coverage_Profile.Are_You_Sure_Text}</p>
            </div>
        `;
        dialogRef.result.subscribe(async (res) => {
            if (res['button'] === 'Yes') {
                if (this._srvCoverageProfile.Profile.UserType === 'Internal') {
                    const result = await this._srvCoverageProfile.deleteCoverageProfileInternal(this.Page.SelectedProfile.ContractorCoverageTypeID);
                    if (result === 1) {
                        this.successAlert(this.pageContent.Coverage_Profile.Deleted, this.pageContent.Coverage_Profile.Deleted_Text);
                        // Get ProfileCoverages saved in DataBase
                        this.Page.DB_JSON = (await this._srvCoverageProfile.getPageJSONData()).CoverageProfileInformation;
                        this.loadConfigurationbyCoverageProfile(this.Page.SelectedProfile);
                        this.statesTab.nativeElement.click();
                    } else {
                        this.failAlert(this.pageContent.Coverage_Profile.Not_Deleted, this.pageContent.Coverage_Profile.Not_Deleted_Text);
                    }
                } else {
                    const result = await this._srvCoverageProfile.deleteCoverageProfileContractor(
                        this.Page.SelectedProfile.ContractorCoverageTypeID,
                        this.Page.SelectedProfile.ContractorCoverageTypeTitle
                    );
                    if (result === 1) {
                        this.successAlert(this.pageContent.Coverage_Profile.Deleted, this.pageContent.Coverage_Profile.Deleted_Text);

                        this.crComments = await this._srvContractorData.getPageComments('Profile Coverage');
                        // Refresh data after checkbox changes for contractor only
                        this.statesTab.nativeElement.click();
                        const { ContractorCoverageTypeID, ContractorCoverageTypeTitle, ContractorCoverageTypeTitleTranslated } = this.Page.CoverageProfiles.find(
                            (profile) => profile.ContractorCoverageTypeTitle === 'General'
                        );
                        const generalProfile: CoverageProfile = {
                            ContractorCoverageTypeID: ContractorCoverageTypeID,
                            ContractorCoverageTypeTitle: ContractorCoverageTypeTitle,
                            ContractorCoverageTypeTitleTranslated: ContractorCoverageTypeTitleTranslated,
                            disable: false,
                        };
                        this.Page.SelectedProfile = generalProfile;
                        this.refreshPageOnSave();
                    } else {
                        this.failAlert(this.pageContent.Coverage_Profile.Not_Deleted, this.pageContent.Coverage_Profile.Not_Deleted_Text);
                    }
                }
            }
        });
    }

    successAlert(header: string, message: string) {
        const cancelRef = this._dialog.open({ content: DialogAlertsComponent, width: 500 });
        const cancelIns: DialogAlertsComponent = cancelRef.content.instance;
        cancelIns.alertMessage = `
                                <div class="modal-alert confirmation-alert">
                                    <h2>${header}</h2>
                                    <p>${message}</p>
                                </div>
                            `;
    }

    failAlert(header: string, message: string) {
        const cancelRef = this._dialog.open({ content: DialogAlertsComponent, width: 500 });
        const cancelIns: DialogAlertsComponent = cancelRef.content.instance;
        cancelIns.alertMessage = `
                            <div class="modal-alert info-alert">
                                <h2>${header}</h2>
                                <p>${message}.</p>
                            </div>
                        `;
    }

    checkIfProfileDisable(itemArgs: { dataItem: any; index: number }) {
        return itemArgs.dataItem.disable;
    }

    // Update final changes permanently
    async onSaveButtonClick() {
        if (!this.validationCheck() || !this.postalCodeValidation()) return;
        let response;
        // Phase I prospective contractor save
        if (this._srvCoverageProfile.Profile.UserType !== 'Internal' && this._srvCoverageProfile.Profile.ContrID === 0) {
            this._srvCoverageProfile.LastPageVisited = 'validation';
            response = await this._srvCoverageProfile.SaveData();
            if (response === 1) {
                this._route.navigate(['/contractorRegistration/validation']);
            }
        }
        // phase 2 internal save
        if (this._srvCoverageProfile.Profile.UserType === 'Internal' && this._srvCoverageProfile.Profile.ContrID !== 0) {
            let finalDataToSend: DataToSend = { CoverageProfileInformation: [] };
            finalDataToSend.CoverageProfileInformation = [...this.dataToSend.CoverageProfileInformation, ...this.stateDataToSend.CoverageProfileInformation];
            // sending counties and stateids in first object
            this.countyID = this.countyID.filter((id) => id);
            await this._srvCoverageProfile.postPagination(finalDataToSend, this.countyID.toString(), this.stateProvinceID.toString());
            this.refreshPageOnSave();
        }
    }
    // on phase 2 contractor save
    async onSave() {
        if (!this.validationCheck() || !this.postalCodeValidation()) return;
        let finalDataToSend: DataToSend = { CoverageProfileInformation: [] };
        finalDataToSend.CoverageProfileInformation = [...this.dataToSend.CoverageProfileInformation, ...this.stateDataToSend.CoverageProfileInformation];
        // sending counties and stateids in first object
        this.countyID = this.countyID.filter((id) => id);
        await this._srvCoverageProfile.postPagination(finalDataToSend, this.countyID.toString(), this.stateProvinceID.toString(), 'validation');
        this.dataToSend.CoverageProfileInformation = [];
        this.stateDataToSend.CoverageProfileInformation = [];
        this.crComments = await this._srvContractorData.getPageComments('Profile Coverage');
        this.refreshPageOnSave();
    }
    // on back button click
    async onBackButtonClick() {
        const updatedCounterStat = this.counterChangeTrack();
        const isUnSavedChanges = JSON.stringify(this.counterStats) !== JSON.stringify(updatedCounterStat);
        if (isUnSavedChanges) {
            const dialogRef = this._dialog.open({ content: SaveAlertComponent, width: 500 });
            const dialog = dialogRef.content.instance;
            dialog.header = this.pageContent.Coverage_Profile.Warning;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <h2>${this.pageContent.Contact_Information.Global_Alert_Data_Unsaved}</h2>
                <p>${this.pageContent.Contact_Information.Global_Alert_Data_Unsaved_Stmt}</p>
            </div>
        `;
            dialogRef.result.subscribe(async (res) => {
                if (res['button'] === 'Yes') {
                    this._srvCoverageProfile.LastPageVisited = 'trade-information';
                    const result = await this._srvContractorRegistration.saveLastPageVisited('trade-information');
                    if (result === 1) {
                        this._route.navigate(['/contractorRegistration/trade-information']);
                    }
                }
            });
            return;
        }
        const result = await this._srvContractorRegistration.saveLastPageVisited('trade-information');
        if (result === 1) {
            this._route.navigate(['/contractorRegistration/trade-information']);
        }
    }
    selectedProfileData() {
        this.Page.SelectedProfile.ContractorCoverageTypeID;
    }
    // function to remove pendingdata for state,county and postal code for internal user
    removePendingData() {
        const StateObjs = this.Page.States.filter((state) => !state.pendingApproval);
        const CountyObjs = this.Page.Counties.filter((county) => !county.pendingApproval);
        const PostalCodeObjs = this.Page.PostalCodes.filter((postal) => !postal.pendingApproval);
        return { StateObjs, CountyObjs, PostalCodeObjs };
    }
    // to detect changes in postal code
    public isPostalCodeChange(postalCode: PostalCode) {
        const { CountyRegionID, PostalId } = postalCode;
        const index = this.postalChangesId.findIndex((p) => p.PostalId === PostalId);
        if (index === -1) {
            this.postalChangesId.push({ CountyRegionID, PostalId });
        } else {
            this.postalChangesId.splice(index, 1);
        }
        return this.postalChangesId.length || this.isAllPostalCheck !== null ? true : false;
    }
    //phase one postal code object managemnet
    postalCodeExclusionArrayValidationPhaseOne() {
        for (const postalObj of this.postalChangesId) {
            this._srvCoverageProfile.PageObject.map((obj) => {
                if (obj.CountyRegionNumber === postalObj.CountyRegionID) {
                    const index = obj.ContractorCoverageException.findIndex((exc) => exc.PostalNumber === postalObj.PostalId);
                    if (index !== -1) {
                        obj.ContractorCoverageException.splice(index, 1);
                    } else {
                        obj.ContractorCoverageException.push({ CoverageExceptionNumber: null, CoverageProfileNumber: null, PostalNumber: postalObj.PostalId });
                    }
                }
            });
        }
    }
    // internal user accessing prospective contractor
    public async navigateTo(path: string) {
        if (this._srvCoverageProfile.Profile.EventName !== 'No Event') {
            if (!this.validationCheck()) return;
            let finalDataToSend: DataToSend = { CoverageProfileInformation: [] };
            finalDataToSend.CoverageProfileInformation = [...this.dataToSend.CoverageProfileInformation, ...this.stateDataToSend.CoverageProfileInformation];

            // sending counties and stateids in first object
            this.countyID = this.countyID.filter((id) => id);
            await this._srvCoverageProfile.postPagination(
                finalDataToSend,
                this.countyID.toString(),
                this.stateProvinceID.toString(),
                path === 'trade-information' ? 'trade-information' : 'veteran-info'
            );
            this.dataToSend.CoverageProfileInformation = [];
            this.stateDataToSend.CoverageProfileInformation = [];
            const route: string = path === 'trade-information' ? '/contractorRegistration/trade-information' : '/existing-contractor/veteran-info';
            this._route.navigate([route]);
        } else {
            this._route.navigate(['/contractorRegistration/' + path]);
        }
    }
    //click function in event back button
    async navigateBackInEvent() {
        // phase 2 contractor event validation to check unsaved data on back click
        if (this.dataToSend.CoverageProfileInformation.length || this.stateDataToSend.CoverageProfileInformation.length) {
            const dialogRef = this._dialog.open({ content: SaveAlertComponent, width: 500 });
            const dialog = dialogRef.content.instance;
            dialog.header = this.pageContent.Coverage_Profile.Warning;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <h2>${this.pageContent.Contact_Information.Global_Alert_Data_Unsaved}</h2>
                <p>${this.pageContent.Contact_Information.Global_Alert_Data_Unsaved_Stmt}</p>
            </div>
        `;
            dialogRef.result.subscribe(async (res) => {
                if (res['button'] === 'Yes') {
                    this._srvCoverageProfile.LastPageVisited = 'trade-information';
                    const result = await this._srvContractorRegistration.saveLastPageVisited('trade-information');
                    if (result === 1) {
                        this._route.navigate(['/contractorRegistration/trade-information']);
                    }
                }
            });
            return;
        }
        const result = await this._srvContractorRegistration.saveLastPageVisited('trade-information');
        if (result === 1) {
            this._route.navigate(['/contractorRegistration/trade-information']);
        }
    }
    //validation
    validationCheck() {
        // state validation
        if (!this.stateProvinceID.length && this.Page.SelectedProfile.ContractorCoverageTypeID === 1) {
            this.validationAlertDialog(this.pageContent.Coverage_Profile.State_Validation);
            return false;
        }
        //county validation
        if (this.stateProvinceID.length) {
            for (const stateId of this.stateProvinceID) {
                const index = this.Page.Counties.findIndex((county) => county.checked && county.StateProvinceID === stateId);
                if (index === -1) {
                    this.validationAlertDialog(this.pageContent.Coverage_Profile.County_Validation);
                    return false;
                }
            }
        }
        //all postal code uncheck validation
        if (!this.totalCoveredPostal && this.totalUncoveredPostal) {
            this.validationAlertDialog(this.pageContent.Coverage_Profile.Postal_Validation);
            return false;
        }
        //postalcode validation pending to vivek
        return true;
    }

    postalCodeValidation() {
        let validate = true;
        if (this.totalCoveredPostal >= this.countyID.length) {
            // for phase 2 internal and contractor
            if (this._srvCoverageProfile.Profile.ContrID !== 0 && this.dataToSend.CoverageProfileInformation.length) {
                //if all postalcode is excluded then check if the number of object
                if (this.isAllPostalCheck === false && this.dataToSend.CoverageProfileInformation.length !== this.countyID.length) {
                    this.validationAlertDialog(this.pageContent.Coverage_Profile.Postal_Validation);
                    validate = false;
                }
                //if any county's all postal check has been removed and isAllPostalCheck = null
                if (this.isAllPostalCheck === null) {
                    for (let i = 0; i < this.countyID.length; i++) {
                        let allPostalCodeLength = this.Page.PostalCodes.filter((p) => p.CountyRegionID === this.countyID[i]).length;
                        this.dataToSend.CoverageProfileInformation.forEach((obj) => {
                            const dbData = this.Page.DB_JSON.find(
                                (dbObj) => dbObj.CoverageProfileTypeNumber === this.Page.SelectedProfile.ContractorCoverageTypeID && dbObj.CountyRegionNumber === obj.CountyRegionNumber
                            );
                            let dbException;
                            if (dbData) dbException = dbData.ContractorCoverageException;
                            const exceptionLength = obj.ContractorCoverageException.length + dbException ? dbException.length : 0;
                            if (obj.CountyRegionNumber === this.countyID[i] && allPostalCodeLength !== 0 && exceptionLength === allPostalCodeLength) {
                                this.validationAlertDialog(this.pageContent.Coverage_Profile.Postal_Validation);
                                validate = false;
                            }
                        });
                    }
                }
            }
            // for phase 1 prospective contractor
            else {
                for (let i = 0; i < this.countyID.length; i++) {
                    let allPostalCodeLength = this.Page.PostalCodes.filter((p) => p.CountyRegionID === this.countyID[i]).length;
                    this._srvCoverageProfile.PageObject.forEach((obj) => {
                        if (obj.CountyRegionNumber === this.countyID[i]) {
                            if (allPostalCodeLength !== 0 && obj.ContractorCoverageException.length === allPostalCodeLength) {
                                this.validationAlertDialog(this.pageContent.Coverage_Profile.Postal_Validation);
                                validate = false;
                            }
                        }
                    });
                }
            }
        } else {
            this.validationAlertDialog(this.pageContent.Coverage_Profile.Postal_Validation);
            validate = false;
        }

        return validate;
    }
    //all check disable for internal user
    disableAllCheck() {
        const pendingData = this.Page.Contractor_JSON.filter((obj) => obj.CoverageProfileTypeNumber === this.Page.SelectedProfile.ContractorCoverageTypeID);
        if (this._srvCoverageProfile.Profile.UserType === 'Internal' && this._srvCoverageProfile.Profile.ContrID !== 0) {
            //for state
            if (pendingData.length) this.allStatesDisabled = true;

            //for county
            const index = pendingData.findIndex((obj) => !obj.hasOwnProperty('IsStateRemovedFlag'));
            if (index !== -1) this.allCountyDisabled = true;

            //for postalcode
            for (const obj of pendingData) {
                if (obj.ContractorCoverageException.length || obj.ContractorCoverageIncludedException.length) this.allPostalDisabled = true;
            }
        }
    }
    // postal tab change validation
    alertPostalTabChange(activeAccord) {
        this.isPostalTabOpen = false;
        activeAccord.checked = false;
        if (this.activeAccord === 'BusinessLicences' && (this.postalChangesId.length || this.isAllPostalCheck !== null)) {
            this.activeAccord = 'BusinessLicences';
            const dialogRef = this._dialog.open({ content: SaveAlertComponent, width: 500 });
            const dialog = dialogRef.content.instance;
            dialog.header = this.pageContent.Coverage_Profile.Warning;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <h2>${this.pageContent.Contact_Information.Global_Alert_Data_Unsaved}</h2>
                <p>${this.pageContent.Contact_Information.Global_Alert_Data_Unsaved_Stmt}</p>
            </div>
        `;
            dialogRef.result.subscribe(async (res) => {
                if (res['button'] === 'Yes') {
                    // have to set all PostalCheck null again
                    this.isAllPostalCheck = null;
                    //to remove postal object
                    if (this._srvCoverageProfile.Profile.UserType !== 'Internal' && this._srvCoverageProfile.Profile.ContrID !== 0) {
                        this.dataToSend.CoverageProfileInformation = this.dataToSend.CoverageProfileInformation.filter((coverageObj) => !coverageObj.hasOwnProperty('isAllPostalCodeChecked')); // true or null nahi chiae
                        this.dataToSend.CoverageProfileInformation.map((coverageObj) => {
                            (coverageObj.ContractorCoverageException = []), (coverageObj.ContractorCoverageIncludedException = []);
                        });
                    } else {
                        this.postalCodeExclusionArrayValidationPhaseOne();
                    }
                    this.activeAccord = activeAccord.value;
                } else {
                }
            });
            return;
        } else {
            this.activeAccord = activeAccord.value;
        }
    }
    validationAlertDialog(message: string, condition: string = null) {
        const dialogRef = this._dialog.open({
            content: DialogAlertsComponent,
            appendTo: this.containerRef,
            width: 500,
        });
        const dialog = dialogRef.content.instance;
        dialog.header = this.pageContent.Coverage_Profile.Alert;
        if (condition === 'moveToGeneral') {
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                 <h2>${this.pageContent.Coverage_Profile.Profile_Deleted}</h2>
                                    <p>${message}</p>
                                </div>
                            `;
        } else {
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                 <p>${message}</p>
                                </div>
                            `;
        }
        dialogRef.result.subscribe(async (res) => {
            if (condition === 'moveToGeneral') {
                const { ContractorCoverageTypeID, ContractorCoverageTypeTitle, ContractorCoverageTypeTitleTranslated } = this.Page.CoverageProfiles.find(
                    (profile) => profile.ContractorCoverageTypeTitle === 'General'
                );
                const generalProfile: CoverageProfile = {
                    ContractorCoverageTypeID: ContractorCoverageTypeID,
                    ContractorCoverageTypeTitle: ContractorCoverageTypeTitle,
                    ContractorCoverageTypeTitleTranslated: ContractorCoverageTypeTitleTranslated,
                    disable: false,
                };
                this.Page.SelectedProfile = generalProfile;
                await this.loadConfigurationbyCoverageProfile(this.Page.SelectedProfile);
            }
        });
    }
    // deny access and route to company infoif access not granted
    public accessDenied() {
        const dialogRef = this._dialog.open({
            content: DialogAlertsComponent,
            appendTo: this.containerRef,
            width: 500,
        });
        const dialog = dialogRef.content.instance;
        dialog.header = this.pageContent.Coverage_Profile.Alert;
        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                 <h2>${this.pageContent.Coverage_Profile.Access_Denied}</h2>
                                    <p>${this.pageContent.Coverage_Profile.Wrong}</p>
                                </div>
                            `;
        dialogRef.result.subscribe((res) => {
            this._route.navigate(['/contractorRegistration/company-information']);
        });
        this.Page.pageAccess = false;
    }
}
