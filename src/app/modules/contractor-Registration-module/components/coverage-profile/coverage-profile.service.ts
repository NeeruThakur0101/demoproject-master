import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ProfileCoverageObject, CoverageProfile, State, County, PostalCode, CoverageException, SaveCoverageProfileData, CopyCoverageData, GetStateProfile, DataToSend } from './models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { DialogResult } from '@progress/kendo-angular-dialog';

@Injectable()
export class CoverageProfileService {
    public Profile: SessionUser;
    public ApplicationJSON: any;
    public LastPageVisited = '';
    public saveProfileData: SaveCoverageProfileData;
    public PageObject: ProfileCoverageObject[] = [];
    private baseURL: string = environment.api_url + 'CoverageProfile';
    private baseUrlAlt: string = environment.api_url;
    private payloadSize: number = 500;
    private userLanguageId: number = this.$auth.currentLanguageID;

    constructor(private $auth: AuthenticationService, private $http: HttpClient, private $cntrDataSrv: ContractorDataService) { }

    // Get Page Json Data
    public getPageJSONData(): Promise<SaveCoverageProfileData> {
        const { ContrID, ResourceID, CCOpsID } = this.Profile;
        let URL: string = `${this.baseUrlAlt}CoverageProfile/GetCoverageDetails?resourceID=${ResourceID}&CCOpsId=${CCOpsID}`;
        if (ContrID > 0) {
            URL = `${this.baseUrlAlt}JSON/GetContractorData?contrID=${ContrID}&PageName=Coverage Area&resourceID=${ResourceID}&userLanguageID=${this.userLanguageId}`;
        }
        return this.$http.get<SaveCoverageProfileData>(URL).pipe(catchError(this.handleError)).toPromise();
    }

    // Get contractor changes
    public getContractorChanges(pageNumber): Promise<any> {
        const { ContrID, ResourceID, EventAlias, EventName } = this.$auth.Profile;
        const { CCOpsID } = this.Profile;
        const eventAlias = EventAlias ? EventAlias : EventName;
        const pageSize = 500;

        return this.$http
            .get<any>(
                `${this.baseUrlAlt}CoverageProfile/GetCoverageEventJson?contrID=${ContrID}&resourceID=${ResourceID}&pageName=Coverage Area&CCOpsID=${CCOpsID}&EventName=${eventAlias}&pageSize=${pageSize}&pageNumber=${pageNumber}`
            )
            .pipe(catchError(this.handleError))
            .toPromise();
    }

