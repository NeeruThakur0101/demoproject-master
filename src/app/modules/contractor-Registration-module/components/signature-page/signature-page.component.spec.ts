// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { SignaturePageComponent } from './signature-page.component';
// import { NO_ERRORS_SCHEMA, } from '@angular/core';
// import { DialogsModule, DialogRef } from '@progress/kendo-angular-dialog';
// import { ApiService } from 'src/app/core/services/http-service';
// import { HttpClientModule } from '@angular/common/http';
// import { RouterTestingModule } from '@angular/router/testing';
// import { ButtonsModule } from '@progress/kendo-angular-buttons';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { DialogAlertsComponent } from '../../../../shared-module/components/dialog-alerts/dialog-alerts.component';
// import { SaveAlertComponent } from '../../../../shared-module/components/save-alert.component';
// import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';



// describe('SignaturePageComponent', () => {
//     let component: SignaturePageComponent;
//     let fixture: ComponentFixture<SignaturePageComponent>;
//     beforeEach((() => {
//         TestBed.configureTestingModule({
//             declarations: [SignaturePageComponent, DialogAlertsComponent, SaveAlertComponent],
//             providers: [DialogRef, ApiService],
//             imports: [RouterTestingModule, ButtonsModule, DialogsModule,
//                 HttpClientModule, BrowserAnimationsModule],
//             schemas: [NO_ERRORS_SCHEMA]
//         })
//             .overrideModule(BrowserDynamicTestingModule, {
//                 set: {
//                     entryComponents: [SaveAlertComponent, DialogAlertsComponent]
//                 }
//             })
//             .compileComponents();
//     }));

//     beforeEach(async () => {
//         fixture = TestBed.createComponent(SignaturePageComponent);
//         component = fixture.componentInstance;


//     });

//     it('should create', () => {
//         component.loginData = () => { }
//         component.loginDetails = [{
//             ResourceID: 2490604,
//             EmployeeFullName: "Priyanka  Raghuvanshi",
//             CompanyName: "primus",
//             CountryID: 1,
//             CCOpsID: 203,
//             ResourceType: "Contractor",
//             IsOwnerPrinciple: true,
//             Email: "priyanka@primussoft.com"
//         }]
//         expect(component).toBeDefined();
//     });

//     it('should call dataToSend function', () => {
//         const data = 'dataToSend';
//         component.dataToSend();
//         expect(component.dataToSend).toBeDefined();
//     });

//     it('should call submit function', () => {
//         // component.ContractorSignatureInitials.length;
//         const event = 'submit';
//         component.submit();
//         expect(component.submit).toBeDefined();
//     });

//     it('should call backButtonClick', () => {
//         component.ContractorSignatureInitials = 'hvg';
//         component.save = false;
//         component.backButtonClick();
//         expect(component.doSomething).toBeDefined();
//     });

//     it('should call onSaveNext', () => {
//         component.ContractorSignatureInitials = 'hvg';
//         component.save = false;
//         component.onSaveNext();
//         expect(component.onSaveNext).toBeDefined();
//     });

