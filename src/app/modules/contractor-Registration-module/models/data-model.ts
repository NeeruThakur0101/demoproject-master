export class UserDetails {
    AccountId: number;
    ResourceId: number;
    CountryId: number;
    CCOpsID: number;
}

export interface ContrMoistureData {
    VendorID: string;
    PreferredFlg: string;
    SupportedFlg: string;
}

export interface Contractor2 {
    percentSubcontracted: string;
    CCHeardMethod: string;
    employeecount: string;
    employeeUniformFlg: string;
    employeeIdentificationFlg: string;
    workersCompMinimumReqFlg: string;

    // ruchi
}

export interface CompanyInformation {
    Contractor: Contractor[];
    ContrMoistureData: ContrMoistureData[];
    Contractor2: Contractor2;
}

export interface ApplicationProgramType {
    ApplicationTypeID: string;
    ContrAppTypeID: string;
    tradeListID: string;
    DateAppTypeSelected: string;
    DateAppTypeRemoved: string;
}

export interface ContractorApplicationType {
    CCOpsID: string;
    CONTR_ID: string;
    ApplicationProgramType: ApplicationProgramType[];
}

export class SelectApplicationModel {
    ResourceId: number;
    CCOpsData: string;
    CCOpsID: number;
    Contr_ID: number;
    LoginUserEmail: string;
    PageName: string;
    ContractorResourceID: number;
    ContractorResourceNumber: number;
}

export interface FastTrackDate {
    FastTrackDateID: string;
    Contr_ID: string;
    UpdateDate: string;
    UpdateResourceID: string;
    RemoveDate: string;
    RemoveResourceID: string;
}

export interface SelectApplicationProgramTypesPage {
    ContractorApplicationType: ContractorApplicationType[];
    FastTrackDate: FastTrackDate[];
}

export class OwnershipInformationPage {
    contrOwnerStructure: ContrOwnerStructure[];
    Contractor: Contractor[];
    Personnel: AddOwnerShipOrPrinciple[];
}

export interface ContrOwnerStructure {
    ownerStructureID: number;
    listing: string;
    symbol: string;
}

export interface Contractor {
    CONTR_YRS_BUS_CT: string;
    CONTR_MOS_BUS_CT: string;
}
export interface AddOwnerShipOrPrinciple {
    OwnershipNumber: number;
    ID: number;
    PRNL_ID: string;
    OwnershipName: string;
    ContactEmail: string;
    ContactPhone: string;
    ContrEmployeeTypeId: number;
    OwnershipPercentage: string;
    IsContractorActive: string;
    VeteranFlag: boolean;
    SocialSecurityNumber: string;
    DrivingLicense: string;
    DateOfBirth: string;
    LegalIssueFlag: boolean;
    ContrLegalIssues: ContrLegalIssues;
    VeteranEmployeeHireDate: string;
    VeteranEmployeeMilitaryAffiliation: [number];
    VeteranMilitaryAffiliationData: VeteranEmployeeData[];
    ActiveFlag: boolean;
    ContractorSignatureInitials: string;
    ContractorSignatureDate: string;
    TimeStamp: string;
    NameCue?: boolean;
    OwnershipNameCue?: boolean;
    ContrEmployeeTypeIdCue?: boolean;
    ContactEmailCue?: boolean;
    ContactPhoneCue?: boolean;
    SocialSecurityNumberCue?: boolean;
    DrivingLicenseCue?: boolean;
    DateOfBirthCue?: boolean;
    VeteranEmployeeMilitaryAffiliationCue?: boolean;
    VeteranEmployeeHireDateCue?: boolean;
    OwnershipPercentageCue?: boolean;
    IsContractorActiveCue?: boolean;
    VeteranFlagCue?: boolean;
    ActiveFlagCue?: boolean;
}

export class JobVolume {
    serial_no: string;
    JobVolumeNumber: string;
    year: string;
    residentialInsurance: string;
    commercialInsurance: string;
    residentialRemodeling: string;
    commercialRemodeling: string;
    largetSingleJob: string;
    avgJobAmount: string;
}

