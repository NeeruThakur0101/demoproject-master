import { SessionUser } from 'src/app/core/services/authentication.service';

export interface Option {
    text: string;
    value: any;
}

export interface Control {
    type?: string;
    label?: string;
    name?: string;
    value?: any;
    required?: boolean;
    options?: Option[];
    placeholder?: string;
    error?: string;
    controls?: Control[];
    fieldTypeID?: number;
    handler?: any;
    readonly?: boolean;
    pendingApproval?: boolean;
    disable?: boolean;
    labelForCondition?: string;
    contrExclFlg?: boolean;
}

export interface DropDownOption {
    ID: number;
    Name: string;
    Description: string;
}

export interface ControlConfig {
    LegalIssueFieldTypeID: number;
    LegalIssueTypeID: number;
    LegalIssueFieldTypeTitle: string;
    LegalIssueFieldTypeDescription: string;
    LegalIssueFieldTypeTitleTranslated: string;
    ContrExclFlg: boolean;
    LegalIssueLabelFlag: boolean;
    MandatoryFlag: boolean;
    Option: DropDownOption[];
}

export interface LegalIssueDetailItem {
    FieldDetailText: string; // type => Text | Textarea
    FieldDetailInt: number; // type => Dropdown
    FieldDetailDate: string; // type => Datepicker
    FieldDetailBoolean: boolean; // type => Switch

    LegalIssueDetailID: number;
    LegalIssueTypeID: number;
    LegalIssueFieldTypeID: number;
    LegalIssueDetailDate: string;
    LegalIssueDetailResourceID: number;
    pendingApproval?: boolean;
    disable?: boolean;
}

export interface LegalIssueEntryItem {
    ID: number | string;
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
    selectedDate: string;
    LegalIssueDetail: LegalIssueDetailItem[];
    pendingApproval?: boolean;
    IsLegalIssueDetailDisable?: boolean;
}

export interface ContractorLegalIssueItem {
    OwnershipNumber: number;
    OwnershipName: string;
    LegalIssueTypeName: string;
    LegalIssueTypeID: number;
    ContractorLegalIssueID: number;
    LegalIssueEntry: LegalIssueEntryItem[];
    CreatedResourceID: number;
    CreatedDate: string;
    RemoveResourceID: number;
    RemoveDate: string;
    ActiveFlag: boolean;
    pendingApproval?: boolean;
    IsContractorLegalIssueDisable?: boolean;
}

export interface OwnershipInformation {
    ID: number;
    OwnershipName: string;
    OwnershipNumber: number;
    ContrEmployeeTypeId: number;
    LegalIssueFlag: string;
    ActiveFlag: boolean;

    ContractorLegalIssue: ContractorLegalIssueItem[];
    ContactEmail: string;
    ContactPhone: string;
    SocialSecurityNumber: string;
    DrivingLicense: string;
    DateOfBirth: string;
    OwnershipPercentage: number;
    IsContractorActive: string;
    VeteranFlag: string;
    VeteranEmployeeHireDate: string;
    VeteranEmployeeMilitaryAffiliation: string;
    TimeStamp: string;
    pendingApproval?: boolean;
}
export interface OwnershipList {
    OwnershipInformationList: OwnershipInformation[];
    ResourceId: number;
    CCopsId: number;
    LastPageVisited: string;
}
export interface LegalIssueType {
    LegalIssueTypeID: number;
    LegalIssueTypeTitle: string;
    LegalIssueTypeDescription: string;
    CompanyExclFlg: boolean;
    ActiveFlg: boolean;
}

export interface LegalPage {
    loadingState: boolean;
    Tabs?: LegalIssueType[];
    TabsToRender?: LegalIssueType[]; // Added for bugs 2104
    PageObj?: OwnershipInformation[];
    DB_JSON?: OwnershipInformation[];
    Contractor_JSON?: ContractorLegalIssueItem[];
}

export interface FormDialogConfig {
    owner: OwnershipInformation;
    tab: LegalIssueType;
    IssueItem: ContractorLegalIssueItem;
    formControlConfig: ControlConfig[];
    updateBackgroundData: any;
}

export interface County {
    ID: number;
    Name: string;
    StateProvinceID: number;
    CountryID: number;
    StateAbbreviation: string;
}
