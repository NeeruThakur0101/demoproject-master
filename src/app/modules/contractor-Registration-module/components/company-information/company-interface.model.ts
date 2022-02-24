export interface CompanyDetails {
    CompanyDetails : CompanyData
    LastPageVisited? :string;
    ContractorResourceNumber? : number
}
export interface CompanyData {
    CompanyName: string,
    CompanyLegalName: string,
    WebSite: string,
    ContractorFederalTaxNumber: string,
    ContractorFranchiseSelectedNumber: string,
    ContractorCountryCode: string,
    ContractorXactNetAddress: string,
    ContractorSymbilityAddress: string,
    ContractorOpeningDate: string,
    ContractorPercentOfOverallBusinessSubContracted: number,
    ContractorCentralHeardMethod: string,
    CountOfEmployeesInContractorCompany: number,
    ContractorEmployeeUniformFlag: boolean,
    ContractorEmployeeIdentificationFlag: boolean,
    WorkersCompanyMinimumRequirementFlag: boolean,
    IsWorkersCompanyMinimumRequirementFlagDisable?: boolean,
    ContractorMoistureData?: ContractorMoistureData[],
    ResourceId?: number,
    CCopsId?: number,
    LastPageVisited?: string
}

export interface ContractorMoistureData {
    SupportedFlag?: boolean,
    IsSupportedFlag?: boolean,
    VendorNumber?: number,
    PreferredFlag?: boolean,
    IsPreferredFlag?: boolean
}
export interface CompanyType {
    frenchise: Frenchise[],
    abbreviationlist: Abbriviation[],
    vendors: Vendor[]
}
export interface Vendor {
    VendorID: number,
    VendorName: string,
    VendorTypeID: number
}
export interface Frenchise {
    FranchiseID: number,
    FranchiseName: string
}

export interface Abbriviation {
    ID: number,
    Name: string,
    Abbreviation: string
}

export interface ApprovalJson {
    CompanyName?: string,
    CompanyLegalName?: string,
    WebSite?: string,
    ContractorFederalTaxNumber?: string,
    ContractorFranchiseSelectedNumber?: string,
    ContractorCountryCode?: string,
    ContractorXactNetAddress?: string,
    ContractorSymbilityAddress?: string,
    ContractorOpeningDate?: string,
    ContractorPercentOfOverallBusinessSubContracted?: number,
    ContractorCentralHeardMethod?: string,
    CountOfEmployeesInContractorCompany?: number,
    ContractorEmployeeUniformFlag?: boolean,
    ContractorEmployeeIdentificationFlag?: boolean,
    WorkersCompanyMinimumRequirementFlag?: boolean,
    IsWorkersCompanyMinimumRequirementFlagDisable?: boolean,
    ContractorMoistureData?: ContractorMoistureDataApproval[],
    ResourceId?: number,
    CCopsId?: number,
    LastPageVisited?: string
}

export interface ContractorMoistureDataApproval {
    SupportedFlag?: boolean,
    IsSupportedFlag?: boolean,
    VendorNumber?: number,
    PreferredFlag?: boolean,
    IsPreferredFlag?: boolean,
    pendingFlag?:boolean,
    visualPrefCue? : boolean,
    visualSupCue? : boolean
}