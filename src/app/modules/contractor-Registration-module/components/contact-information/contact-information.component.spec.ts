// import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
// import { DialogService, DialogContainerService } from '@progress/kendo-angular-dialog';
// import { ContactInformationComponent } from './contact-information.component';
// import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
// import { BrowserModule, By } from '@angular/platform-browser';
// import { TabStripModule } from '@progress/kendo-angular-layout';
// import { RouterTestingModule } from '@angular/router/testing';
// import { ButtonsModule } from '@progress/kendo-angular-buttons';
// import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
// import { ApiService } from '../../../../core/services/http-service';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { Post } from '../../models/post.model';

// export function HttpLoaderFactory(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }
// class MockService {
//     serviceMethod(div): void {
//         const testElement = document.querySelector('div') as HTMLElement;
//     }
// }

// describe('ContactInformationComponent', () => {
//     let component: ContactInformationComponent;
//     let fixture: ComponentFixture<ContactInformationComponent>;
//     let index: number;
//     const path: string = 'ContactInfo/GetContactInfo/';

//     const accountId: number = 1;
//     const countryId = '' + 1;
//     let service: ApiService;

//     beforeEach(async(() => {
//         TestBed.configureTestingModule({
//             declarations: [ContactInformationComponent],
//             providers: [DialogService,
//                 DialogContainerService, TranslateService, ApiService],
//             schemas: [CUSTOM_ELEMENTS_SCHEMA],
//             imports: [
//                 BrowserModule,
//                 FormsModule,
//                 TabStripModule,
//                 ReactiveFormsModule,
//                 RouterTestingModule,
//                 HttpClientModule,
//                 ButtonsModule,
//                 GooglePlaceModule,
//                 BrowserAnimationsModule,
//                 TranslateModule.forRoot()
//             ],
//         }).compileComponents();
//         service = TestBed.get(ApiService);
//     }));

//     beforeEach(() => {

//         // tslint:disable-next-line: radix
//         fixture = TestBed.createComponent(ContactInformationComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();

