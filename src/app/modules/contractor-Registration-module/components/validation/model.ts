export interface ValidationInfo {
    ContactDetails?: ContactDetails | null,
    CompanyDetails?: CompanyDetails | null,
    OwnershipDetails?: OwnershipDetails | null,
    ResourceId?: number,
    CCopsId?: number,
    LastPageVisited?: string
}
export interface OwnershipDataObj {
    OwnershipDetails?: OwnershipDetails
}
export interface OwnershipDetails {
    OwnershipStructure?: number | string,
    ExchangeListing?: string | '',
    StockSymbol?: string | '',
    YearsInCurrentOwnership?: number,
    MonthsInCurrentOwnership?: number,
    OwnershipInformationList?: OwnershipInformationList[]
}
export interface OwnershipInformationList {
    PRNL_ID: number,
    OwnershipNumber: number,
    ID: number,
    OwnershipName: string,
    ContrEmployeeTypeId: number | string,
    ContactEmail: string,
    ContactPhone: string,
    VeteranEmployeeMilitaryAffiliation: string | '',
    SocialSecurityNumber: string | '',
    DrivingLicense: string,
    DateOfBirth: string | Date,
    OwnershipPercentage: any,
    IsContractorActive: boolean | string | 'true' | 'false',
    VeteranFlag: string | boolean | 'false' | 'true',
    VeteranEmployeeHireDate: string | '',
    LegalIssueFlag: string | '' | boolean,
    ActiveFlag: boolean,
    ContractorLegalIssue: string | null,
    VeteranMilitaryAffiliationData: VeteranMilitaryAffiliationData[] | null,
    TimeStamp: Date | null,
    ResourceId: number,
    CCopsId: number,
    LastPageVisited: string | null,
    VeteranMilitaryAffiliationDataCue?: boolean,
    IsDeletedFlag?:boolean,
    IsRecoveredFlag?:boolean,
    IsRowDisable?: boolean,
  



    OwnershipNameCue?: boolean,
    ContactEmailCue?: boolean,
    ContrEmployeeTypeIdCue?: boolean,
    ContactPhoneCue?: boolean,
    VeteranEmployeeMilitaryAffiliationCue?: boolean,
    SocialSecurityNumberCue?: boolean,
    DrivingLicenseCue?: boolean,
    DateOfBirthCue?: boolean,
    OwnershipPercentageCue?: boolean,
    IsContractorActiveCue?: boolean,
    VeteranFlagCue?: boolean,
    VeteranEmployeeHireDateCue?: boolean,
    LegalIssueFlagCue?: boolean,
    ActiveFlagCue?: boolean,
}
export interface OwnershipInformationListOptional {
    PRNL_ID?: number,
    OwnershipNumber?: number,
    ID?: number,
    OwnershipName?: string,
    ContrEmployeeTypeId?: number | string,
    ContactEmail?: string,
    ContactPhone?: string,
    VeteranEmployeeMilitaryAffiliation?: string | '',
    SocialSecurityNumber?: string | '',
    DrivingLicense?: string,
    DateOfBirth?: string | Date,
    OwnershipPercentage?: number | string,
    IsContractorActive?: boolean | string | 'true' | 'false',
    VeteranFlag?: string | boolean | 'false' | 'true',
    VeteranEmployeeHireDate?: string | '',
    LegalIssueFlag?: string | '' | boolean,
    ActiveFlag?: true,
    ContractorLegalIssue?: string | null,
    VeteranMilitaryAffiliationData?: VeteranMilitaryAffiliationData[] | null,
    TimeStamp?: Date | null,
    ResourceId?: number,
    CCopsId?: number,
    LastPageVisited?: string | null,
    VeteranMilitaryAffiliationDataCue?: boolean



    OwnershipNameCue?: boolean,
    ContactEmailCue?: boolean,
    ContrEmployeeTypeIdCue?: boolean,
    ContactPhoneCue?: boolean,
    VeteranEmployeeMilitaryAffiliationCue?: boolean,
    SocialSecurityNumberCue?: boolean,
    DrivingLicenseCue?: boolean,
    DateOfBirthCue?: boolean,
    OwnershipPercentageCue?: boolean,
    IsContractorActiveCue?: boolean,
    VeteranFlagCue?: boolean,
    VeteranEmployeeHireDateCue?: boolean,
    LegalIssueFlagCue?: boolean,
    ActiveFlagCue?: boolean,
}
export interface VeteranMilitaryAffiliationData {
    ContractorVeteranEmployeeNumber: number,
    MilitaryAffiliationNumber: number,
    AddedDate: Date,
    AddedResourceID: number,
    RemovedDate: Date,
    RemovedResourceID: number,
    MilitaryAffiliationName: string,
    MilitaryAffiliationNameCue?: boolean,
    EmployeeHireDate?: Date | null | string
}

