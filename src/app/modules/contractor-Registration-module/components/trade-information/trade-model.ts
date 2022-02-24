export interface TradeList {
    TradeGroupID: number,
    TradeListID: number,
    TradeName: string,
    Program: string,
    ProgramEnabled: boolean,
    SubOutChkFlg: boolean,
    SingleTradeEligible: boolean,
    ConsumerEligible: boolean,
    ReasonList : Reason[]
}

export interface Reason {
    ContractorSubOutReasonNumber: number,
    ContractorSubOutReasonName: string;
}
export interface TradeGroupList {
    TradeGroupID: number,
    TradeGroupDesc: string,
    TradeNameList: TradeList[],
    showSubOutReason: boolean
}

export interface TradeJsonResult {
    CCopsId?: number;
    LastPageVisited?: string;
    ResourceId?: number;
    TradeInformation: TradeListJson[];
}
export interface TradeListJson {
    ConsumerFlg: boolean
    SubOutPct: number
    TradeGroupID: number
    ContrTradeID: number
    PrimaryFlg: boolean
    SingleTradeFlg: boolean
    TradeListID: number,
    SubOutComment?: string,
    ContractorSubOutReasonNumber?: number,
    ContractorSubOutReasonName?: string
}

export interface TradeListJsonApproval {
    SubOutComment?: string
    ContractorSubOutReasonNumber?: number
    ContractorSubOutReasonName?: string
    ConsumerFlg?: boolean
    SubOutPct?: number
    TradeGroupID?: number
    ContrTradeID?: number
    PrimaryFlg?: boolean
    SingleTradeFlg?: boolean
    TradeListID?: number
}
export interface InvalidCountArray {
    groupId: number,
    tradeId: number,
    count: number
}

export interface SubOutReason {
    ContractorSubOutReasonName: string;
    ContractorSubOutReasonNumber: number;
}