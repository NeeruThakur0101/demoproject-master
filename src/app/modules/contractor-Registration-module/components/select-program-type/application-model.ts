export interface ApplicationType{
  LastPageVisited : string;
  ResourceId? : number,
  CCopsId? : number,
  CompleteApplication : CompleteApplication
}
export interface  CompleteApplication {
    ApplicationAndProgramTypes : ApplicationProgramType[];
    FinancialDeferralGuidelines? : FinancialDeferralGuidelines;
}
export interface FinancialDeferralGuidelines  {
    FinancialDeferralGuidelineNumber? : number;
    FinancialDeferralUpdateDate? : string;
    FinancialDeferralUpdateResourceNumber? : number;
    FinancialDeferralRemoveDate? : string;
    FinancialDeferralRemoveResourceNumber? : number
  }

  export interface ApplicationProgramType {
        ContractorApplicationTypeNumber : number,
        TradeNumber : number
        TradeSelectedDate : string
        TradeRemovedDate : string
  }

  export interface RefInfo {
    Id: number,
    Name: string,
    Checked: boolean,
  }

  export interface AppType {
    ContrAppTypeDefinition:  string;
    ContrAppTypeDesc:  string;
    ContrAppTypeID: number;
    Trades :  Trades[];
  }

  export interface Trades {
    Checked: boolean;
    ContrAppTypeID: number;
    ContrApplicationTypeTradeMapID: number;
    TradeListID: number;
    TradeName: string;
  }