    // Get State data for coverage profile page.
    public getStateProfileData(): Promise<GetStateProfile> {
        const { ContrID, ResourceID, CountryID } = this.Profile;
        const params: {} = {
            params: {
                countryId: CountryID,
                resourceID: ResourceID,
                contrId: ContrID,
                userLanguageID: this.userLanguageId,
            },
        };

        return this.$http.get<GetStateProfile>(`${this.baseURL}/GetStateProfile`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // Get county data for selected states
    public getCountiesByStateIDs(stateIDs: string): Promise<County[]> {
        const { ResourceID, CountryID } = this.Profile;
        const params: {} = {
            params: {
                countryId: CountryID,
                resourceID: ResourceID,
                stateIds: stateIDs,
                userLanguageID: this.userLanguageId,
            },
        };

        return this.$http.get<County[]>(`${this.baseURL}/GetCounty`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // Get profile data for selected counties
    public getPostalCodesByStatesAndCountiesIDs(StateIds: string, CountyIds: string, PageNo: number, CoverageProfileTypeNumber: number): Promise<PostalCode[]> {
        const { ResourceID: ResourceId, CountryID: CountryId, CCOpsID, EventName } = this.Profile;
        let DefaultPageValues: number = 500;
        let PageValues: number = 2000;
        let PageName: string = 'Coverage Area';
        let Eventname: string = EventName !== 'No Event' ? EventName : null;
        let ContrId: number = this.Profile.ContrID;
        let UserLanguageID: number = this.userLanguageId;
        return this.$http
            .put<PostalCode[]>(`${this.baseURL}/GetProfileData`, {
                CountryId,
                StateIds,
                CountyIds,
                ResourceId,
                CCOpsID,
                PageNo,
                PageValues,
                DefaultPageValues,
                CoverageProfileTypeNumber,
                PageName,
                Eventname,
                ContrId,
                UserLanguageID,
            })
            .pipe(catchError(this.handleError))
            .toPromise();
    }

    // Save Page Json Data
    public SaveData(): Promise<number> {
        const { PageObject: CoverageProfileInformation, LastPageVisited } = this;
        const { ResourceID: ResourceId, CCOpsID: CCopsId } = this.Profile;
        const data = { CoverageProfileInformation, ResourceId, CCopsId, LastPageVisited };
        this.saveProfileData = data;
        return this.$http.put<number>(`${this.baseUrlAlt}/CoverageProfile/SaveCoverageInformation`, this.saveProfileData).pipe(catchError(this.handleError)).toPromise();
    }

    // Edit Page Json Data for Submitted Contractor
    async EditContractorData(data, nextPage): Promise<number> {
        const finalObj = Object.keys(data.CoverageProfileInformation).length > 0 ? data : null;
        return await this.$cntrDataSrv.saveContractorData({ currentPage: 'Coverage Area', nextPage }, finalObj, 'CoverageProfile/EditEventCoverageInfo');
    }

    // Edit Page Json Data for Submitted Internal User
    public EditInternalData(dataToSave): Promise<number> {
        const { ContrID, ResourceID: ResourceId, CountryID: CountryId, CCOpsID } = this.Profile;
        const CCOpsData = JSON.stringify(dataToSave);
        const PageName = 'Coverage Area';
        const { ContractorResourceID } = this.$auth.Profile;

        return this.$http
            .put<number>(`${this.baseUrlAlt}JSON/EditJsonDataInternal`, {
                Contr_ID: ContrID,
                ResourceId,
                CCOpsID,
                CCOpsData,
                PageName,
                ContractorResourceID,
            })
            .pipe(catchError(this.handleError))
            .toPromise();
    }

    // Get dropdown data for create new profile modal window
    public getCreateCoverageProfileDropdown(clientId: number = 0): Promise<any> {
        // Client id 0 first time send actual client ID once user selects a client
        return this.$http
            .get<any>(`${this.baseURL}/GetCoverageProfileTypeDropDown?CoverageProfileTypeID=1&ClientID=${clientId}&userLanguageID=${this.userLanguageId}`)
            .pipe(catchError(this.handleError))
            .toPromise();
    }

    // Create new coverage profile
    public createCoverageProfile(obj: DialogResult): Promise<number> {
        return this.$http.post<number>(`${this.baseURL}/InsertCoverageProfileType`, obj).pipe(catchError(this.handleError)).toPromise();
    }

    // Copy coverage profile for internal user only
    public copyCoverageProfileInternal(copyCoverageProfileData: CopyCoverageData): Promise<number> {
        return this.$http.post<number>(`${this.baseURL}/CopyCoverageProfile`, copyCoverageProfileData).pipe(catchError(this.handleError)).toPromise();
    }
    // Copy coverage profile for contractor user only
    public copyCoverageProfileContractor(copyProfileData): Promise<number> {
        const { DestinationCoverageProfileTypeName, SourceCoverageProfileTypeID, DestinationCoverageProfileTypeID } = copyProfileData;
        const { ResourceID: ResourceId, CountryID: CountryId, CCOpsID, EventName, ContractorResourceID, EventTypeID, ContrID } = this.Profile;
        const payLoad = {
            PageName: 'Coverage Area',
            EventName: EventName !== 'No Event' ? EventName : null,
            ResourceId: ResourceId,
            DestinationCoverageProfileTypeName: DestinationCoverageProfileTypeName,
            EventTypeID: EventTypeID,
            ContractorResourceID: ContractorResourceID,
            IsInternal: false,
            EventDataFlag: EventName === 'No Event' ? false : true,
            CONTR_ID: ContrID,
            SourceCoverageProfileTypeID: SourceCoverageProfileTypeID,
            DestinationCoverageProfileTypeID: DestinationCoverageProfileTypeID,
        };

        return this.$http.post<number>(`${this.baseURL}/CopyContrCoverageProfile`, payLoad).pipe(catchError(this.handleError)).toPromise();
    }

    // Deleting coverage profile for internal user only
    public deleteCoverageProfileInternal(CoverageProfileTypeID: number): Promise<number> {
        const { ResourceID, ContrID } = this.Profile;
        const params: {} = {
            params: {
                LoggedInResourceID: ResourceID,
                Contr_ID: ContrID,
                CoverageProfileTypeID: CoverageProfileTypeID,
            },
        };

        // LoggedInResouceID is same as session resourceID
        return this.$http.delete<number>(`${this.baseURL}/DeleteCoverageProfileType`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // Deleting coverage profile for contrator user only
    public deleteCoverageProfileContractor(CoverageProfileTypeID: number, CoverageProfileTypeName: string): Promise<number> {
        const { ResourceID, ContrID, EventName, EventTypeID, EventAlias, CountryID } = this.Profile;
        const params: {} = {
            params: {
                LoggedInResourceID: ResourceID,
                Contr_ID: ContrID,
                CoverageProfileTypeID: CoverageProfileTypeID,
                CoverageProfileTypeName: CoverageProfileTypeName,
                eventDataFlag: EventName === 'No Event' ? false : true,
                eventTypeID: EventTypeID === null ? 0 : EventTypeID,
                eventName: EventName === 'No Event' ? '' : EventName,
                stateProvinceID: CountryID === 1 ? 1 : 52,
            },
        };

        // LoggedInResouceID is same as session resourceID
        return this.$http.delete<number>(`${this.baseURL}/DeleteCoverageProfile`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // Get contractor changes
    public getProfileDataStatus(): Promise<any> {
        const { ContrID, ResourceID, EventAlias, EventName } = this.$auth.Profile;
        const { CCOpsID } = this.Profile;
        const eventAlias = EventAlias ? EventAlias : EventName;
        const params: {} = {
            params: {
                ccopsID: CCOpsID,
                resourceID: ResourceID,
                Contr_ID: ContrID,
                eventName: EventName, //=== 'No Event' ? '' : EventName,
            },
        };

        return this.$http.get<any>(`${this.baseUrlAlt}CoverageProfile/GetProfileDataStatus`, params).pipe(catchError(this.handleError)).toPromise();
    }

    public getCoverageListCount(): Promise<any> {
        const { ContrID, ResourceID, EventAlias, EventName } = this.$auth.Profile;
        const { CCOpsID } = this.Profile;
        const eventAlias = EventAlias ? EventAlias : EventName;
        const params: {} = {
            params: {
                CCopsID: CCOpsID,
                resourceID: ResourceID,
                ContrID: ContrID,
                EventName: EventName, //=== 'No Event' ? '' : EventName,
                pageName: 'Coverage Area',
            },
        };

        return this.$http.get<any>(`${this.baseUrlAlt}CoverageProfile/GetCoverageListCount`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }

    // Validate if user is logged in else throw out.
    validateUser(): void {
        const { isAuthenticated, Profile } = this.$auth;

        if (!isAuthenticated) {
            this.$auth.logout();
            return;
        }
        this.Profile = Profile;
        this.Profile.UserType = this.$auth.LoggedInUserType;
    }

    // Process profile coverages for api call
    processCountyObject(States: State[], Counties: County[], selectedProfile: CoverageProfile) {
        Counties.forEach((county) => {
            // Check if county is already in page object
            const index = this.PageObject.findIndex((c) => c.CountyRegionNumber === county.ID && c.CoverageProfileTypeNumber === selectedProfile.ContractorCoverageTypeID);
            if (county.checked && index === -1) {
                const obj: ProfileCoverageObject = {};
                obj.CoverageProfileTypeNumber = selectedProfile.ContractorCoverageTypeID;
                obj.CoverageProfileTypeName = selectedProfile.ContractorCoverageTypeTitle;
                obj.CoverageProfileNumber = null;
                obj.CountyRegionNumber = county.ID;
                obj.CountyName = county.Name;
                obj.StateProvinceID = county.StateProvinceID;
                obj.StateProvinceAbbreviationName = county.StateAbbreviation;
                obj.StateProvinceName = States.filter((s) => s.Abbreviation === county.StateAbbreviation).shift().Name;
                obj.CountryNumber = this.Profile.CountryID;
                obj.ContractorCoverageException = [];
                obj.ContractorCoverageIncludedException = [];
                this.PageObject = [...this.PageObject, obj];
            } else if (!county.checked && index !== -1) {
                this.PageObject.splice(index, 1);
            }
        });
    }

    // Process postalCode exeptions for api call
    processPostalCodeWithinCountyObject(postalCode: PostalCode, selectedProfile: CoverageProfile) {
        if (this.$auth.Profile.ContrID !== 0 && this.Profile.UserType !== 'Internal') {
        } else {
            // Find if object already in collection

            const index = this.PageObject.findIndex(
                (county) => county.CountyRegionNumber === postalCode.CountyRegionID && county.CoverageProfileTypeNumber === selectedProfile.ContractorCoverageTypeID
            );
            if (index === -1) {
                return;
            }
            const exceptionIndex = this.PageObject[index].ContractorCoverageException.findIndex((p) => p.PostalNumber === postalCode.PostalId);
            if (!postalCode.IsChecked && exceptionIndex === -1) {
                const obj: CoverageException = {};
                obj.CoverageExceptionNumber = null;
                obj.CoverageProfileNumber = null;
                obj.PostalNumber = postalCode.PostalId;
                this.PageObject[index].ContractorCoverageException.push(obj);
            } else if (postalCode.IsChecked && exceptionIndex !== -1) {
                this.PageObject[index].ContractorCoverageException.splice(exceptionIndex, 1);
            }
        }
    }
    getPaginationConfiguration(payloadLength): number {
        let noOfPages: number;
        let restObjLength: number;
        noOfPages = Math.floor(payloadLength / 500);
        restObjLength = payloadLength % 500;
        noOfPages = noOfPages + (restObjLength ? 1 : 0);
        return noOfPages;
    }
    postPaginationConfiguration(dataToPost: DataToSend) {
        const totalPayloadLength = dataToPost.CoverageProfileInformation.length;
        let noOfPages: number;
        let restObjLength: number;
        if (totalPayloadLength > this.payloadSize) {
            noOfPages = Math.floor(totalPayloadLength / this.payloadSize);
            restObjLength = totalPayloadLength % this.payloadSize;
            noOfPages = noOfPages + (restObjLength ? 1 : 0);
        } else {
            noOfPages = 1;
            restObjLength = 0;
        }
        return { totalPayloadLength, noOfPages, restObjLength };
    }

    async postPagination(dataToPost: DataToSend, countyId: string, stateId: string, path: string = null) {
        const { totalPayloadLength, noOfPages, restObjLength } = this.postPaginationConfiguration(dataToPost);
        if (totalPayloadLength > this.payloadSize) {
            for (let i = 0; i < noOfPages;) {
                const firstIndex = this.payloadSize * i;
                let lastIndex: number;
                if (restObjLength && i === noOfPages - 1) lastIndex = i * this.payloadSize + restObjLength;
                else lastIndex = this.payloadSize * (i + 1);
                const dataToSend = dataToPost.CoverageProfileInformation.slice(firstIndex, lastIndex);
                let finalDataToSend: DataToSend = { CoverageProfileInformation: [] };
                finalDataToSend.CoverageProfileInformation = dataToSend;

                if (finalDataToSend.CoverageProfileInformation.length && !finalDataToSend.CoverageProfileInformation[0].CountyIds) {
                    finalDataToSend.CoverageProfileInformation[0].CountyIds = countyId.toString();
                    finalDataToSend.CoverageProfileInformation[0].StateIds = stateId.toString();
                }
                const result = await this.saveDatainPagination(finalDataToSend, path);
                if (result === 1) i++;
            }
        } else {
            if (dataToPost.CoverageProfileInformation.length && !dataToPost.CoverageProfileInformation[0].CountyIds) {
                dataToPost.CoverageProfileInformation[0].CountyIds = countyId.toString();
                dataToPost.CoverageProfileInformation[0].StateIds = stateId.toString();
            }
            await this.saveDatainPagination(dataToPost, path);
        }
    }
    async saveDatainPagination(dataToPost: DataToSend, path: string = null) {
        if (this.Profile.ContrID !== 0 && this.Profile.UserType !== 'Internal' && this.Profile.EventName === 'No Event') {
            const result = await this.EditContractorData(dataToPost, path);
            return result;
        }
        if (this.Profile.ContrID !== 0 && this.Profile.UserType !== 'Internal' && this.Profile.EventName !== 'No Event') {
            const result = await this.EditContractorData(dataToPost, path);
            return result;
        }
        if (this.Profile.ContrID !== 0 && this.Profile.UserType === 'Internal') {
            const result = await this.EditInternalData(dataToPost);
            return result;
        }
    }
}
