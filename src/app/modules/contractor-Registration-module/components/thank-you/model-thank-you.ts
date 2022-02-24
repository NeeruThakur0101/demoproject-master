export interface ThankYouData {
    CompleteApplication?: CompleteApplication;
    LastPageVisited?: string;
}

export interface CompleteApplication {
    ApplicationAndProgramTypes: ApplicationAndProgramTypes[];
    ResourceId?: number;
    CCopsId?: number;
}

export interface ApplicationAndProgramTypes {
    ContractorApplicationTypeNumber: number;
    TradeNumber: number;
    TradeSelectedDate: string;
    TradeRemovedDate: string
}