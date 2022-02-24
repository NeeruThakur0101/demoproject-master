import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ContractorRegistrationService } from './contractor-Registration.service';
import { Subscription, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SelectApplicationModel, ContactDetailObj } from './../models/data-model';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/core/services/http-service';
import { Injectable, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { Contact, ContactDetail } from '../components/contact-information/contact.model';
import { ContactApiService } from '../components/contact-information/contact-api.service';
@Injectable({
    providedIn: 'root',
})
export class ContactInformationService implements OnDestroy {
    public incomingData: BehaviorSubject<object> = new BehaviorSubject<object>({});
    public approvalObj: BehaviorSubject<object> = new BehaviorSubject<object>({});
    public forwardedData: any;
    public revertData: any;
    public comparingData: any;
    public approvalGetObject: any;
    public ContactDetailsObject: Contact = {
        BillingCompanyName: '',
        BillingContactName: '',
        BillingPhone: '',
        BillingFax: null,
        BillingEmail: null,
        ContractorEmails: '',
        CrawfordContractorConnectionContactName: '',
        CrawfordContractorConnectionContactNumber: '',
        CrawfordContractorConnectionContactEmail: '',
        CrawfordContractorConnectionTrainingContact: null,
        IsMailingAddressPhysicalAddressSame: false,
        IsBillingAddressPhysicalAddressSame: false,
        ContactNumbers: [],
        Address: [],
    };
    public objProgram = new SelectApplicationModel();
    public accountId: number;
    public resourceId: number;
    public loginDetails: Array<SessionUser> = [];
    public success: BehaviorSubject<any> = new BehaviorSubject({ msg: '', data: {} });
    public sameMailingAddress: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public sameBillingAddress: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public mailingToggle: boolean;
    public billingToggle: boolean;
    public data: any;
    public locationDetails: BehaviorSubject<{ lat: number; lng: number }> = new BehaviorSubject({ lat: 0, lng: 0 });
    public requestDataPut: Subscription;
    public subIncomingData: Subscription;
    masterRevertData: any;
    loggedInUserType: string;
    ContrID: number;
    dbData: any;
    private baseUrlAlt: string = environment.api_url;
    constructor(
        private _api: ApiService,
        private _route: Router,
        private _srvContractorRegistration: ContractorRegistrationService,
        private _http: HttpClient,
        private _srvAuthentication: AuthenticationService,
        private _srvContractorData: ContractorDataService,
        private _srvContactApi: ContactApiService
    ) { }

    // saving form data and navigating to next tab
    public async saveTabData(dataFromContactPage, tabNumber: number, state: string, approvalJsonContactApproval) {
        this.data = dataFromContactPage;
        this.sameBillingAddress.subscribe((toggleState) => {
            this.mailingToggle = toggleState;
        });

        this.sameMailingAddress.subscribe((toggleState) => {
            this.billingToggle = toggleState;
        });

        this.loginDetails = [];
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.loginDetails = Array(this._srvAuthentication.Profile);
        this.resourceId = this.loginDetails[0].ResourceID;
        this.ContrID = this.loginDetails[0].ContrID;
        this.comparingData = null;
        this.forwardedData = null;
        this.revertData = null;

        this.subIncomingData = this.incomingData.subscribe((result: any) => {
            if (this.loginDetails[0].ContrID > 0) {
                this.comparingData = result;
                this.forwardedData = result;
            } else {
                this.comparingData = result;
                this.forwardedData = result;
            }
        });
        if (this.loginDetails[0].ContrID > 0) {
            this.dbData = await this.getPageJSONData();
        }
        this.revertData = JSON.stringify(this.forwardedData);
        this.masterRevertData = JSON.parse(JSON.stringify(this.forwardedData));
        // COntractor pending for approval data
        this.approvalObj.subscribe((apprObj) => {
            this.approvalGetObject = apprObj;
        });
        this.ContactDetailsObject = {
            BillingCompanyName: '',
            BillingContactName: '',
            BillingPhone: '',
            BillingFax: null,
            BillingEmail: null,
            ContractorEmails: '',
            CrawfordContractorConnectionContactName: '',
            CrawfordContractorConnectionContactNumber: '',
            CrawfordContractorConnectionContactEmail: '',
            CrawfordContractorConnectionTrainingContact: null,
            IsMailingAddressPhysicalAddressSame: false,
            IsBillingAddressPhysicalAddressSame: false,
            ContactNumbers: [],
            Address: [],
        };
        if (this.forwardedData.hasOwnProperty('ContactDetails')) {
            this.ContactDetailsObject = this.forwardedData.ContactDetails;
        }
        if (tabNumber === 1) {
            this.ContactDetailsObject.ContactNumbers = this.data;
        } else if (tabNumber === 2) {
            this.ContactDetailsObject.ContractorEmails = this.data.toString();
        } else if (tabNumber === 3) {
            this.ContactDetailsObject.CrawfordContractorConnectionContactName = this.data.CrawfordContractorConnectionContactName;
            this.ContactDetailsObject.CrawfordContractorConnectionContactNumber = this.data.CrawfordContractorConnectionContactNumber;
            this.ContactDetailsObject.CrawfordContractorConnectionContactEmail = this.data.CrawfordContractorConnectionContactEmail;
            this.ContactDetailsObject.CrawfordContractorConnectionTrainingContact =
                this.data.CrawfordContractorConnectionTrainingContact === '' ? null : this.data.CrawfordContractorConnectionTrainingContact;
        } else if (tabNumber === 4) {
            this.ContactDetailsObject.BillingCompanyName = this.data.company;
            this.ContactDetailsObject.BillingContactName = this.data.cName;
            this.ContactDetailsObject.BillingPhone = this.data.cPhone;
            this.ContactDetailsObject.BillingFax = this.data.cFax === '' ? null : this.data.cFax;
            this.ContactDetailsObject.BillingEmail = this.data.cEmail === '' ? null : this.data.cEmail;
        } else if (tabNumber === 5) {
            this.ContactDetailsObject.IsMailingAddressPhysicalAddressSame = this.data.IsMailingAddressPhysicalAddressSame;
            this.ContactDetailsObject.IsBillingAddressPhysicalAddressSame = this.data.IsBillingAddressPhysicalAddressSame;
            delete this.data['IsMailingAddressPhysicalAddressSame'];
            delete this.data['IsBillingAddressPhysicalAddressSame'];
            const index = this.findIndex('Physical');
            const indexB = this.findIndex('Billing');
            const indexM = this.findIndex('Mailing');

            if (
                this.comparingData.ContactDetails.IsMailingAddressPhysicalAddressSame === false &&
                this.comparingData.ContactDetails.Address[indexM] &&
                this.comparingData.ContactDetails.Address[indexM].PostalCode === this.comparingData.ContactDetails.Address[index].PostalCode
            ) {
                this.comparingData.ContactDetails.Address[indexM] = {
                    StreetAddress: '',
                    StreetAddress2: '',
                    City: '',
                    State: '',
                    PostalCode: '',
                    AddressType: 'Mailing',
                };
            } else if (this.comparingData.ContactDetails.IsMailingAddressPhysicalAddressSame === true) {
                this.mailingToggleAPI(true, { ...this.data });
            }

            if (
                this.comparingData.ContactDetails.IsBillingAddressPhysicalAddressSame === false &&
                this.comparingData.ContactDetails.Address[indexB] &&
                this.comparingData.ContactDetails.Address[indexB].PostalCode === this.comparingData.ContactDetails.Address[index].PostalCode
            ) {
                this.comparingData.ContactDetails.Address[indexB] = {
                    StreetAddress: '',
                    StreetAddress2: '',
                    City: '',
                    State: '',
                    PostalCode: '',
                    AddressType: 'Billing',
                };
            } else if (this.comparingData.ContactDetails.IsBillingAddressPhysicalAddressSame === true) {
                this.billingToggleAPI(true, { ...this.data });
            }
            if (index === -1) {
                this.ContactDetailsObject.Address.push({ AddressType: 'Physical', ...this.data });
            } else {
                this.ContactDetailsObject.Address[index] = { AddressType: 'Physical', ...this.data };
            }
        } else if (tabNumber === 6) {
            const index = this.findIndex('Mailing');
            if (index === -1) {
                this.ContactDetailsObject.Address.push({ AddressType: 'Mailing', ...this.data });
            } else {
                this.ContactDetailsObject.Address[index] = { AddressType: 'Mailing', ...this.data };
            }
        } else if (tabNumber === 7) {
            const index = this.findIndex('Billing');
            if (index === -1) {
                this.ContactDetailsObject.Address.push({ AddressType: 'Billing', ...this.data });
            } else {
                this.ContactDetailsObject.Address[index] = { AddressType: 'Billing', ...this.data };
            }
        }

        this.forwardedData = {
            ...this.forwardedData,
            ContactDetails: { ...this.ContactDetailsObject },
        };

        if (tabNumber === 7) {
            this.forwardedData.LastPageVisited = state === 'none' ? 'ownership' : 'contact-information';
            this.ContactDetailsObject.LastPageVisited = state === 'none' ? 'ownership' : 'contact-information';
            this.forwardedData.ContactInfoLastTabVisited = tabNumber - 1;
        } else {
            this.forwardedData.LastPageVisited = 'contact-information';
            this.ContactDetailsObject.LastPageVisited = 'contact-information';
            this.forwardedData.ContactInfoLastTabVisited = state === 'none' || state === 'editBilingPhysicalForm' ? tabNumber : tabNumber - 1;
        }
        if (state !== 'invalid') {
            if (this.loggedInUserType === 'Internal') {
                this.sendJsonInternalEmployee(this.ContactDetailsObject, tabNumber, approvalJsonContactApproval);
                return;
            }
            if (this.loginDetails[0].ContrID > 0) {
                let approvalObject;
                if (this.ContactDetailsObject.BillingFax === null) {
                    this.ContactDetailsObject.BillingFax = '';
                }
                if (this.ContactDetailsObject.BillingEmail === null) {
                    this.ContactDetailsObject.BillingEmail = '';
                }

                if (this.ContactDetailsObject.CrawfordContractorConnectionTrainingContact === null) {
                    this.ContactDetailsObject.CrawfordContractorConnectionTrainingContact = '';
                }
                approvalObject = this._srvContractorRegistration.differenceCompany(this.ContactDetailsObject, this.dbData.ContactDetails, this.approvalGetObject);
                if (this.approvalGetObject) {
                    const ContactNumber = [];
                    this.ContactDetailsObject.ContactNumbers.forEach((el: any, ind) => {
                        if (this.approvalGetObject.ContactNumbers && this.approvalGetObject.ContactNumbers.find((pendingEl) => pendingEl.ContactNumberType === el.ContactNumberType)) {
                            const numberIndex = this.approvalGetObject.ContactNumbers.findIndex((pendingEl) => pendingEl.ContactNumberType === el.ContactNumberType);
                            if (numberIndex !== -1) {
                                if (el.ContactNumber !== this.approvalGetObject.ContactNumbers[numberIndex].ContactNumber) {
                                    ContactNumber.push(el);
                                }
                            }
                        } else if (this.dbData.ContactDetails.ContactNumbers.find((dbEl) => dbEl.ContactNumberType === el.ContactNumberType)) {
                            const numberIndex = this.dbData.ContactDetails.ContactNumbers.findIndex((pendingEl) => pendingEl.ContactNumberType === el.ContactNumberType);
                            if (numberIndex !== -1) {
                                if (el.ContactNumber !== this.dbData.ContactDetails.ContactNumbers[numberIndex].ContactNumber) {
                                    ContactNumber.push(el);
                                }
                            }
                        }
                    });

                    // logic for comparing Address Array with Approval JSON and DB JSON
                    const Address = [];
                    this.ContactDetailsObject.Address.forEach((el: any, ind) => {
                        let ObjectFoundInApproval = false;
                        if (this.approvalGetObject.Address) {
                            ObjectFoundInApproval = this.approvalGetObject.Address.find((pendingEl) => pendingEl.AddressType === el.AddressType);
                        }
                        if (ObjectFoundInApproval) {
                            const ObjectIndexInApproval = this.approvalGetObject.Address.findIndex((pendingEl) => pendingEl.AddressType === el.AddressType);
                            const objectInDb = this.dbData.ContactDetails.Address.findIndex(elem => elem.AddressType === el.AddressType)
                            const objectinContactObj = this.ContactDetailsObject.Address.findIndex(elem => elem.AddressType === el.AddressType)
                            const objData = this._srvContractorRegistration.differenceCompany(
                                this.ContactDetailsObject.Address[objectinContactObj],
                                this.dbData.ContactDetails.Address[objectInDb],
                                this.approvalGetObject.Address[ObjectIndexInApproval]
                            );
                            const keyToContain = { AddressType: el.AddressType, ...objData };
                            if (Object.keys(keyToContain).length > 1) {
                                Address.push(keyToContain);
                            }
                        } else {
                            const ObjectIndexInApproval = this.dbData.ContactDetails.Address.findIndex((pendingEl) => pendingEl.AddressType === el.AddressType);
                            const objData = this._srvContractorRegistration.differenceCompany(
                                this.ContactDetailsObject.Address[ObjectIndexInApproval],
                                this.dbData.ContactDetails.Address[ObjectIndexInApproval],
                                {}
                            );
                            const keyToContain = { AddressType: el.AddressType, ...objData };
                            if (Object.keys(keyToContain).length > 1) {
                                Address.push(keyToContain);
                            }
                        }
                    });

                    if (!Address.length) {
                        delete approvalObject.Address;
                    } else {
                        approvalObject.Address = Address;
                    }

                    if (ContactNumber.length) {
                        approvalObject.ContactNumbers = ContactNumber;
                    } else {
                        delete approvalObject.ContactNumbers;
                    }
                }

                const combinedObj: any = { ...approvalObject };
                const editObj: any = {};
                delete combinedObj.IsMailingAddressPhysicalAddressSame;
                delete combinedObj.IsBillingAddressPhysicalAddressSame;
                editObj.ResourceId = this.resourceId;
                editObj.ContractorResourceID = this._srvAuthentication.Profile.ContractorResourceID;
                editObj.CCOpsID = this.loginDetails[0].CCOpsID;
                editObj.CCOpsData = JSON.stringify({ ContactDetails: combinedObj });
                editObj.Contr_ID = this.ContrID;
                editObj.PageName = 'Contact Information Page';
                const mergedData = { ...this.revertData.ContactDetails, ...combinedObj };
                if (Object.keys(mergedData).length) {
                    await this._srvContractorData.saveContractorData(
                        { currentPage: 'Contact Information Page', nextPage: tabNumber !== 7 ? 'contact-information' : 'ownership' },
                        { ContactDetails: mergedData },
                        'ContactInfo/EditEventContactInfo'
                    );
                } else {
                    await this._srvContractorData.saveContractorData(
                        { currentPage: 'Contact Information Page', nextPage: tabNumber !== 7 ? 'contact-information' : 'ownership' },
                        null,
                        'ContactInfo/EditEventContactInfo'
                    );
                }
                if (tabNumber !== 7) {
                    this.success.next({ msg: 'success', data: { ContactDetails: mergedData, ContactInfoLastTabVisited: tabNumber } });
                }
                if (tabNumber === 7) {
                    if (!Object.keys(mergedData).length) {
                        await this._srvContractorData.saveContractorData({ currentPage: 'Contact Information Page', nextPage: 'ownership' }, null, 'ContactInfo/EditEventContactInfo');
                    }
                    if (this._srvAuthentication.Profile.EventName !== 'No Event') {
                        this._route.navigate(['/contractorRegistration/ownership']);
                    }
                    this.success.next({ msg: 'success', data: { ContactDetails: mergedData, ContactInfoLastTabVisited: tabNumber } });
                }
                return true;
            } else {
                this.objProgram.ResourceId = this.resourceId;
                this.objProgram.CCOpsID = this.loginDetails[0].CCOpsID;
                this.forwardedData.ContractorResourceNumber = this._srvAuthentication.Profile.ContractorResourceID;
                // this.ContactDetailsObject.CCopsId=this.loginDetails[0].CCOpsID;
                // this.ContactDetailsObject.ResourceId=this.resourceId
                const finalContactObject: ContactDetail = {
                    ContactDetails: this.ContactDetailsObject,
                    ResourceId: this.resourceId,
                    CCopsId: this.loginDetails[0].CCOpsID,
                };
                finalContactObject.LastPageVisited = tabNumber !== 7 ? 'contact-information' : 'ownership';
                this.objProgram.CCOpsData = JSON.stringify({ ContractorData: this.forwardedData });
                this._srvContactApi.putContactDetail('ContactInfo/SaveContactInformation', finalContactObject).then((response) => {
                    if (response === 1) {
                        if (tabNumber !== 7) {
                            this.success.next({ msg: 'success', data: this.forwardedData });
                        }
                        if (tabNumber === 7) {
                            this.incomingData.next({});
                            this._route.navigate(['/contractorRegistration/ownership']);
                        }
                    }
                });

                // this.requestDataPut = this._srvContactApi.putContactDetails('ContactInfo/SaveContactInformation', this.ContactDetailsObject)//this.api.put('ContactInfo/SaveContactInformation', this.ContactDetailsObject)
                // .subscribe((res) => {
                //     if (res === 1) {
                //         if (tabNumber !== 7) {
                //             this.success.next({ msg: 'success', data: this.forwardedData });
                //         }
                //         if (tabNumber === 7) {
                //             this.incomingData.next({});
                //             this.route.navigate(['/contractorRegistration/ownership']);
                //         }
                //     }
                // });
            }
        } else if (state === 'invalid') {
            this.success.next({ msg: 'fail', data: this.objProgram });
        }
    }

    public sendJsonInternalEmployee(data, tabNumber, approvalJsonContactApproval) {
        const dbData = approvalJsonContactApproval;
        const approvalObject: any = this._srvContractorRegistration.difference(data, dbData);
        const ContactNumbers = [];
        data.ContactNumbers.forEach((el, index) => {
            if (
                data.ContactNumbers[index].ContactNumberType !== dbData.ContactNumbers[index].ContactNumberType ||
                data.ContactNumbers[index].ContactNumber !== dbData.ContactNumbers[index].ContactNumber
            ) {
                const obj = { ContactNumberType: data.ContactNumbers[index].ContactNumberType, ContactNumber: data.ContactNumbers[index].ContactNumber };
                ContactNumbers.push(obj);
            }
        });

        const AddressDiff = this.findDiffenceInArrays(dbData.Address, data.Address, 'AddressType');
        if (!AddressDiff.length) {
            delete approvalObject.Address;
        } else {
            approvalObject.Address = AddressDiff;
        }

        if (ContactNumbers.length > 0) {
            approvalObject.ContactNumbers = ContactNumbers;
        } else {
            delete approvalObject.ContactNumbers;
        }
        const combinedObj = { ...this.approvalGetObject, ...approvalObject };
        const mergedData = { ...this.revertData.ContactDetails, ...combinedObj };
        this.objProgram.Contr_ID = this.ContrID;
        this.objProgram.ResourceId = this._srvAuthentication.ProfileInternal.ResourceID;
        this.objProgram.CCOpsID = this.loginDetails[0].CCOpsID;
        this.objProgram.CCOpsData = JSON.stringify({ ContactDetails: approvalObject });
        this.objProgram.PageName = 'Contact Information Page';
        this.objProgram.ContractorResourceID = this._srvAuthentication.Profile.ContractorResourceID;
        this._api.put('JSON/EditJsonDataInternal', this.objProgram).subscribe((res) => {
            if (res === 1) {
                if (tabNumber !== 7) {
                    this.success.next({ msg: 'success', data: { ContactDetails: mergedData, ContactInfoLastTabVisited: tabNumber } });
                }
                if (tabNumber === 7) {
                    this.incomingData.next({});
                    this.success.next({ msg: 'success', data: { ContactDetails: mergedData, ContactInfoLastTabVisited: tabNumber } });
                }
            }
        });
    }

    public mailingToggleAPI(state: boolean, objectData) {
        const index = this.forwardedData.ContactDetails.Address.findIndex((element) => element.AddressType === 'Mailing');

        if (state === true) {
            this.forwardedData.ContactDetails.IsMailingAddressPhysicalAddressSame = true;

            if (index === -1) {
                this.forwardedData.ContactDetails.Address.push({ ...objectData, AddressType: 'Mailing' });
            } else {
                this.forwardedData.ContactDetails.Address[index] = { ...objectData, AddressType: 'Mailing' };
            }
        } else if (state === false) {
            this.forwardedData.ContactDetails.IsMailingAddressPhysicalAddressSame = false;

            if (index !== -1) {
                this.forwardedData.ContactDetails.Address[index] = { ...objectData, AddressType: 'Mailing' };
            }
        }
    }

    public billingToggleAPI(state: boolean, objectData) {
        const index = this.forwardedData.ContactDetails.Address.findIndex((element) => element.AddressType === 'Billing');
        if (state === true) {
            this.forwardedData.ContactDetails.IsBillingAddressPhysicalAddressSame = true;
            if (index === -1) {
                this.forwardedData.ContactDetails.Address.push({ ...objectData, AddressType: 'Billing' });
            } else {
                this.forwardedData.ContactDetails.Address[index] = { ...objectData, AddressType: 'Billing' };
            }
        } else if (state === false) {
            this.forwardedData.ContactDetails.IsBillingAddressPhysicalAddressSame = false;
            if (index !== -1) {
                this.forwardedData.ContactDetails.Address[index] = { ...objectData, AddressType: 'Billing' };
            }
        }
    }

    // Get Page Json Data
    public getPageJSONData(): Promise<any> {
        let URL: string = `${this.baseUrlAlt}JSON/GetJSON/${this.loginDetails[0].ResourceID}/${this.loginDetails[0].CCOpsID}`;
        if (this.loginDetails[0].ContrID > 0) {
            const currentLangId = this._srvAuthentication.currentLanguageID;
            const params: {} = {
                params: {
                    contrID: this.loginDetails[0].ContrID,
                    pageName: 'Contact Information Page',
                    resourceID: this.resourceId,
                    userLanguageID: currentLangId,
                },
            };
            URL = `${this.baseUrlAlt}JSON/GetContractorData`;
            return this._http.get<any>(URL, params).pipe(catchError(this.handleError)).toPromise();
        }
        return this._http.get<any>(URL).pipe(catchError(this.handleError)).toPromise();
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }

    public findDiffenceInArrays(compareWith, arrToCompare, keyToContain) {
        const Differnce = [];
        arrToCompare.forEach(
            (x) =>
                !compareWith.some((y) => {
                    const a = {};
                    const b = {};
                    Object.keys(y)
                        .sort()
                        .forEach((key) => {
                            a[key] = y[key];
                            b[key] = x[key];
                        });
                    if (JSON.stringify(a) !== JSON.stringify(b)) {
                        const resultSet = Object.keys(a).filter((key) => a[key] !== b[key] && key !== keyToContain && a[keyToContain] === b[keyToContain]);
                        if (resultSet.length) {
                            const obj = { [keyToContain]: b[keyToContain] };
                            resultSet.forEach((key) => Object.assign(obj, { [key]: b[key] }));
                            Differnce.push(obj);
                        }
                    }
                })
        );

        return Differnce;
    }

    public findIndex(addressType: string) {
        if (this.forwardedData === undefined) {
            this.forwardedData = this.incomingData.value;
        }

        return this.forwardedData.ContactDetails.Address.findIndex((element) => element.AddressType === addressType);
    }

    ngOnDestroy() {
        if (this.requestDataPut) {
            this.requestDataPut.unsubscribe();
        }
        if (this.subIncomingData) {
            this.subIncomingData.unsubscribe();
        }
    }
}
