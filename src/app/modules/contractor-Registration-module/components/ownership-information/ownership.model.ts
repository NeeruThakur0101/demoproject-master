export interface LastPageVisited {
    ResourceId: number;
    CCopsId: number;
    LastPageVisited: string;
}
export interface VisualCuesModel {
    IsContractorActive: string;
    ContactEmailCue: boolean;
    ContactPhoneCue: boolean;
    VeteranEmployeeMilitaryAffiliationCue: boolean;
    SocialSecurityNumberCue: boolean;
    DrivingLicenseCue: boolean;
    DateOfBirthCue: boolean;
    OwnershipPercentageCue: boolean;
    ActiveFlagCue: boolean; // to be change with Active
    VeteranFlagCue: boolean;
    VeteranEmployeeHireDateCue: boolean;
    LegalIssueFlagCue: boolean;
    IsContractorActiveCue: boolean;
    OwnershipNameCue: boolean;
    ContrEmployeeTypeIdCue: boolean;
}

export interface pageObjModel {
    buttonCount: number;
    info: boolean;
    type: string;
    pageSizes: boolean;
    previousNext: boolean;
}
export interface OwnerStruct {
    OwnerStructureID: number;
    OwnerStructureDesc: string;
    OwnerStructureDescTranslated: string;
}
export interface OwnerRoleStruct {
    ContrEmployeeTypeID: number;
    ContractorEmployeeType: string;
    ContractorEmployeeTypeTranslated: string;
}
export interface MilitaryAffiliationsStruct {
    MilitaryAffiliationID: number;
    MilitaryAffiliationBranch: string;
}
export interface OwnDataModel {
    OwnerStructure: OwnerStruct[];
    OwnerRole: OwnerRoleStruct[];
    MilitaryAffiliations: MilitaryAffiliationsStruct[];
}
export interface LegalIssueDetailObject {
    ID: number;
    PRNL_ID: number;
    LegalIssueEntryID: number;
    value: {};
    type: string;
    LegalIssueDetailID: number;
    LegalIssueTypeID: number;
    LegalIssueFieldTypeID: number;
    FieldDetailDate: string;
    FieldDetailInt: number;
    FieldDetailIntText: string;
    FieldDetailText: string;
    FieldDetailBoolean: boolean;
    LegalIssueDetailDate: string;
    LegalIssueDetailResourceID: number;
    pendingApproval: boolean;
    disable: boolean;
    FieldName: string;
}
export interface LegalIssueEntryObject {
    ID: string;
    PRNL_ID: number;
    ContractorLegalIssueID: number;
    LegalIssueEntryID: number;
    LegalIssueTypeID: number;
    CreateDate: string;
    CreatedResourceID: number;
    ModifyDate: string;
    ModifyResourceID: number;
    ActiveFlag: boolean;
    DeletedFlag: boolean;
    ResolvedFlag: boolean;
    LegalIssueDetail: LegalIssueDetailObject[];
    selectedDate: string;
    pendingApproval: boolean;
}
export interface ContractorLegalIssueObject {
    ContractorLegalIssueID: number;
    LegalIssueTypeID: number;
    LegalIssueEntry: LegalIssueEntryObject[];
    ActiveFlag: boolean;
    pendingApproval: boolean;
    RemoveDate: string;
    RemoveResourceID: number;
    CreatedDate: string;
    CreatedResourceID: number;
    LegalIssueType: string;
    OwnershipNumber: number;
    Name: string;
    LegalIssueFlg: string;
    OwnershipName: string;
    LegalIssueTypeName: string;
}
export interface VeteranMilitaryAffiliationObject {
    ContractorVeteranEmployeeNumber: number;
    MilitaryAffiliationNumber: number;
    AddedDate: Date;
    AddedResourceID: number;
    RemovedDate: Date;
    RemovedResourceID: number;
    MilitaryAffiliationName: string;
}
export interface OwnwershipInformationObject {
    PRNL_ID: number | null;
    OwnershipNumber: number;
    ID: number;
    OwnershipName: string;
    ContrEmployeeTypeId: number | string;
    ContactEmail: string;
    ContactPhone: string;
    VeteranEmployeeMilitaryAffiliation: string;
    SocialSecurityNumber: string;
    DrivingLicense: string;
    DateOfBirth: Date;
    OwnershipPercentage: number;
    ActiveFlag: boolean | string | 'true' | 'false'; // to be change with Active
    VeteranFlag: string | boolean | 'true' | 'false';
    VeteranEmployeeHireDate: Date;
    LegalIssueFlag: boolean | string | 'true' | 'false';
    IsContractorActive: string;
    VeteranMilitaryAffiliationDataCue?: boolean;
    ContractorLegalIssue: ContractorLegalIssueObject[];
    VeteranMilitaryAffiliationData: VeteranMilitaryAffiliationObject[];
    TimeStamp: null;
    IsDeletedFlag?: boolean;
    DeletedDateTime?: Date | null | string;
    DeletedByResourceID?: number;
    IsRowDisable?: boolean;
}
export interface OwnershipDetailsObject {
    OwnershipInformationList: OwnwershipInformationObject[];
    OwnershipStructure: any;
    ExchangeListing: string;
    StockSymbol: string;
    YearsInCurrentOwnership: number;
    MonthsInCurrentOwnership: number;
    IsOwnershipStructureDisable?: boolean;
    IsYearsInCurrentOwnershipDisable?: boolean;
    IsExchangeListingDisable?: boolean;
    IsStockSymbolDisable?: boolean;
    IsMonthsInCurrentOwnershipDisable?: boolean;
}
export interface OwnershipObject {
    OwnershipNumber?: number;
    ID?: number;
    OwnershipName?: string;
    ContrEmployeeTypeId?: number;
    ContactEmail?: string;
    ContactPhone?: string;
    VeteranEmployeeMilitaryAffiliation?: string;
    SocialSecurityNumber?: string;
    DrivingLicense?: string;
    DateOfBirth?: Date;
    OwnershipPercentage?: number;
    ActiveFlag?: string | boolean | 'true' | 'false'; // to be change with Active
    VeteranFlag?: string | boolean | 'true' | 'false';
    VeteranEmployeeHireDate?: Date;
    LegalIssueFlag?: boolean | string | 'Y' | 'N';
    IsContractorActive?: string;
    VeteranMilitaryAffiliationDataCue?: boolean;
    ContractorLegalIssue?: ContractorLegalIssueObject[];
    VeteranMilitaryAffiliationData?: VeteranMilitaryAffiliationObject[];
    MilitaryAffilationNumber?: number;
    TimeStamp?: null;
    OwnershipDetails?: OwnershipDetailsObject;
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
}
export interface LegalIssueDetailModel {
    ID: number;
    PRNL_ID: number;
    LegalIssueEntryID: number;
    value: {};
    type: string;
    LegalIssueDetailID: number;
    LegalIssueTypeID: number;
    LegalIssueFieldTypeID: number;
    FieldDetailDate: string;
    FieldDetailInt: number;
    FieldDetailIntText: string;
    FieldDetailText: string;
    FieldDetailBoolean: boolean;
    LegalIssueDetailDate: string;
    LegalIssueDetailResourceID: number;
    pendingApproval: boolean;
    disable: boolean;
    FieldName: string;
}
export interface LegalIssueEntryModel {
    ID: string;
    PRNL_ID: number;
    ContractorLegalIssueID: number;
    LegalIssueEntryID: number;
    LegalIssueTypeID: number;
    CreateDate: string;
    CreatedResourceID: number;
    ModifyDate: string;
    ModifyResourceID: number;
    ActiveFlag: boolean;
    DeletedFlag: boolean;
    ResolvedFlag: boolean;
    LegalIssueDetail: LegalIssueDetailModel[];
    selectedDate: string;
    pendingApproval: boolean;
}
export interface ContractorLegalIssueModel {
    ContractorLegalIssueID: number;
    LegalIssueTypeID: number;
    LegalIssueEntry: LegalIssueEntryModel[];
    ActiveFlag: boolean;
    pendingApproval: boolean;
    RemoveDate: string;
    RemoveResourceID: number;
    CreatedDate: string;
    CreatedResourceID: number;
    LegalIssueType: string;
    OwnershipNumber: number;
    Name: string;
    LegalIssueFlg: string;
    OwnershipName: string;
    LegalIssueTypeName: string;
}
export interface VeteranMilitaryAffiliationModel {
    ContractorVeteranEmployeeNumber: number;
    MilitaryAffiliationNumber: number;
    AddedDate: Date;
    AddedResourceID: number;
    RemovedDate: Date;
    RemovedResourceID: number;
    MilitaryAffiliationName: string;
}
export interface OwnwershipInformationModel {
    PRNL_ID: number | null;
    OwnershipNumber: number;
    ID: number;
    OwnershipName: string;
    ContrEmployeeTypeId: number | string;
    ContactEmail: string;
    ContactPhone: string;
    VeteranEmployeeMilitaryAffiliation: string;
    SocialSecurityNumber: string;
    DrivingLicense: string;
    DateOfBirth: Date;
    OwnershipPercentage: number;
    ActiveFlag: string | boolean; // to be change with Active
    VeteranFlag: string | boolean;
    VeteranEmployeeHireDate: Date;
    LegalIssueFlag: string | boolean;
    IsContractorActive: string;
    VeteranMilitaryAffiliationDataCue?: boolean;
    ContractorLegalIssue: ContractorLegalIssueModel[];
    VeteranMilitaryAffiliationData: VeteranMilitaryAffiliationModel[];
    TimeStamp: null;
    IsDeletedFlag?: boolean;
    DeletedDateTime?: Date | null | string;
    DeletedByResourceID?: number;
}