export interface ContactDetails {
    BillingCompanyName?: string,
    BillingContactName?: string,
    BillingPhone?: string,
    BillingFax?: string,
    BillingEmail?: string,
    ContractorEmails?: string,
    CrawfordContractorConnectionContactName?: string,
    CrawfordContractorConnectionContactNumber?: string,
    CrawfordContractorConnectionContactEmail?: string,
    CrawfordContractorConnectionTrainingContact?: string | '',
    IsMailingAddressPhysicalAddressSame?: boolean,
    IsBillingAddressPhysicalAddressSame?: boolean,
    ContactNumbers?: ContactNumbers[],
    Address?: Address[],
    ResourceId?: number,
    CCopsId?: number,
    LastPageVisited?: string
}

export interface ContactNumbers {
    ContactNumberType: string,
    ContactNumber: number
}
export interface Address {
    AddressType: string,
    StreetAddress: string,
    StreetAddress2: string,
    City: string,
    State: string,
    PostalCode: string
}

export interface CompanyDetails {
    CompanyName?: string;
    CompanyLegalName?: string;
    WebSite?: string;
    ContractorFederalTaxNumber?: string;
    ContractorFranchiseSelectedNumber?: number;
    ContractorCountryCode?: number;
    ContractorXactNetAddress?: string;
    ContractorSymbilityAddress?: string;
    ContractorOpeningDate?: string | Date;
    ContractorPercentOfOverallBusinessSubContracted?: number;
    ContractorCentralHeardMethod?: string;
    CountOfEmployeesInContractorCompany?: number;
    ContractorEmployeeUniformFlag?: boolean;
    ContractorEmployeeIdentificationFlag?: boolean;
    WorkersCompanyMinimumRequirementFlag?: boolean;
    IsWorkersCompanyMinimumRequirementFlagDisable?: boolean | null | string;
    ContractorMoistureData?: ContractorMoistureData[];
    ResourceId?: number,
    CCopsId?: number,
    LastPageVisited?: string
}
export interface ContractorMoistureData {
    SupportedFlag: boolean;
    IsSupportedFlag: boolean | null;
    VendorNumber: number;
    PreferredFlag: boolean;
    IsPreferredFlag: boolean | null;
}
export interface ModelInfo {
    dbaName: string,
    taxId: string,
    cName: string,
    cEmail: string,
    companyName: string,
    cPhone: string,
    dbaNameVC?: boolean,
    taxIdVC?: boolean,
    cNameVC?: boolean,
    cPhoneVC?: boolean,
    cEmailVC?: boolean,
}
export class VisualCue {
    YearsInCurrentOwnershipCue: boolean
    MonthsInCurrentOwnership: boolean
    OwnershipStructure: boolean
    ExchangeListing: boolean
    StockSymbol: boolean
    ActiveFlag: boolean
    ContactEmailCue: boolean
    ContactPhoneCue: boolean
    VeteranEmployeeMilitaryAffiliationCue: boolean
    SocialSecurityNumberCue: boolean
    DrivingLicenseCue: boolean
    DateOfBirthCue: boolean
    OwnershipPercentageCue: boolean
    IsContractorActiveCue: boolean
    VeteranFlagCue: boolean
    VeteranEmployeeHireDateCue: boolean
    LegalIssueFlagCue: boolean
    ActiveFlagCue: boolean
    OwnershipNameCue: boolean
    ContrEmployeeTypeIdCue: boolean
    OwnershipInformationList?: OwnershipInformationList[]
}

export interface EditObj {
    ResourceId?: number;
    ContractorResourceID?: number;
    CCOpsID?: number;
    CCOpsData?: string;
    Contr_ID?: number;
    PageName?: string;
}

 export interface DisableEvent  {
    IsCrawfordContractorConnectionContactNameDisable: boolean,
    IsCrawfordContractorConnectionContactNumberDisable: boolean,
    IsCrawfordContractorConnectionContactEmailDisable: boolean,
    IsCompanyNameDisable: boolean,
    IsContractorFederalTaxNumberDisable: boolean
}