//     it('should call loginData function', () => {
//         const response = [{
//             ResourceID: 2490604,
//             EmployeeFullName: "Priyanka Raghuvanshi",
//             CompanyName: "primus",
//             CountryID: 1,
//             CCOpsID: 203,
//             ResourceType: "Contractor",
//             IsOwnerPrinciple: true,
//             Email: "priyanka@primussoft.com",
//             CCOpsData: '{"ContractorData":{"ContractorCentralAccountNumber":254,"LastPageVisited":"validation","ContractorNumber":"null","CreatedDate":"26-12-2019","CreatedResourceNumber":2490608,"SubmissionDate":"null","SubmittedResourceNumber":"null","ApprovedDate":"null","CompleteApplication":{"ApplicationAndProgramTypes":[{"ContractorApplicationTypeNumber":"6","TradeNumber":"27","TradeSelectedDate":"26-12-2019","TradeRemovedDate":"26-12-2019"},{"ContractorApplicationTypeNumber":"6","TradeNumber":"3","TradeSelectedDate":"26-12-2019","TradeRemovedDate":"null"},{"ContractorApplicationTypeNumber":"5","TradeNumber":"68","TradeSelectedDate":"26-12-2019","TradeRemovedDate":"26-12-2019"},{"ContractorApplicationTypeNumber":"5","TradeNumber":"70","TradeSelectedDate":"26-12-2019","TradeRemovedDate":"26-12-2019"}],"FinancialDeferralGuidelines":{"FinancialDeferralGuidelineNumber":"null","FinancialDeferralUpdateDate":"26-12-2019","FinancialDeferralUpdateResourceNumber":2490608,"FinancialDeferralRemoveDate":"26-12-2019","FinancialDeferralRemoveResourceNumber":2490608}},"CompanyDetails":{"CompanyName":"CC","CompanyLegalName":"CC","WebSite":"","ContractorFederalTaxNumber":"1111111111","ContractorFranchiseSelectedNumber":16,"ContractorCountryCode":1,"ContractorXactNetAddress":"","ContractorSymbilityAddress":"","ContractorOpeningDate":"2019-12-17","ContractorPercentOfOverallBusinessSubContracted":"11","ContractorCentralHeardMethod":"cc","CountOfEmployeesInContractorCompany":"123","ContractorEmployeeUniformFlag":false,"ContractorEmployeeIdentificationFlag":false,"WorkersCompanyMinimumRequirementFlag":false,"ContractorMoistureData":[{"VendorNumber":18,"PreferredFlag":false,"SupportedFlag":false},{"VendorNumber":17,"PreferredFlag":false,"SupportedFlag":false},{"VendorNumber":16,"PreferredFlag":false,"SupportedFlag":false}]},"ContactDetails":{"BillingCompanyName":"aaaaaaaaaaa","BillingContactName":"aaaaaaaaaaaa","BillingPhone":"1111111111","BillingFax":"1111111111","BillingEmail":"1@a.com","ContractorEmails":"a@a.com","CrawfordContractorConnectionContactName":"aaaaaaaaaaaaa","CrawfordContractorConnectionContactNumber":"1111111111","CrawfordContractorConnectionContactEmail":"a@a.com","IsMailingAddressPhysicalAddressSame":null,"IsBillingAddressPhysicalAddressSame":null,"ContactNumbers":[{"ContactNumberType":"Office","ContactNumber":"1111111111"},{"ContactNumberType":"Alternate","ContactNumber":"1111111111"},{"ContactNumberType":"Emergency","ContactNumber":"1111111111"},{"ContactNumberType":"Fax","ContactNumber":"1111111111"}],"Address":[{"AddressType":"Physical","StreetAddress":"14 Avenue F, Brooklyn, NY 11218, USA","StreetAddress2":"Sec-15","City":"Rohini","State":6,"PostalCode":"110089"},{"AddressType":"Mailing","StreetAddress":"14 Avenue F, Brooklyn, NY 11218, USA","StreetAddress2":"Sec-15","City":"Rohini","State":6,"PostalCode":"110089"},{"AddressType":"Billing","StreetAddress":"14 Avenue F, Brooklyn, NY 11218, USA","StreetAddress2":"Sec-15","City":"Rohini","State":6,"PostalCode":"110089"}]},"ContactInfoLastTabVisited":6,"LocationInformation":{"OtherNetworkOfficeLocations":false,"OtherSatelliteLocations":false,"ContractorLocationList":[{"CONTR_ID":1,"IsPhysicalAddressSame":true,"FacilityTypeORLocationName":"office","LocationStreetAddress":"14 Avenue F, Brooklyn, NY 11218, USA","City":"Rohini","State":"Arizona","PostalCode":"110089","ContractorLocationTypeNumber":"Office Space","ContractorFacilityTypeNumber":null,"SpaceHoldTypeNumber":null,"ContractorLocationSpaceUse":null,"OfficeOwnedIndicator":null,"SeparateOfficeFlag":false,"SeparateEntranceFlag":false},{"CONTR_ID":2,"IsPhysicalAddressSame":true,"FacilityTypeORLocationName":"warehouse","LocationStreetAddress":"14 Avenue F, Brooklyn, NY 11218, USA","City":"Rohini","State":"Arizona","PostalCode":"110089","ContractorLocationTypeNumber":"Warehouse Space","ContractorFacilityTypeNumber":null,"SpaceHoldTypeNumber":null,"ContractorLocationSpaceUse":null,"OfficeOwnedIndicator":null,"SeparateOfficeFlag":false,"SeparateEntranceFlag":false},{"CONTR_ID":3,"IsPhysicalAddressSame":true,"FacilityTypeORLocationName":"showroom","LocationStreetAddress":"14 Avenue F, Brooklyn, NY 11218, USA","City":"Rohini","State":"Arizona","PostalCode":"110089","ContractorLocationTypeNumber":"Showroom Space","ContractorFacilityTypeNumber":null,"SpaceHoldTypeNumber":null,"ContractorLocationSpaceUse":null,"OfficeOwnedIndicator":null,"SeparateOfficeFlag":false,"SeparateEntranceFlag":false}]},"JobVolumeInformation":[{"JobVolumeNumber":"null","serial_no":1,"Year":"2019","ResidentialInsuranceRestorationInPercentage":"25","CommercialInsuranceRestorationInPercentage":"25","ResidentialRemodellingInPercentage":"25","CommercialRemodellingInPercentage":"25","LargestSingleJobInYear":"123","AverageJobAmountInYear":"132"}],"ReferenceInformation":[{"ReferenceNumber":1,"ReferenceTypeNumber":"Commercial","ReferenceName":"Ref1","ReferenceEmail":"1@a.com","ReferencePhoneNumber":"1111111111","ReferenceCompanyName":"CompA","ReferencePosition":"12313213","JobType":"Basement Remodeling","ReferenceComment":"","AdditionalContactName":""},{"ReferenceNumber":2,"ReferenceName":"Ref2","ReferenceTypeNumber":"Commercial","ReferenceCompanyName":"Comp2","ReferencePosition":"pos2","ReferencePhoneNumber":"1111111111","ReferenceEmail":"1@1.com","JobType":"Basement Remodeling","AdditionalContactName":"","ReferenceComment":""},{"ReferenceNumber":3,"ReferenceName":"Ref3","ReferenceTypeNumber":"Commercial","ReferenceCompanyName":"Comp3","ReferencePosition":"Pos3","ReferencePhoneNumber":"1111111111","ReferenceEmail":"a@a.com","JobType":"Basement Remodeling","AdditionalContactName":null,"ReferenceComment":null},{"ReferenceNumber":4,"ReferenceName":"Ref4","ReferenceTypeNumber":"Material Supply","ReferenceCompanyName":"Mat","ReferencePosition":"Pos5","ReferencePhoneNumber":"1111111111","ReferenceEmail":"a@a.com","JobType":"N/A","AdditionalContactName":null,"ReferenceComment":null},{"ReferenceNumber":5,"ReferenceName":"Ref5","ReferenceTypeNumber":"Material Supply","ReferenceCompanyName":"Mat","ReferencePosition":"Pos","ReferencePhoneNumber":"1111111111","ReferenceEmail":"A@a.com","JobType":"N/A","AdditionalContactName":null,"ReferenceComment":null},{"ReferenceNumber":6,"ReferenceName":"Ref6","ReferenceTypeNumber":"Material Supply","ReferenceCompanyName":"Mat","ReferencePosition":"Pos","ReferencePhoneNumber":"1211111111","ReferenceEmail":"a@a.com","JobType":"N/A","AdditionalContactName":null,"ReferenceComment":null},{"ReferenceNumber":7,"ReferenceName":"Res1","ReferenceTypeNumber":"Residential","ReferenceCompanyName":"N/A","ReferencePosition":"N/A","ReferencePhoneNumber":"1111111111","ReferenceEmail":"a@a.com","JobType":"Bathroom Remodeling","AdditionalContactName":null,"ReferenceComment":null},{"ReferenceNumber":8,"ReferenceName":"Res2","ReferenceTypeNumber":"Residential","ReferenceCompanyName":"N/A","ReferencePosition":"N/A","ReferencePhoneNumber":"1111111111","ReferenceEmail":"res@c.com","JobType":"Bedroom Remodeling","AdditionalContactName":null,"ReferenceComment":null},{"ReferenceNumber":9,"ReferenceName":"Res3","ReferenceTypeNumber":"Residential","ReferenceCompanyName":"N/A","ReferencePosition":"N/A","ReferencePhoneNumber":"1111111111","ReferenceEmail":"a@a.com","JobType":"Bedroom Remodeling","AdditionalContactName":null,"ReferenceComment":null},{"ReferenceNumber":10,"ReferenceName":"Sub1","ReferenceTypeNumber":"Subcontractor","ReferenceCompanyName":"Comp1","ReferencePosition":"Pos1","ReferencePhoneNumber":"1111111111","ReferenceEmail":"1@1.com","JobType":"N/A","AdditionalContactName":"","ReferenceComment":""},{"ReferenceNumber":11,"ReferenceName":"Sub2","ReferenceTypeNumber":"Subcontractor","ReferenceCompanyName":"Comp2","ReferencePosition":"Pos2","ReferencePhoneNumber":"1111111111","ReferenceEmail":"a@a.com","JobType":"N/A","AdditionalContactName":null,"ReferenceComment":null},{"ReferenceNumber":12,"ReferenceName":"Name","ReferenceTypeNumber":"Subcontractor","ReferenceCompanyName":"Comp","ReferencePosition":"Pos","ReferencePhoneNumber":"1111111111","ReferenceEmail":"a@a.com","JobType":"N/A","AdditionalContactName":null,"ReferenceComment":null},{"ReferenceNumber":13,"ReferenceName":"asd","ReferenceTypeNumber":"Commercial","ReferenceCompanyName":"asd","ReferencePosition":"asd","ReferencePhoneNumber":"0995346732","ReferenceEmail":"asd@asd.asd","JobType":"Bedroom Remodeling","AdditionalContactName":"","ReferenceComment":""}],"EquipmentInformation":{"IsMarkedCompanyVehicles":"False","EquipmentDetails":[]},"TradeInformation":[{"TradeGroupID":2,"contrTradeID":null,"tradeListID":54,"singleTradeFlg":true,"primaryFlg":false,"SubOutPct":null,"ConsumerFlg":false}],"CoverageProfileInformation":[{"CoverageProfileNumber":null,"CountyRegionNumber":2242,"ContractorCoverageException":[{"CoverageExceptionNumber":null,"CoverageProfileNumber":null,"PostalNumber":"99571"}],"StateProvinceNumber":3,"StateProvinceAbbreviationName":"AK","StateProvinceName":"Alaska","CountryNumber":1,"CoverageProfileTypeNumber":1,"CoverageProfileTypeName":"General"},{"CoverageProfileNumber":null,"CountyRegionNumber":2159,"ContractorCoverageException":[{"CoverageExceptionNumber":null,"CoverageProfileNumber":null,"PostalNumber":"99685"}],"StateProvinceNumber":3,"StateProvinceAbbreviationName":"AK","StateProvinceName":"Alaska","CountryNumber":1,"CoverageProfileTypeNumber":1,"CoverageProfileTypeName":"General"}],"OwnershipDetails":{"OwnershipStructure":4,"ExchangeListing":null,"StockSymbol":null,"YearsInCurrentOwnership":"7","MonthsInCurrentOwnership":"7","OwnershipInformationList":[{"OwnershipNumber":null,"ID":1,"Name":"CC","IsContractorEmployeeOwnerOrPrinciple":"Company","ContactEmail":"","ContactPhone":"","VeteranEmployeeMilitaryAffiliation":"","SocialSecurityNumber":"","DrivingLicense":"","DateOfBirth":"2020-01-03T12:18:40.233Z","OwnershipPercentage":0,"IsContractorActive":"Y","VeteranFlag":"N","VeteranEmployeeHireDate":"","LegalIssueFlag":"N","ActiveFlag":true,"ContractorLegalIssue":[{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null}],"ContractorSignatureInitials":"gj","ContractorSignatureDate":"1/14/2020"},{"OwnershipNumber":null,"ID":2,"Name":"hgf","IsContractorEmployeeOwnerOrPrinciple":"Principal","ContactEmail":"g@sf.fgh","ContactPhone":"345-643-5435","VeteranEmployeeMilitaryAffiliation":"","SocialSecurityNumber":"435434556","DrivingLicense":"56","DateOfBirth":"2020-01-05T18:30:00.000Z","OwnershipPercentage":100,"IsContractorActive":"Y","VeteranFlag":"N","VeteranEmployeeHireDate":null,"LegalIssueFlag":"N","ActiveFlag":true,"ContractorSignatureDate":"1/14/2020","ContractorSignatureInitials":"gj","ContractorLegalIssue":[{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null}]},{"OwnershipNumber":null,"ID":3,"Name":"rr","IsContractorEmployeeOwnerOrPrinciple":"Principal","ContactEmail":"r@df.fg","ContactPhone":"345-687-6545","VeteranEmployeeMilitaryAffiliation":"","SocialSecurityNumber":"567654567","DrivingLicense":"5","DateOfBirth":"2020-01-05T18:30:00.000Z","OwnershipPercentage":100,"IsContractorActive":"N","VeteranFlag":"N","VeteranEmployeeHireDate":null,"LegalIssueFlag":"N","ActiveFlag":true,"ContractorSignatureDate":"1/14/2020","ContractorSignatureInitials":"gj","ContractorLegalIssue":[{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null},{"LegalIssueType":null}]}]}}}'
//         }];
//         component.loginData(response);
//         expect(component.loginData).toBeDefined();
//     });
// });