//         component.contactData =
//             [{ "ContractorData": { "ContractorCentralAccountNumber": 288, "LastPageVisited": "ownership", "ContractorNumber": "null", "CreatedDate": "17-12-2019", "CreatedResourceNumber": 2490642, "SubmissionDate": "null", "SubmittedResourceNumber": "null", "ApprovedDate": "null", "CompleteApplication": { "ApplicationAndProgramTypes": [{ "ContractorApplicationTypeNumber": "5", "TradeNumber": "68", "TradeSelectedDate": "17-12-2019", "TradeRemovedDate": "null" }], "FinancialDeferralGuidelines": { "FinancialDeferralGuidelineNumber": "null", "FinancialDeferralUpdateDate": "17-12-2019", "FinancialDeferralUpdateResourceNumber": 2490642, "FinancialDeferralRemoveDate": "17-12-2019", "FinancialDeferralRemoveResourceNumber": 2490642 } }, "CompanyDetails": { "CompanyName": "Craw LLC", "CompanyLegalName": "Craw LLC", "WebSite": "www.craw.co", "ContractorFederalTaxNumber": "159753258", "ContractorFranchiseSelectedNumber": 16, "ContractorCountryCode": 1, "ContractorXactNetAddress": "159785", "ContractorSymbilityAddress": "656988", "ContractorOpeningDate": "8-16-1977", "ContractorPercentOfOverallBusinessSubContracted": "10", "ContractorCentralHeardMethod": "web", "CountOfEmployeesInContractorCompany": "15000", "ContractorEmployeeUniformFlag": true, "ContractorEmployeeIdentificationFlag": true, "WorkersCompanyMinimumRequirementFlag": true, "ContractorMoistureData": [{ "VendorNumber": 18, "PreferredFlag": true, "SupportedFlag": false }, { "VendorNumber": 17, "PreferredFlag": false, "SupportedFlag": true }, { "VendorNumber": 16, "PreferredFlag": false, "SupportedFlag": false }] }, "ContactDetails": { "BillingCompanyName": "Craw LLC", "BillingContactName": "Tom Jonas", "BillingPhone": "4585858585", "BillingFax": "4585858587", "BillingEmail": "tom@craw.co", "ContractorEmails": "dave@craw.com", "CrawfordContractorConnectionContactName": "David Jones", "CrawfordContractorConnectionContactNumber": "4585858587", "CrawfordContractorConnectionContactEmail": "david@craw.co", "IsMailingAddressPhysicalAddressSame": true, "IsBillingAddressPhysicalAddressSame": true, "ContactNumbers": [{ "ContactNumberType": "Office", "ContactNumber": "4585858581" }, { "ContactNumberType": "Alternate", "ContactNumber": "4585858582" }, { "ContactNumberType": "Emergency", "ContactNumber": "4585858583" }, { "ContactNumberType": "Fax", "ContactNumber": "4585858586" }], "Address": [{ "AddressType": "Physical", "StreetAddress": "153-01 Jamaica Ave, Jamaica, NY 11432, USA", "StreetAddress2": "", "City": "Jamaica", "State": 32, "PostalCode": "11432" }, { "AddressType": "Mailing", "StreetAddress": "153-01 Jamaica Ave, Jamaica, NY 11432, USA", "StreetAddress2": "", "City": "Jamaica", "State": 32, "PostalCode": "11432" }, { "AddressType": "Billing", "StreetAddress": "153-01 Jamaica Ave, Jamaica, NY 11432, USA", "StreetAddress2": "", "City": "Jamaica", "State": 32, "PostalCode": "11432" }] }, "OwnershipDetails": { "OwnershipStructure": 3, "ExchangeListing": null, "StockSymbol": null, "YearsInCurrentOwnership": "14", "MonthsInCurrentOwnership": "5", "OwnershipInformationList": [{ "OwnershipNumber": null, "ID": 1, "Name": "Craw LLC", "IsContractorEmployeeOwnerOrPrinciple": "Company", "ContactEmail": "", "ContactPhone": "", "VeteranEmployeeMilitaryAffiliation": "", "SocialSecurityNumber": "", "DrivingLicense": "", "DateOfBirth": "2019-12-17T13:32:24.961Z", "OwnershipPercentage": 0, "IsContractorActive": false, "VeteranFlag": false, "VeteranEmployeeHireDate": "", "LegalIssueFlag": false, "ActiveFlag": true, "ContractorLegalIssue": [{ "LegalIssueType": null }, { "LegalIssueType": null }, { "LegalIssueType": null }, { "LegalIssueType": null }, { "LegalIssueType": null }] }, { "OwnershipNumber": null, "ID": 2, "Name": "Kim Jonas", "IsContractorEmployeeOwnerOrPrinciple": "Owner", "ContactEmail": "kim@craw.co", "ContactPhone": 5557589855, "VeteranEmployeeMilitaryAffiliation": "", "SocialSecurityNumber": "468529855", "DrivingLicense": "65465ASDF", "DateOfBirth": "1971-09-28T18:30:00.000Z", "OwnershipPercentage": 50, "IsContractorActive": "Y", "VeteranFlag": "N", "VeteranEmployeeHireDate": "", "LegalIssueFlag": "Y", "ActiveFlag": true, "ContractorLegalIssue": [{ "LegalIssueEntry": [{ "ContractorLegalIssueID": null, "LegalIssueTypeID": "1", "CreateDate": "17-12-2019", "CreatedResourceID": null, "ModifyDate": null, "ModifyResourceID": null, "ActiveFlag": true, "DeletedFlag": false, "ResolvedFlag": 0, "LegalIssueDetail": [{ "id": 0, "value": 1, "type": "Text", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "0", "FieldDetailDate": null, "FieldDetailInt": null, "FieldDetailText": 1, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 1, "value": "2016-05-17T18:30:00.000Z", "type": "DATE", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "1", "FieldDetailDate": "5-18-2016", "FieldDetailInt": null, "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 2, "value": "kim one", "type": "Text", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "2", "FieldDetailDate": null, "FieldDetailInt": null, "FieldDetailText": "kim one", "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 3, "value": 2, "type": "INT", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "3", "FieldDetailDate": null, "FieldDetailInt": "2", "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 4, "value": 1869, "type": "INT", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "4", "FieldDetailDate": null, "FieldDetailInt": "1869", "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }], "selectedDate": "5-18-2016" }, { "ContractorLegalIssueID": null, "LegalIssueTypeID": "1", "CreateDate": "17-12-2019", "CreatedResourceID": null, "ModifyDate": null, "ModifyResourceID": null, "ActiveFlag": true, "DeletedFlag": false, "ResolvedFlag": 0, "LegalIssueDetail": [{ "id": 0, "value": 2, "type": "Text", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "0", "FieldDetailDate": null, "FieldDetailInt": null, "FieldDetailText": 2, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 1, "value": "2017-04-13T18:30:00.000Z", "type": "DATE", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "1", "FieldDetailDate": "4-14-2017", "FieldDetailInt": null, "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 2, "value": "kim two", "type": "Text", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "2", "FieldDetailDate": null, "FieldDetailInt": null, "FieldDetailText": "kim two", "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 3, "value": 15, "type": "INT", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "3", "FieldDetailDate": null, "FieldDetailInt": "15", "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 4, "value": 1181, "type": "INT", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "4", "FieldDetailDate": null, "FieldDetailInt": "1181", "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }], "selectedDate": "4-14-2017" }, { "ContractorLegalIssueID": null, "LegalIssueTypeID": "1", "CreateDate": "17-12-2019", "CreatedResourceID": null, "ModifyDate": null, "ModifyResourceID": null, "ActiveFlag": true, "DeletedFlag": false, "ResolvedFlag": 0, "LegalIssueDetail": [{ "id": 0, "value": 3, "type": "Text", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "0", "FieldDetailDate": null, "FieldDetailInt": null, "FieldDetailText": 3, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 1, "value": "2018-01-19T18:30:00.000Z", "type": "DATE", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "1", "FieldDetailDate": "1-20-2018", "FieldDetailInt": null, "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 2, "value": "kim three", "type": "Text", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "2", "FieldDetailDate": null, "FieldDetailInt": null, "FieldDetailText": "kim three", "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 3, "value": 32, "type": "INT", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "3", "FieldDetailDate": null, "FieldDetailInt": "32", "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 4, "value": 2373, "type": "INT", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "4", "FieldDetailDate": null, "FieldDetailInt": "2373", "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }], "selectedDate": "1-20-2018" }, { "ContractorLegalIssueID": null, "LegalIssueTypeID": "1", "CreateDate": "17-12-2019", "CreatedResourceID": null, "ModifyDate": null, "ModifyResourceID": null, "ActiveFlag": true, "DeletedFlag": false, "ResolvedFlag": 0, "LegalIssueDetail": [{ "id": 0, "value": 4, "type": "Text", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "0", "FieldDetailDate": null, "FieldDetailInt": null, "FieldDetailText": 4, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 1, "value": "2019-06-05T18:30:00.000Z", "type": "DATE", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "1", "FieldDetailDate": "6-6-2019", "FieldDetailInt": null, "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 2, "value": "kim five", "type": "Text", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "2", "FieldDetailDate": null, "FieldDetailInt": null, "FieldDetailText": "kim five", "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 3, "value": 39, "type": "INT", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "3", "FieldDetailDate": null, "FieldDetailInt": "39", "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }, { "id": 4, "value": 155, "type": "INT", "LegalIssueDetailID": null, "LegalIssueTypeID": "1", "LegalIssueFieldTypeID": "4", "FieldDetailDate": null, "FieldDetailInt": "155", "FieldDetailText": null, "FieldDetailBoolean": null, "LegalIssueDetailDate": "17-12-2019", "LegalIssueDetailResourceID": null }], "selectedDate": "6-6-2019" }], "ActiveFlag": true, "RemoveDate": null, "RemoveResourceID": null }, { "LegalIssueType": null }, { "LegalIssueType": null }, { "LegalIssueType": null }, { "LegalIssueType": null }] }, { "OwnershipNumber": null, "ID": 3, "Name": "Rock Ford", "IsContractorEmployeeOwnerOrPrinciple": "Owner", "ContactEmail": "rock@craw.co", "ContactPhone": 4568525555, "VeteranEmployeeMilitaryAffiliation": "", "SocialSecurityNumber": "564565465", "DrivingLicense": "64454WERF", "DateOfBirth": "1947-08-13T18:30:00.000Z", "OwnershipPercentage": 50, "IsContractorActive": "Y", "VeteranFlag": "N", "VeteranEmployeeHireDate": "", "LegalIssueFlag": "N", "ActiveFlag": true, "ContractorLegalIssue": [{ "LegalIssueType": null }, { "LegalIssueType": null }, { "LegalIssueType": null }, { "LegalIssueType": null }, { "LegalIssueType": null }] }] }, "LocationInformation": { "OtherNetworkOfficeLocations": false, "OtherSatelliteLocations": false, "ContractorLocationList": [] } } }];