export class AddReference {
    SrNo?: number;
    ReferenceNumber?: number;
    ReferenceTypeNumber?: string;
    ReferenceTypeCode?: number;
    ReferenceName?: string;
    ReferenceEmail?: string;
    ReferencePhoneNumber?: string;
    ReferenceCompanyName?: string;
    ReferencePosition?: string;
    JobType?: string;
    JobTypeNumber?: number;
    ReferenceComment?: string;
    AdditionalContactName?: string;
    ReferenceCommentNumber?: number;
    ContractorReferenceTypeNumber?: number;
}
export interface AddOwnerShip {
    OwnershipNumber: number;
    ID: number;
    PRNL_ID: string;
    PRNL_NM: string;
    PRNL_Email: string;
    PRNL_MPhone: string;
    ContrEmployeeTypeID: string;
    PRNL_OWNRSP_PC: string;
    PRNL_FLAG_IN: boolean;
    VeteranFlg: boolean;
    PRNL_SSN_NB: string;
    PRNL_DL_NB: string;
    PRNL_DOB_DT: Date;
    ContractorVeteranEmployees: ContractorVeteranEmployees[];
    LegalIssueFlg: boolean;
    ContrLegalIssues: ContrLegalIssues;
}

export interface ContractorVeteranEmployees {
    HireDate: string;
    MilitaryAffiliation: string;
}

export interface ContractorSignatures {
    SignatureInitials: string;
    DateSigned: string;
}

export interface ContrLegalIssues {
    ContrLegalIssueID: string;
    LegalIssueTypeID: string;
    CreateDate: string;
    LegalIssueResolutionTypeID: string;
    LegalIssueResolutionDate: string;
    LegalIssueResolutionResource: string;
    LegalIssueComment: string;
    ContrLegalIssueDetails: ContrLegalIssueDetails[];
}

export interface ContrLegalIssueDetails {
    LI_DetailDate: string;
    LI_DetailTypeID: string;
    LI_DetailTypeTxt: string;
    LI_DetailTypeInt: string;
}

export class PersonnelData {
    Personnel: AddOwnerShip[];
}

export class AddFinancial {
    ROW_NO: string;
    FINST_YR_DT: string;
    FISCALYEARFLG: string;
    FISCALYEARSTART: string;
    FISCALYEAREND: string;
    FINST_TOT_REVN_AM: string;
    FINST_TOT_EXP_AM: string;
    FINST_NET_INCM_AM: string;
    FINST_CURR_AST_AM: string;
    FINST_CURR_LIAB_AM: string;
    FINST_LNG_TRM_DEBT_AM: string;
    FINST_TOT_EQTY_AM: string;
    CRPercent: number;
    DTEPercent: number;
}

export class LocationInformation {
    OtherNetworkOfficeQuestion: string;
    SatelliteLocationQuestion: string;
    ContractorLocationList: ContractorLocationList[];
}
export class ContractorLocationList {
    SerialNumber?: number;
    LocationNumber?: number;
    IsPhysicalAddressSame?: boolean;
    FacilityTypeORLocationName?: string;
    LocationStreetAddress?: string;
    City?: string;
    State?: string;
    PostalCode?: string;
    ContractorLocationTypeNumber?: number;
    ContractorFacilityTypeNumber?: number;
    SpaceHoldTypeNumber?: number;
    ContractorLocationSpaceUse?: number;
    OfficeOwnedIndicator?: number;
    SeparateOfficeFlag?: boolean;
    SpaceHoldTypeName?: string;
    SeparateEntranceFlag?: boolean;
    ContractorFacilityTypeName?: string;
    ContractorLocationTypeName?: string;
    OfficeOwnedIndicatorName?: string;
    StateName?: string;
    SatelliteLocationFlag?: boolean;
    OtherNetworkOfficeFlag?: boolean;

    isFacilityTypeORLocationName?: boolean;
    isLocationStreetAddress?: boolean;
    isCity?: boolean;
    isIsPhysicalAddressSame?: boolean;
    isStateName?: boolean;
    isPostalCode?: boolean;
    isContractorLocationTypeName?: boolean;
    isContractorFacilityTypeName?: boolean;
    isSpaceHoldTypeNumber?: boolean;
    isSpaceHoldTypeName?: boolean;
    isOfficeOwnedIndicatorName?: boolean;
    isContractorLocationSpaceUse?: boolean;
    isSeparateOfficeFlag?: boolean;
    isSeparateEntranceFlag?: boolean;
}