export interface OwnershipDetailsModel {
    OwnershipNumber?: number;
    OwnershipInformationList: OwnwershipInformationModel[];
    OwnershipStructure: number;
    ExchangeListing: string;
    StockSymbol: string;
    YearsInCurrentOwnership: number;
    MonthsInCurrentOwnership: number;
}
export interface SaveOwnershipModel {
    OwnershipDetails?: OwnershipDetailsModel;
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
}

export interface LayoutModel {
    pageSize: number;
    pageObj: {
        buttonCount: number;
        info: boolean;
        type: string;
        pageSizes: boolean;
        previousNext: boolean;
    };
}

export interface deviceResModel {
    pageSize: number;
    pageObj: {
        buttonCount: number;
        info: boolean;
        type: string;
        pageSizes: boolean;
        previousNext: boolean;
    };
    screen: string;
}
export interface CompanyDataObjModel {
    OwnershipNumber: number;
    ID: number;
    OwnershipName: string;
    ContrEmployeeTypeId: number;
    ContactEmail: string;
    ContactPhone: number | string;
    VeteranEmployeeMilitaryAffiliation: string;
    VeteranMilitaryAffiliationData: [];
    SocialSecurityNumber: string;
    DrivingLicense: string;
    DateOfBirth: Date;
    OwnershipPercentage: number;
    ActiveFlag: boolean; // to be change with Active
    VeteranFlag: boolean;
    VeteranEmployeeHireDate: Date;
    MilitaryAffilationNumber: number;
    LegalIssueFlag: boolean;
    IsContractorActive: string;
    ContactEmailCue?: boolean;
    ContactPhoneCue?: boolean;
    VeteranEmployeeMilitaryAffiliationCue?: boolean;
    SocialSecurityNumberCue?: boolean;
    DrivingLicenseCue?: boolean;
    DateOfBirthCue?: boolean;
    OwnershipPercentageCue?: boolean;
    ActiveFlagCue?: boolean; // to be change with Active
    VeteranFlagCue?: boolean;
    VeteranEmployeeHireDateCue?: boolean;
    LegalIssueFlagCue?: boolean;
    IsContractorActiveCue?: boolean;
}