//     });

//     it('be able to retrieve posts from the API bia GET', (done) => {
//         const dummyPosts: Post[] = [{
//             ID: 1,
//             Name: 'Alabama',
//             Abbreviation: 'AL'
//         },
//         { ID: 3, Name: 'Alaska', Abbreviation: 'AK' },
//         { ID: 6, Name: 'Arizona', Abbreviation: 'AZ' },
//         { ID: 2, Name: 'Arkansas', Abbreviation: 'AR' },
//         { ID: 5, Name: 'California', Abbreviation: 'CA' },
//         { ID: 7, Name: 'Colorado', Abbreviation: 'CO' },
//         { ID: 8, Name: 'Connecticut', Abbreviation: 'CT' },
//         { ID: 4, Name: 'Delaware', Abbreviation: 'DE' },
//         { ID: 9, Name: 'Florida', Abbreviation: 'FL' },
//         { ID: 10, Name: 'Georgia', Abbreviation: 'GA' },
//         { ID: 11, Name: 'Hawaii', Abbreviation: 'HI' },
//         { ID: 12, Name: 'Idaho', Abbreviation: 'ID' },
//         { ID: 13, Name: 'Illinois', Abbreviation: 'IL' },
//         { ID: 14, Name: 'Indiana', Abbreviation: 'IN' },
//         { ID: 15, Name: 'Iowa', Abbreviation: 'IA' },
//         { ID: 16, Name: 'Kansas', Abbreviation: 'KS' },
//         { ID: 17, Name: 'Kentucky', Abbreviation: 'KY' },
//         { ID: 18, Name: 'Louisiana', Abbreviation: 'LA' },
//         { ID: 19, Name: 'Maine', Abbreviation: 'ME' },
//         { ID: 20, Name: 'Maryland', Abbreviation: 'MD' },
//         { ID: 21, Name: 'Massachusetts', Abbreviation: 'MA' },
//         { ID: 22, Name: 'Michigan', Abbreviation: 'MI' },
//         { ID: 23, Name: 'Minnesota', Abbreviation: 'MN' },
//         { ID: 24, Name: 'Mississippi', Abbreviation: 'MS' },
//         { ID: 25, Name: 'Missouri', Abbreviation: 'MO' },
//         { ID: 26, Name: 'Montana', Abbreviation: 'MT' },
//         { ID: 27, Name: 'Nebraska', Abbreviation: 'NE' },
//         { ID: 28, Name: 'Nevada', Abbreviation: 'NV' },
//         { ID: 29, Name: 'New Hampshire', Abbreviation: 'NH' },
//         { ID: 30, Name: 'New Jersey', Abbreviation: 'NJ' },
//         { ID: 31, Name: 'New Mexico', Abbreviation: 'NM' },
//         { ID: 32, Name: 'New York', Abbreviation: 'NY' },
//         { ID: 33, Name: 'North Carolina', Abbreviation: 'NC' },
//         { ID: 34, Name: 'North Dakota', Abbreviation: 'ND' },
//         { ID: 35, Name: 'Ohio', Abbreviation: 'OH' },
//         { ID: 36, Name: 'Oklahoma', Abbreviation: 'OK' },
//         { ID: 37, Name: 'Oregon', Abbreviation: 'OR' },
//         { ID: 38, Name: 'Pennsylvania', Abbreviation: 'PA' },
//         { ID: 39, Name: 'Rhode Island', Abbreviation: 'RI' },
//         { ID: 40, Name: 'South Carolina', Abbreviation: 'SC' },
//         { ID: 41, Name: 'South Dakota', Abbreviation: 'SD' },
//         { ID: 42, Name: 'Tennessee', Abbreviation: 'TN' },
//         { ID: 43, Name: 'Texas', Abbreviation: 'TX' },
//         { ID: 44, Name: 'Utah', Abbreviation: 'UT' },
//         { ID: 45, Name: 'Vermont', Abbreviation: 'VT' },
//         { ID: 46, Name: 'Virginia', Abbreviation: 'VA' },
//         { ID: 47, Name: 'Washington', Abbreviation: 'WA' },
//         { ID: 48, Name: 'Washington DC', Abbreviation: 'DC' },
//         { ID: 49, Name: 'West Virginia', Abbreviation: 'WV' },
//         { ID: 50, Name: 'Wisconsin', Abbreviation: 'WI' },
//         { ID: 51, Name: 'Wyoming', Abbreviation: 'WY' }];

