export interface AllHeaderInfo {
    backgroundAddendum: BackgroundAddendumInfo[];
    headerData: HeaderInfo[];
}

export interface BackgroundAddendumInfo {
    VendorID: number;
    VendorName: string
}
export interface HeaderInfo {
    CONTR_ID: number;
    ContractorNameWithID: number;
    ContractorMgmtEventDate: string;
    BGExceptionFlag: boolean;
    AnnualScreeningReqFlag: boolean;
    CredentialingTrackingID: number;
    VendorID: number;
    VenderName: string;
    EmployeeCount: number;
}

export interface ProgramInfo {
    C_Status: string;
    Colors: string;
    PRISMClientName: string;
    PrismClientID: number;
}
export interface OwnersInfo {
    PersonnelID: number;
    ContractorID: number;
    ContrPersonnelSubscriptionID: number;
    PersonnelName: string;
    PersonnelEmail: string;
    PersonnelPhone: number;
    PersonnelPercentage: number;
}
export interface SubContractedTradesInfo {
    Contr_ID: number;
    ContrTradeID: number;
    TradeListID: number;
    TradeName: string;
    SubOutPct: number;
}

export interface ClientProgram {
    PrismClientID : number;
    PRISMClientName : string;
    C_Status : string;
    Colors : string;
    USAAPayApprov : string;
    ProgramTitle : string;
}