export interface InsuranceList {
    Contr_ID: number;
    CoverageAmount: number;
    CreatedDate: string;
    CreatedResourceID: number;
    CredentialingItem: string;
    CredentialingTrackingNumber: number;
    Due: number;
    ExpirationDate: Date | string;
    ExpirationDateNew?: Date;
    GroupName: string;
    GroupNumber: number;
    InsuranceCarrier: string;
    isInsuranceCarrier?: boolean;
    MetricTypeName: string;
    MetricTypeNumber: number
    UpdatedDate: string;
    UpdatedResourceID: number
    isCoverageAmount: boolean
}

export interface ApprovalApiJson {
    CoverageAmount?: number
    CreatedDate: string;
    CreatedResourceID: number
    CredentialingTrackingNumber: number
    GroupName: string;
    GroupNumber: number;
    InsuranceCarrier?: string;
    MetricTypeName: string;
    MetricTypeNumber: number;
    UpdatedDate: string;
    UpdatedResourceID: number;
}

export interface CertificateList {
    Contr_ID: number;
    CreatedDate: Date | null;
    CreatedResourceID: number | null;
    CredentialingFirm: string | null;
    CredentialingItem: string | null;
    CredentialingReceivedDate: Date;
    CredentialingTrackingNumber: number;
    Due: number | null;
    ExpirationDate: Date | string | null;
    GroupName: string;
    GroupNumber: number;
    MetricTypeName: string;
    MetricTypeNumber: number;
    UpdatedDate: Date | null;
    UpdatedResourceID: number | null;
}

export interface TechnicalData {
    Contr_ID: number
    CreatedDate: Date | null
    CreatedResourceID: number | null
    CredentialingDate: Date | null
    CredentialingItem: string | null
    CredentialingTrackingNumber: number
    Due: number | null
    ExpirationDate: string | Date | null
    GroupName: string
    GroupNumber: number
    MetricTypeName: string
    MetricTypeNumber: number
    UpdatedDate: Date | null
    UpdatedResourceID: number | null
}

export interface Vendors {
    VendorName: string,
    VendorID: number | string;
}
export interface AdditionalData {
    Contr_ID: number
    CreatedDate: Date | null
    CreatedResourceID: number | null
    CredentialingDate: Date | null
    CredentialingItem: string | number | null
    CredentialingTrackingNumber: number
    Due: string | null
    ExpirationDate: string | Date | null
    GroupName: string
    GroupNumber: number
    MetricTypeName: string
    MetricTypeNumber: number
    ReportNumber: string | null
    UpdatedDate: Date | null
    UpdatedResourceID: number | null
    VendorID: number | string | null
    VendorName: string | null
    CredentialingFirm: string | null
}

export interface EmployeeTrainee {
    id: number;
    employee: number;
    title: string;
    dateCompleted: string | Date;
    deletedFlag?: boolean;
    disabled?: boolean;
}

export interface EmployeeList {
    ContractorEmail: string;
    ContractorEmployeeName: string;
    PersonalId: number;
    Title: string;
}

export interface Attendees {
    CompleteDate: string | Date
    ContractorEmail: string | null
    ContractorEmployeeName: string
    CreatedDate: string | Date
    CreatedResourceID: number
    CredentialingTrackingNumber: number
    ExpirationDate: string | Date | null
    PersonalId: number
    Title: string
    UpdatedDate: Date | string
    UpdatedResourceID: number
}

export interface Training {
    Contr_ID: number
    CreatedDate: Date | null
    CreatedResourceID: number | null
    CredentialingDate: Date | null
    CredentialingItem: string | number | null
    CredentialingTrackingNumber: number
    Due: number | null
    ExpirationDate: string | null | Date
    GroupName: string
    GroupNumber: number
    MetricTypeName: string
    MetricTypeNumber: number
    UpdatedDate: Date | null
    UpdatedResourceID: number | null
}

export interface CredentialTabNames {
    CredentialingMetricGroupID: number;
    CredentialingMetricGroupTitle: string;
}

export interface CredentialingGridData {
    AdditionalInformation: AdditionalData[];
    CertificateInformation: CertificateList[];
    InsuranceInformation: InsuranceList[];
    LicenseInformation: LicensesList[];
    TechnicalInformation: TechnicalData[];
    TrainingInformation: Training[];
}

export interface LicensesList {
    ContrLicenseExpirationDateNumber: string;
    Contr_ID: number;
    CreatedDate: Date | string | null;
    CreatedResourceID: number;
    CredentialingItem: null | string;
    CredentialingTrackingNumber: number;
    Due: number;
    ExpirationDate: Date | string | null;
    GroupName: string;
    GroupNumber: number;
    LicenseNumber: string;
    LicenseTypeName: string;
    LicenseTypeNumber: number;
    MetricTypeName: null | string;
    MetricTypeNumber: number;
    State: string;
    UpdatedDate: Date | string | null;
    UpdatedResourceID: number;
    isLicenseNumber?: boolean;
    IsRowDisable?: boolean;
}
export interface LicensesListOptional {
    ContrLicenseExpirationDateNumber?: string;
    Contr_ID?: number;
    CreatedDate?: Date | string | null;
    CreatedResourceID?: number;
    CredentialingItem?: null | string;
    CredentialingTrackingNumber?: number;
    Due?: number;
    ExpirationDate?: Date | string | null;
    GroupName?: string;
    GroupNumber?: number;
    LicenseNumber?: string;
    isLicenseNumber?: boolean;
    LicenseTypeName?: string;
    LicenseTypeNumber?: number;
    MetricTypeName?: null | string;
    MetricTypeNumber?: number;
    State?: string;
    UpdatedDate?: Date | string | null;
    UpdatedResourceID?: number;
    IsRowDisable?: boolean;
}

export interface LicenseJSONData {
    ContrLicenseExpirationDateNumber: number;
    GroupNumber: number;
    GroupName: string;
    State: string;
    LicenseTypeNumber?: number;
    LicenseTypeName: string;
    LicenseNumber: string;
    CreatedDate: string | Date | null;
    CreatedResourceID: number;
    UpdatedDate: Date | string | null;
    UpdatedResourceID: number;
}
