export interface State {
    ID: number;
    Name: string;
    Abbreviation: string;
    pendingApproval?: boolean;
    checked?: boolean;
    disable?: boolean;
}

export interface County {
    ID: number;
    Name: string;
    StateProvinceID: number;
    StateAbbreviation: string;
    CountryID: number;
    pendingApproval?: boolean;
    checked?: boolean;
    disable?: boolean;
}

export interface PostalCode {
    PostalId: string;
    PostalCodeId: string;
    CountyRegionID: number;
    CountyRegionName: string;
    StateProvinceID: number;
    StateAbbreviation: string;
    excluded?: string;
    pendingApproval?: boolean;
    IsChecked: boolean;
    disable?: boolean;
    ContractorPostalCodeCoveredCount: number;
    ContractorPostalCodeNotCoveredCount: number;
    TotalPostalCodesCount: number;
}

export interface CoverageProfile {
    ContractorCoverageTypeID: number;
    ContractorCoverageTypeTitle: string;
    ContractorCoverageTypeTitleTranslated: string;
    disable?: boolean;
    isDeleted?: boolean;
}

// API Data Models
export interface CoverageException {
    CoverageExceptionNumber?: number | null;
    CoverageProfileNumber?: number | null;
    PostalNumber?: string;
    IsIncludedFlag?: boolean;
}

export interface ProfileCoverageObject {
    CoverageProfileTypeNumber?: number;
    CoverageProfileTypeName?: string;
    CoverageProfileNumber?: number;
    CountyRegionNumber?: number;
    CountyName?: string;
    StateProvinceID?: number;
    StateProvinceAbbreviationName?: string;
    StateProvinceName?: string;
    CountryNumber?: number;
    ContractorCoverageException?: CoverageException[];
    ContractorCoverageIncludedException?: CoverageException[];
    isAllPostalCodeChecked?: boolean;
    IsRemovedFlag?: boolean;
    IsStateRemovedFlag?: boolean;
    IsCountyCreatedObj?: boolean;
    CountyIds?: string;
    StateIds?: string;
    IsRowDisable?: boolean;
    IsProfileRemovedFlag?: boolean;
}

export interface SaveCoverageProfileData {
    CoverageProfileInformation: ProfileCoverageObject[];
    ResourceId: number;
    CCopsId: number;
    LastPageVisited: string;
}

export interface CoverageProfilePage {
    States?: State[];
    Counties?: County[];
    PostalCodes?: PostalCode[];
    CoverageProfiles?: CoverageProfile[];
    SelectedProfile?: CoverageProfile;
    DB_JSON?: ProfileCoverageObject[];
    Contractor_JSON?: ProfileCoverageObject[];
    loadingState?: boolean;
    buttons?: any;
    pageAccess?: boolean;
}

export interface CopyCoverageData {
    CONTR_ID: number;
    SourceCoverageProfileTypeID: number;
    DestinationCoverageProfileTypeID: any;
}

export interface GetStateProfile {
    CoverageProfileTypeName: CoverageProfile[];
    State: State[];
}

export interface DataToSend {
    CoverageProfileInformation: ProfileCoverageObject[];
}

export interface CounterVisualCue {
    state: boolean;
    county: boolean;
    postalCode: boolean;
}

export interface ProfileDataStatus {
    CoverageProfileTypeNumber: number;
    IsPendingData: boolean;
    IsProfileRemoved: boolean;
    IsCopiedProfile: boolean;
}