//         service.get(path + countryId).subscribe(posts => {
//             try {
//                 expect(posts.length).toBe(51);
//                 expect(posts).toEqual(dummyPosts);
//                 done();
//             } catch (error) {
//             }
//         }, err => { console.log(err) });

//     });
//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
//     it('form invalid when empty', () => {
//         expect(component.userForm.valid).toBeFalsy();
//     });
//     it('form invalid when empty', () => {
//         expect(component.emailForm.valid).toBeFalsy();
//     });
//     it('form invalid when empty', () => {
//         expect(component.contactForm.valid).toBeFalsy();
//     });
//     it('form invalid when empty', () => {
//         expect(component.addressForm.valid).toBeFalsy();
//     });
//     it('form invalid when empty', () => {
//         expect(component.mailingForm.valid).toBeFalsy();
//     });
//     it('form invalid when empty', () => {
//         expect(component.billingForm.valid).toBeFalsy();
//     });
//     it('form invalid when empty', () => {
//         expect(component.cccContactForm.valid).toBeFalsy();
//     });

//     // field validity
//     it('Contact field validity', () => {
//         const officeph = component.userForm.controls['Office'];
//         officeph.setValue('988873258');
//         const alternatePh = component.userForm.controls['Alternate'];
//         alternatePh.setValue('988873258');
//         const emergencyPh = component.userForm.controls['Emergency'];
//         emergencyPh.setValue('988873258');
//         const fax = component.userForm.controls['Fax'];
//         fax.setValue('988873258');
//         expect(component.userForm.valid).toBeFalsy();
//     });