export interface VisualCueOwnershipListModel {
    PRNL_ID?: boolean;
    OwnershipNumber: boolean;
    ID: boolean;
    OwnershipName: string;
    ContrEmployeeTypeId: boolean;
    ContactEmail: boolean;
    ContactPhone: boolean;
    VeteranEmployeeMilitaryAffiliation: boolean;
    SocialSecurityNumber: boolean;
    DrivingLicense: boolean;
    DateOfBirth: boolean;
    OwnershipPercentage: boolean;
    ActiveFlag: boolean; // to be change with Active
    VeteranFlag: boolean;
    VeteranEmployeeHireDate: boolean;
    LegalIssueFlag: boolean;
    IsContractorActive: string;
    VeteranMilitaryAffiliationDataCue?: boolean;
    ContractorLegalIssue: ContractorLegalIssueObject[];
    VeteranMilitaryAffiliationData: VeteranMilitaryAffiliationObject[];
    TimeStamp: null;
}

export interface VisualCueOwnershipModel {
    YearsInCurrentOwnershipCue: boolean;
    MonthsInCurrentOwnership: boolean;
    OwnershipStructure: boolean;
    ExchangeListing: boolean;
    StockSymbol: boolean;
    ActiveFlag: boolean;
    ContactEmailCue: boolean;
    ContactPhoneCue: boolean;
    VeteranEmployeeMilitaryAffiliationCue: boolean;
    SocialSecurityNumberCue: boolean;
    DrivingLicenseCue: boolean;
    DateOfBirthCue: boolean;
    OwnershipPercentageCue: boolean;
    ActiveFlagCue: boolean; // to be change with Active
    VeteranFlagCue: boolean;
    VeteranEmployeeHireDateCue: boolean;
    LegalIssueFlagCue: boolean;
    IsContractorActiveCue: boolean;
    OwnershipNameCue: boolean;
    ContrEmployeeTypeIdCue: boolean;
}
export const OwnershipMockData: SaveOwnershipModel = {
    OwnershipDetails: {
        OwnershipStructure: null,
        ExchangeListing: '',
        StockSymbol: '',
        YearsInCurrentOwnership: null,
        MonthsInCurrentOwnership: null,
        OwnershipInformationList: [],
    },
    LastPageVisited: '',
    ResourceId: null,
    CCopsId: null,
};