export interface LegalQuestionsPage {
    LegalIssueTypeID: number;
    LegalIssueTypeTitle: string;
    LegalIssueTypeDescription: string;
    CompanyExclFlg: boolean;
    ActiveFlg: boolean;
}
export class ContactDetails {
    company?: string;
    cName?: string;
    cPhone?: string;
    cFax: string;
    BillingCompanyName: string;
    BillingContactName: string;
    BillingPhone: string;
    BillingFax: string;
    BillingEmail: string;
    ContractorEmails: string;
    CrawfordContractorConnectionContactName: string;
    CrawfordContractorConnectionContactNumber: number;
    CrawfordContractorConnectionContactEmail: string;
    IsMailingAddressPhysicalAddressSame: boolean;
    IsBillingAddressPhysicalAddressSame: boolean;
    ContactNumbers: ContactNumbers[];
    Address: [Address, Address, Address];
}
export class ContactNumbers {
    ContactNumberType: string;
    ContactNumber: number;
}
export class Address {
    AddressType: string;
    StreetAddress: string;
    StreetAddress2: string;
    City: string;
    State: string;
    PostalCode: string;
    IsMailingAddressPhysicalAddressSame: boolean;
    IsBillingAddressPhysicalAddressSame: boolean;
}

export interface Addresses {
    Address: Array<Address>;
    IsMailingAddressPhysicalAddressSame?: boolean;
    IsBillingAddressPhysicalAddressSame?: boolean;
}

export class ModalInformation {
    isCompany: boolean;
    companyName: string;
    ownerPrincipleName: string;
}

export class ContactInfoObj {
    ContactDetails: ContactDetailObj;
}

export class ContactDetailObj {
    BillingCompanyName: string;
    BillingContactName: string;
    BillingPhone: string;
    BillingFax: string;
    BillingEmail: string;
    ContractorEmails: [];
    CrawfordContractorConnectionContactName: string;
    CrawfordContractorConnectionContactNumber: string;
    CrawfordContractorConnectionContactEmail: string;
    CrawfordContractorConnectionTrainingContact: string;
    IsMailingAddressPhysicalAddressSame: boolean;
    IsBillingAddressPhysicalAddressSame: boolean;
    ContactNumbers: [];
    Address: ContactDetailsAddress[];
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
}

export class ContactDetailsAddress {
    AddressType: string;
    StreetAddress: string;
    StreetAddress2: string;
    City: string;
    State: string;
    PostalCode: string;
}
export interface EmailThankYouPage {
    AppType: string;
    Contr_ID: number;
    ContractorName: string;
    EmailType: string;
    ResourceID: number;
    ContractorType: string;
}
export interface addEmployeeForm {
    CONTR_ID: number;
    PRNL_ID: number;
    ContrEmployeeTypeID: number;
    VeteranEmployeeMilitaryAffiliation: string;
    EmployeeNumber: number;
    EmployeeName: string;
    Email: string;
    PhoneNumber: string;
    HireDate: Date;
    VeteranFlag: boolean;
}
export interface ClientInfo {
    PRISMClientID: number;
    PRISMClientName: string;
}

export interface ProgramType {
    ProgramTypeID: number;
    ProgramTypeName: string;
    ProgramTypeAbbre: string;
}

export interface TradeType {
    tradeListID: number;
    tradeName: string;
    tradeAbbre: string;
}

export interface DivisionType {
    DivisionID: number;
    PrismClientId: number;
    DivisionName: string;
}
export interface CoverageProfileData {
    ContractorCoverageID: number;
    CoverageProfileName: string;
    ClientID: number;
    DivisionID: number;
    SingleTradeID: number;
    ProgramTypeID: number;
    PRISMClientID: number;
    tradeListID: null;
}

export interface AddEmployeeData {
    CONTR_ID: number;
    PRNL_ID: number;
    ContrEmployeeTypeID: number;
    EmployeeTypeNumber: string;
    MilitaryAffiliation: string;
    VeteranMilitaryAffiliationData: VeteranEmployeeData[];
    EmployeeNumber: number;
    Name: string;
    Email: string;
    Phone: string;
    HireDate: Date;
    VeteranFlg: boolean;
    EmployeeRole: string;
    EmployeeTypeCode: string;
    VeteranEmployeeHireDate?: string | null;
}

export interface VeteranEmployeeData {
    AddedDate?: Date | null;
    AddedResourceID?: number | null;
    ContractorVeteranEmployeeNumber?: string | null;
    EmployeeHireDate?: Date | null;
    MilitaryAffiliationName?: string | null;
    MilitaryAffiliationNumber?: number;
    OwnershipNumber?: number | null;
    RemovedDate?: Date | null;
    RemovedResourceID?: number | null;
}
