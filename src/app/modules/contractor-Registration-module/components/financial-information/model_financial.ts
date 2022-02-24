export interface FinancialData {
    FinancialInformation: FinancialInformation[];
    CompanyDetails: CompanyDetails;
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
}

export interface CompanyDetails {
    ContractorOpeningDate: string;
}

export interface FinancialInformation {
    ROW_NO: number;
    FinancialYear: number;
    FiscalYearFlag?: boolean;
    FiscalYearStartDate?: string;
    TotalRevenue: number;
    TotalExpenses: number;
    NetIncome: number;
    TotalCurrentAssets: number;
    TotalCurrentLiabilities: number;
    LongTermDebt: number;
    Equity: number;
    CreditRatio: number;
    DebtToEquityRatio: number;
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
}
export interface FinancialInformationApproval {
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
    CreditRatio?: number;
    DebtToEquityRatio?: number;
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
}

export interface VisualCueObject {
    ROW_NO: number;
    FinancialYear: number;
    FiscalYearFlag?: boolean;
    FiscalYearStartDate?: string;
    TotalRevenue: number;
    TotalExpenses: number;
    NetIncome: number;
    TotalCurrentAssets: number;
    TotalCurrentLiabilities: number;
    LongTermDebt: number;
    Equity: number;
    CreditRatio: number;
    DebtToEquityRatio: number;

    isYear?: boolean;
    isFiscalYearFlag?: boolean;
    isFiscalYearStartDate?: boolean;
    isTotalRevenue?: boolean;
    isTotalExpenses?: boolean;
    isNetIncome?: boolean;
    isTotalCurrentAssets?: boolean;
    isTotalCurrentLiabilities?: boolean;
    isLongTermDebt?: boolean;
    isEquity?: boolean;
    isCredit?: boolean;
    isDebtTo?: boolean;
}