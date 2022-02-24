import { ManageSurge } from '../../dialogs/manage-surge-license/model_manage_surge';

export interface SurgeData {
    ContingencyFileYesNo: string;
    ContractorNumber: number;
    CreatedDate: string;
    ExpandDistance: number;
    ExpandTrades: string;
    HoursToMobilize: number;
    LoggedInResourceID: number;
    ManageSurgeResponseFlag: boolean;
    MobilizeDistance: number;
    MobilizeMinimum: number;
    MobilizeTrades: string;
    ModifiedDate: string;
    SurgeResponseDetail: SurgeResponseDetail[];
    SurgeResponseNumber: number;
    WillingToExpandFlag: number;
    WillingToMobilizeFlag: number;
    ExpandedCoverageID: number;
    MobilizedCoverageID: number;
}

export interface SurgeResponseDetail {
    SurgeResponseDetailNumber: number;
    SurgeResponseDetailTypeNumber: number;
    TypeTitleName: string;
    GroupID: number;
    GroupName: string;
}

export interface SurgeDetailDropdownData {
    HostNetwork?: string;
    HostNetworkID?: number;
    SharedNetwork?: string;
    SharedNetworkID?: number;
    Reason?: string;
    ReasonID?: number;
    GroupID?: number;
    GroupName?: string;
    SurgeResponseDetailTypeNumber?: number;
    SurgeResponseDetailNumber?: number;
}

export interface SurgeDropDownData {
    SurgeDetails: SurgeDetails[];
    SurgeReason: SurgeReason[];
    TradeListDetails: TradeListDetails[];
    CoverageListDetails: CoverageListDetails[];
}

export interface SurgeDetails {
    Contr_ID: number;
    GroupID: number;
    GroupName: string;
    SurgeResponseDetailID: number;
    SurgeResponseID: number;
    TypeTitleID: number;
    TypeTitleName: string;
    SurgeResponseDetailTypeNumber: number;
}

export interface SurgeReason {
    GroupDescription: string;
    GroupID: number;
    GroupName: string;
    TypeTitleDescription: string;
    TypeTitleID: number;
    TypeTitleName: string;
    SurgeResponseDetailTypeNumber?: number;
}

export interface TradeListDetails {
    Description: string;
    TradeListDetailID: number;
    TradeListDetailTypeID: number;
    TradeListDetailTypeName: string;
    TradeListID: number;
    tradeDesc: string;
}

export interface TradeList {
    TradeListID: number;
    tradeDesc: string;
}

export interface CoverageListDetails {
    ExpandedCoverageID: number;
    MobilizedCoverageID: number;
}

export interface SurgeJSONData {
    SurgeResponseInformation?: SurgeResponseInformation;
}

export interface SurgeResponseInformation {
    ContingencyFileYesNo?: string;
    ContractorNumber?: number;
    CreatedDate?: string;
    ExpandDistance?: number;
    ExpandTrades?: string;
    HoursToMobilize?: number;
    LoggedInResourceID?: number;
    ManageSurgeResponseFlag?: boolean;
    MobilizeDistance?: number;
    MobilizeMinimum?: number;
    MobilizeTrades?: string;
    ModifiedDate?: string;
    SurgeResponseDetail?: SurgeResponseDetail[];
    SurgeResponseNumber?: number;
    ManageSurgeLicenses?: ManageSurge[];
    WillingToExpandFlag?: number;
    WillingToMobilizeFlag?: number;
    RemovedSurgeReponseDetail?: RemovedSurgeReponseDetail[];
    IsWillingToMobilizeFlagDisable?: boolean;
    IsMobilizeTradesDisable?: boolean;
    IsExpandTradesDisable?: boolean;
    IsMobilizeMinimumDisable?: boolean;
    IsHoursToMobilizeDisable?: boolean;
    IsWillingToExpandFlagDisable?: boolean;
    IsExpandDistanceDisable?: boolean;
    IsContingencyFileYesNoDisable?: boolean;
}

export interface RemovedSurgeReponseDetail {
    SurgeResponseDetailNumber: number;
    SurgeResponseDetailTypeNumber: number;
    TypeTitleName: string;
    GroupID: number;
    GroupName: string;
}