export interface GridDataModel {
    PRNL_ID?: number;
    OwnershipNumber?: number;
    ID?: number;
    OwnershipName?: string;
    ContrEmployeeTypeId?: number | string;
    ContactEmail?: string;
    ContactPhone?: any;
    VeteranEmployeeMilitaryAffiliation?: string;
    SocialSecurityNumber?: string;
    DrivingLicense?: string;
    DateOfBirth?: any;
    OwnershipPercentage?: any;
    ActiveFlag?: boolean | string; // to be change with Active
    VeteranFlag?: boolean | string;
    VeteranEmployeeHireDate?: Date;
    LegalIssueFlag?: boolean | string;
    IsDeletedFlagIsContractorActive?: string;
    ContractorLegalIssue?: [] | ContractorLegalIssueObject[];
    VeteranMilitaryAffiliationData?: [] | VeteranMilitaryAffiliationObject[];
    TimeStamp?: string;
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
    IsDeletedFlag?: boolean;
    DeletedDateTime?: Date | null | string;
    DeletedByResourceID?: number;
    IsContractorActive?: string;
}
export interface PersonnelDataModel {
    PRNL_ID?: number;
    OwnershipNumber?: number;
    ID?: number;
    OwnershipName?: string;
    ContrEmployeeTypeId?: number | string;
    ContactEmail?: string;
    ContactPhone?: any;
    VeteranEmployeeMilitaryAffiliation?: string;
    SocialSecurityNumber?: string;
    DrivingLicense?: string;
    DateOfBirth?: any;
    OwnershipPercentage?: any;
    ActiveFlag?: boolean | string; // to be change with Active
    VeteranFlag?: boolean | string;
    VeteranEmployeeHireDate?: Date;
    LegalIssueFlag?: boolean | string;
    IsContractorActive?: string;
    ContractorLegalIssue?: [] | ContractorLegalIssueObject[];
    VeteranMilitaryAffiliationData?: [] | VeteranMilitaryAffiliationObject[];
    TimeStamp?: string;
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
    IsDeletedFlag?: boolean;
}
export interface editObjModel {
    Contr_ID?: number;
    ResourceId?: number;
    CCOpsID?: number;
    ContractorResourceID?: number;
    CCOpsData?: string;
    PageName?: string;
}