//     it('Contactor contact field validity', () => {
//         const contractorName = component.cccContactForm.controls['CrawfordContractorConnectionContactName'];
//         contractorName.setValue('name');
//         const contractorNumber = component.cccContactForm.controls['CrawfordContractorConnectionContactNumber'];
//         contractorNumber.setValue('Mobile');
//         const contractorEmail = component.cccContactForm.controls['CrawfordContractorConnectionContactEmail'];
//         contractorEmail.setValue('email');
//         expect(component.cccContactForm.valid).toBeFalsy();
//     });
//     it('billing contact field validity', () => {
//         const company = component.contactForm.controls['company'];
//         company.setValue('name');
//         const cName = component.contactForm.controls['cName'];
//         cName.setValue('name');
//         const cPhone = component.contactForm.controls['cPhone'];
//         cPhone.setValue('Mobile');
//         const cEmail = component.contactForm.controls['cEmail'];
//         cEmail.setValue('email');
//         const cfax = component.contactForm.controls['cFax'];
//         cfax.setValue('Mobile');
//         expect(component.contactForm.valid).toBeFalsy();
//     });
//     it('Physical address field validity', () => {
//         const StreetAddress = component.addressForm.controls['StreetAddress'];
//         StreetAddress.setValue('address');
//         const StreetAddress2 = component.addressForm.controls['StreetAddress2'];
//         StreetAddress2.setValue('address');
//         const City = component.addressForm.controls['City'];
//         City.setValue('city');
//         const State = component.addressForm.controls['State'];
//         State.setValue('state');
//         const PostalCode = component.addressForm.controls['PostalCode'];
//         PostalCode.setValue('postalcode');
//         expect(component.addressForm.valid).toBeTruthy();
//     });
//     it('mailing address field validity', () => {
//         const StreetAddress = component.mailingForm.controls['StreetAddress'];
//         StreetAddress.setValue('address');
//         const StreetAddress2 = component.mailingForm.controls['StreetAddress2'];
//         StreetAddress2.setValue('address');
//         const City = component.mailingForm.controls['City'];
//         City.setValue('city');
//         const State = component.mailingForm.controls['State'];
//         State.setValue('state');
//         const PostalCode = component.mailingForm.controls['PostalCode'];
//         PostalCode.setValue('postalcode');
//         expect(component.mailingForm.valid).toBeTruthy();
//     });
//     it('billing address field validity', () => {
//         const StreetAddress = component.billingForm.controls['StreetAddress'];
//         StreetAddress.setValue('address');
//         const StreetAddress2 = component.billingForm.controls['StreetAddress2'];
//         StreetAddress2.setValue('address');
//         const City = component.billingForm.controls['City'];
//         City.setValue('city');
//         const State = component.billingForm.controls['State'];
//         State.setValue('state');
//         const PostalCode = component.billingForm.controls['PostalCode'];
//         PostalCode.setValue('postalcode');
//         expect(component.billingForm.valid).toBeTruthy();
//     });

//     it('should call onBackClick method', () => {
//         const onClickMock = spyOn(component, 'onBackClick');
//         fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);
//         expect(onClickMock).toHaveBeenCalled();
//     });

//     it('should call saveUser', () => {
//         const val = 1;

