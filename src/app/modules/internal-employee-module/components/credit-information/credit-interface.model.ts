export interface AddCredit {
    ActionRatingID: number;
    CONTR_ID: number;
    CRRPT_ID_NB: number;
    Comments: string;
    CreditScore: number;
    HightestCredit: number;
    NumberOfTradeLines: number;
    PaymentTrend: number;
    ReportsDate: string;
    RunType: string;
    TypeofReport: string;
}

export interface CreditList {
    ActionRatingDesc: string;
    CONTR_ID: number;
    CRRPT_ID_NB: number;
    Comments: string;
    FileNumber: number;
    HightestCredit: number;
    ID?: number;
    PaymentTrend: number;
    ReportType: string;
    ReportsDate: string;
    TreadLines: number;
    actionRatingID: number;
    creditScore: string;
}

export interface ActionRating {
    actionRatingID: number;
    ActionRatingDesc: string;
    ExperianRatingText: string;
}