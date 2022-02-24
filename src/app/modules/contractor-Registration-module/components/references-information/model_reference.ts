export interface ReferenceData {
    ReferenceInformation?: ReferenceInformation[];
    CompleteApplication?: CompleteApplication;
    FinancialInformation?: FinancialInformation;
    LastPageVisited?: string;
}

export interface FinancialInformation {
    ROW_NO?: number;
    FinancialYear?: number;
    FiscalYearFlag?: boolean;
    FiscalYearStartDate?: string;
    TotalRevenue?: number;
    TotalExpenses?: number;
    NetIncome?: number;
    TotalCurrentAssets?: number;
    TotalCurrentLiabilities?: number;
    LongTermDebt?: number;
    Equity?: number;
    CreditRatio: number;
    DebtToEquityRatio?: number;
}

export interface ReferenceInformation {
    SrNo: number;
    ReferenceNumber: number;
    ReferenceTypeNumber?: string;
    ReferenceTypeCode?: number;
    ReferenceName: string;
    ReferenceEmail: string;
    ReferencePhoneNumber: string;
    ReferenceCompanyName?: string;
    ReferencePosition?: string;
    JobType?: string;
    JobTypeNumber?: number;
    ReferenceComment?: string;
    ReferenceJobType?: string;
    AdditionalContactName?: string;
    ReferenceCommentNumber?: number;
    ContractorReferenceTypeNumber?: number;
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
    IsRowDisable?: boolean;
}

export interface CompleteApplication {
    ApplicationAndProgramTypes: ApplicationAndProgramTypes[];
    FinancialDeferralGuidelines: FinancialDeferralGuidelines;
    ResourceId?: number;
    CCopsId?: number;
}
export interface FinancialDeferralGuidelines {
    FinancialDeferralRemoveDate?: string

}

export interface ApplicationAndProgramTypes {
    ContractorApplicationTypeNumber: number;
    TradeNumber: number;
    TradeSelectedDate: string;
    TradeRemovedDate: string
}
export interface ReferenceAndJobType {
    referenceTypeData: ReferenceTypeData[];
    jobTypeData: JobTypeData[]
}
export interface ReferenceTypeData {
    ReferenceCount: number;
    ReferenceTypeCode: number;
    ReferenceTypeName: string;
    ReferenceTypeNameTranslated: string;
    ReferenceTypeNumber?: number;
}

export interface JobTypeData {
    TradeListID: number;
    TradeName: string
}

export interface VisualCueReferenceObj {
    SrNo: number;
    ReferenceNumber: number;
    ReferenceTypeNumber?: string;
    ReferenceTypeCode?: number;
    ReferenceName: string;
    ReferenceEmail: string;
    ReferencePhoneNumber: string;
    ReferenceCompanyName?: string;
    ReferencePosition?: string;
    JobType?: string;
    JobTypeNumber?: number;
    ReferenceComment?: string;
    AdditionalContactName?: string;
    ReferenceCommentNumber?: number;
    ContractorReferenceTypeNumber?: number
    ReferenceJobType?: string

    isReferenceName?: boolean;
    isReferenceTypeNumber?: boolean;
    isReferenceCompanyName?: boolean;
    isReferencePosition?: boolean;
    isReferencePhoneNumber?: boolean;
    isReferenceEmail?: boolean;
    isJobType?: boolean;
    isAdditionalContactName?: boolean;
    isReferenceComment?: boolean

}

export interface ReferenceTypeServiceModel {
    ReferenceTypeName: string;
    ReferenceTypeCode: number;
    ReferenceTypeNameTranslated: string;
}