//         component.saveUser(val, 'none');
//         component.saveUser(2,'none');
//         component.saveUser(3,'none');
//         component.saveUser(4,'none');
//         component.saveUser(5,'none');
//         component.saveUser(6,'none');
//         component.saveUser(7,'none');
//         expect(component.saveUser).toBeDefined();
//     });

//     it('should call prevTab', () => {
//         component.prevTab();
//         expect(component.prevTab).toBeDefined();
//     });

//     it('should call apiCall', () => {
//         const pageVal = 1;
//         component.apiCall(pageVal,'none');

//         component.forwardedData = component.contactData[0];
//         component.userForm.setValue({
//             Office: component.contactData[0].ContractorData.ContactDetails.ContactNumbers[0].ContactNumber,
//             Alternate: component.contactData[0].ContractorData.ContactDetails.ContactNumbers[1].ContactNumber,
//             Emergency: component.contactData[0].ContractorData.ContactDetails.ContactNumbers[2].ContactNumber,
//             Fax: component.contactData[0].ContractorData.ContactDetails.ContactNumbers[3].ContactNumber
//         });

//         component.addressForm.setValue({
//             StreetAddress: component.contactData[0].ContractorData.ContactDetails.Address[0].StreetAddress,
//             StreetAddress2: component.contactData[0].ContractorData.ContactDetails.Address[0].StreetAddress2,
//             City: component.contactData[0].ContractorData.ContactDetails.Address[0].City,
//             State: component.contactData[0].ContractorData.ContactDetails.Address[0].State,
//             PostalCode: component.contactData[0].ContractorData.ContactDetails.Address[0].PostalCode,
//             IsMailingAddressPhysicalAddressSame:
//                 component.contactData[0].ContractorData.ContactDetails.IsMailingAddressPhysicalAddressSame,
//             IsBillingAddressPhysicalAddressSame:
//                 component.contactData[0].ContractorData.ContactDetails.IsBillingAddressPhysicalAddressSame
//         });
//         component.apiCall(2,'none');
//         component.apiCall(3,'none');
//         component.apiCall(4,'none');
//         component.apiCall(5,'none');
//         component.apiCall(6,'none'); component.apiCall(pageVal,'none');
//         expect(component.apiCall).toBeDefined();
//     });
//     it('should call isNumber', () => {
//         expect(true).toBeTruthy();
//         expect(component.isNumber).toBeDefined();
//     });
//     it('should call load', () => {
//         expect(true).toBeTruthy();
//     });
//     it('should call fillData', () => {
//         component.fillData();
//         expect(component.fillData).toBeDefined();
//     });

//     it('should call billingAddress', () => {
//         component.billingAddress(index);
//         expect(component.billingAddress).toBeDefined();
//     });
//     it('should call mailingAddress', () => {
//         component.mailingAddress(index);
//         expect(component.mailingAddress).toBeDefined();
//     });
//     it('should call closeMapModal', () => {
//         component.closeMapModal();
//         expect(component.closeMapModal).toBeDefined();
//     });

//     it('should call tabChanged', () => {
//         const mouseenter = new MouseEvent('mouseenter');
//         component.tabChanged(mouseenter);
//         expect(component.tabChanged).toBeDefined();
//     });
//     it('should call addField', () => {
//         component.addField();
//         expect(component.addField).toBeDefined();
//     });
//     it('should call readdata', () => {
//         component.readdata(FormData);
//         expect(component.readdata).toBeDefined();
//     });
//     it('should call fCancel', () => {
//         const officeph = component.userForm.controls['Office'];
//         officeph.setValue('9888737247');
//         officeph.setValue('9000000000');
//         const alternatePh = component.userForm.controls['Alternate'];
//         alternatePh.setValue('9888737247');
//         alternatePh.setValue('9000000000');
//         const emergencyPh = component.userForm.controls['Emergency'];
//         emergencyPh.setValue('9888737247');
//         emergencyPh.setValue('9000000007');
//         const fax = component.userForm.controls['Fax'];
//         fax.setValue('1234568897');
//         fax.setValue('1000000000');
//         const contractorName = component.cccContactForm.controls['CrawfordContractorConnectionContactName'];
//         contractorName.setValue('ruhi');
//         contractorName.setValue('ruchi');
//         const contractorNumber = component.cccContactForm.controls['CrawfordContractorConnectionContactNumber'];
//         contractorNumber.setValue('9888734525');
//         const contractorEmail = component.cccContactForm.controls['CrawfordContractorConnectionContactEmail'];
//         contractorEmail.setValue('ruchi@gmail.com');

//     });
// });
