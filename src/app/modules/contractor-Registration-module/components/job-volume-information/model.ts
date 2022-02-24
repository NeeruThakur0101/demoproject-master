import { IsNotNullFilterOperatorComponent } from "@progress/kendo-angular-grid";

export interface JobVolumeInfo {
    JobVolumeInformation: JobVolumeInformation[] | null;
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
    CompanyDetails?: CompanyDetails | null;
    CompleteApplication?: CompleteApplication | null;
    FinancialInformation?: FinancialInformation[] | null;
}
export interface JobVolumeInformation {
    JobVolumeNumber: number | null | string;
    serial_no: number;
    Year: number;
    ResidentialInsuranceRestorationInPercentage: number;
    CommercialInsuranceRestorationInPercentage: number;
    ResidentialRemodellingInPercentage: number;
    CommercialRemodellingInPercentage: number;
    LargestSingleJobInYear: number;
    AverageJobAmountInYear: number;
}
export interface CompanyDetails {
    CompanyName: string;
    CompanyLegalName: string;
    WebSite: string;
    ContractorFederalTaxNumber: string;
    ContractorFranchiseSelectedNumber: number;
    ContractorCountryCode: number;
    ContractorXactNetAddress: string;
    ContractorSymbilityAddress: string;
    ContractorOpeningDate: string;
    ContractorPercentOfOverallBusinessSubContracted: number;
    ContractorCentralHeardMethod: string;
    CountOfEmployeesInContractorCompany: number;
    ContractorEmployeeUniformFlag: boolean;
    ContractorEmployeeIdentificationFlag: boolean;
    WorkersCompanyMinimumRequirementFlag: boolean;
    IsWorkersCompanyMinimumRequirementFlagDisable: boolean | null | string;
    ContractorMoistureData: ContractorMoistureData[];
}
export interface CompleteApplication {
    ApplicationAndProgramTypes: ApplicationAndProgramTypes[] | null;
    FinancialDeferralGuidelines: FinancialDeferralGuidelines | null;
}
export interface ApplicationAndProgramTypes {
    ContractorApplicationTypeNumber: number;
    TradeNumber: number;
    TradeSelectedDate: string;
    TradeRemovedDate: string | null;
}
export interface FinancialDeferralGuidelines {
    FinancialDeferralGuidelineNumber: null;
    FinancialDeferralUpdateDate: string | Date;
    FinancialDeferralUpdateResourceNumber: number;
    FinancialDeferralRemoveDate: string | Date;
    FinancialDeferralRemoveResourceNumber: number;
}
export interface ContractorMoistureData {
    SupportedFlag: boolean;
    IsSupportedFlag: boolean | null;
    VendorNumber: number;
    PreferredFlag: boolean;
    IsPreferredFlag: boolean | null;
}
export interface FinancialInformation {
    ROW_NO: number,
    FinancialYear: number,
    FiscalYearFlag: boolean,
    FiscalYearStartDate: string | Date,
    TotalRevenue: number,
    TotalExpenses: number,
    NetIncome: number,
    TotalCurrentAssets: number,
    TotalCurrentLiabilities: number,
    LongTermDebt: number,
    Equity: number,
    CreditRatio: number,
    DebtToEquityRatio: number
}
export interface GridData {
    serial_no: number;
    Year: number;
    JobVolumeNumber: number;
    ResidentialInsuranceRestorationInPercentage: number;
    CommercialInsuranceRestorationInPercentage: number;
    ResidentialRemodellingInPercentage: number;
    CommercialRemodellingInPercentage: number;
    LargestSingleJobInYear: number;
    AverageJobAmountInYear: number;
    isYear?: boolean;
    isResInsRestoPer?: boolean;
    isComInsResPer?: boolean;
    isResRemodelPer?: boolean;
    isComRemodelPer?: boolean;
    isLargestSingle?: boolean;
    isAverageJob?: boolean;
}
export interface PieData {
    key: string;
    value: number | Date | '' | 0;
}

export interface BarData {
    key: string;
    value: number | Date | '' | 0;
}

export interface ApprovalJobVolumeData {
AverageJobAmountInYear?: number
CommercialInsuranceRestorationInPercentage?: number
CommercialRemodellingInPercentage?: number
LargestSingleJobInYear?: number
ResidentialInsuranceRestorationInPercentage?: number
ResidentialRemodellingInPercentage?: number
Year?: number
JobVolumeNumber?: number
}
