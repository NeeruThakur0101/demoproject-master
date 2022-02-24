export interface ManageSurgeProfile {
    manageProfile?: ManageSurgeData[]
}

export interface ManageSurgeData {
    SurgeLicenses: ManageSurge[];
    SurgeDetails: SurgeDetails[];
    // counties?: County[];
    // profiles?: ProfileData[];
    // DB_JSON?: CoverageProfilePageObject[];
    // Contractor_JSON?: CoverageProfilePageObject[];
}

export interface SurgeDetails {
    Contr_ID: number
    GroupID: number
    GroupName: string
    SurgeResponseDetailID: number
    SurgeResponseID: number
    TypeTitleID: number | string | null;
    TypeTitleName: string
}

export interface ManageSurge {
    ContractorLicenseExpirationDateNumber: number;
    ContrLicenseName: string;
    ContrLicenseDesc: string;
    ContractorLicenseNumber: number;
    USStateAbbreviation: string;
    LicenseCompanyName: string | null;
    LicenseNumber: number | null;
    LicenseRequiredTypeNumber: string | number | null;
    checked?: boolean;
    disable?: boolean;
    pendingApproval?: boolean;
    id?: number;
    noCue?: boolean
    partnerCue?: boolean
    yesCue?: boolean
    LicenseCompanyNameCue?: boolean;
    LicenseNumberCue?: boolean;
}

export interface VisualCueMangeSurge {
    ContrLicenseDesc: string;
    ContrLicenseName: string;
    ContractorLicenseExpirationDateNumber: number;
    ContractorLicenseNumber: number;
    LicenseCompanyName: string | number;
    LicenseCompanyNameCue: boolean;
    LicenseNumber: string | number;
    LicenseNumberCue: boolean;
    LicenseRequiredTypeNumber: string;
    PartnerFlag: number;
    USStateAbbreviation: string
    id: number;
    noCue: boolean
    partnerCue: boolean
    yesCue: boolean
}

export interface VisualCueRadioButton {
    yesCue?: boolean;
    noCue?: boolean;
    partnerCue?: boolean;
    ContrLicenseName?: string;
    USStateAbbreviation?: string;
}