


export interface ContractorOperationPage {
    grid: OperationGrid[];
    showData: boolean;
}

// export interface
// Operation Page Grid Models
export interface OperationGrid {
    Contr_ID: number;
    ContractorMgmtEventID: number;
    ContractorMgmtEventTypeID: number;
    ContractorMgmtEventGroupID: number;
    ContractorMgmtEventAppUserID: number;
    DataTypeID: number;
    ContractorName: string;
    ContractorFullName: string;
    RecertificationDate: Date;
    ContractorMgmtEventType: string;
    ContractorMgmtEventGroupName: string;
    ContractorMgmtEventDate: Date | string;
    EventUserName: string;
    DataTypeName: string;
    EmailFlag: boolean;
    PrintFlag: boolean;
    HyperLinkFlg: boolean;

}

// Operation page email popup
export interface ContractorOperationEmail {
    email: OperationEmailDropDownOption[];
    loadingState: boolean;
}
export interface OperationEmailDropDownOption {
    PersonnelId: number;
    Email: string;

}

// Operation page Opps history popup
export interface ContractorOperationOpsHistory {
    grid: OperationOpsHistoryGrid[];
    // loadingState: boolean;
}
export interface OperationOpsHistoryGrid {
    Contr_Id: number;
    ContractorName: string;
    ChangeDate: Date;
    ChangeType: string;
    Status: string;
    disable: boolean;

}


// Operation page Add Event  popup
export interface ContractorOperationAddEvent {
    eventGroupDDL: EventGroupDropDown[];
    eventTypeDDL: EventTypeDropDown[];
    loadingState: boolean;
}
export interface EventGroupDropDown {
    EventGroupID: number;
    EventGroupName: string;

}
export interface EventTypeDropDown {
    EventTypeID: number;
    EventTypeName: string;
    EventGroupID: number;

}
export interface AddEvent {
    ResourceId: number;
    ContrId: number;
    EventGroupId: number;
    EventTypeId: number;
}


export interface OpsHistory {
    CCOpsData: string;
    CCOpsID: number;
    ChangeDate: string;
    ChangeType: string;
    Contr_Id: number;
    ContractorCentralDataTypeID: number;
    ContractorName: string;
    EmptyJSONFlag: boolean;
    EventName: string;
    PendingHyperlinkActiveFlag: boolean;
    Status: string;
    disable: boolean;
}

export interface OperationHistoryDetails {
    ActiveFlag: string;
    AddressType: string;
    ContactNumberType: string;
    ContractorLegalIssueID: number
    CoverageProfileTypeNumber: number;
    DeletedFlag: boolean;
    ExchangeListing: number;
    FieldName: string;
    Id: number;
    LegalID: number;
    LegalIssueEntryID: number;
    LegalIssueFieldTypeID: number;
    MonthsInCurrentOwnership: number;
    NewValue?: string;
    OldValue?: string;
    OwnershipStructure: number;
    Questionnaire: number;
    SerialNumber: number;
    StateProvinceID: number;
    StockSymbol: number;
    YearsInCurrentOwnership: number;

    isLocation?: boolean;
    isEditable?: boolean;
    locationKeypress?: boolean;
    dataType?: string;
    federalMask?: boolean;
    mobileMask?: boolean;
    ssnMask?: boolean;
    isEmail?: boolean;
    dataLength?: number;
    isFinancial?: boolean;
    customLength?: boolean;
    maxLength?: number;
    financialKeypress?: boolean;
    financailonPaste?: boolean;
    CCOpsID?: number;
    Event?: string;
    contractor_page?: string;
}

export interface SelectedItem {
    ResourceId: number;
    Contr_Id: number;
    ChangeType: string;
    ChangeTypeTranslated: string;
    EventNameTranslated: string;
    ChangeDate: Date | null | string;
    Event: string;
    CCOpsID: number;
    EventName: string;
}

export interface CompanyMetadata {
    frenchise: Frenchise[],
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

export interface OwnerMetadata {
    OwnerStructure: OwnerStruct[];
    OwnerRole: OwnerRoleStruct[];
}

export interface OwnerStruct {
    OwnerStructureID: number,
    OwnerStructureDesc: string
}
export interface OwnerRoleStruct {
    ContrEmployeeTypeID: number,
    ContractorEmployeeType: string
}

export interface EventGroup {
    EventGroupID: number;
    EventGroupName: string;
}

export interface EventType {
    DataTypeID: number;
    EventGroupID: number;
    EventTypeID: number;
    EventTypeName: string;
    SortOrder: number;
}

export interface MetaDataEvent {
    EventGroup: EventGroup[];
    EventType: EventType[];
    EventTerritoryData: EventTerritoryData[];
    EventTerritory: EventTerritoryData[];
}

export interface EventTerritoryData {
    ActiveFlg: number;
    ApplicationPageID: number;
    CCOpsID: number;
    ContractorCentralDataTypeID: number;
    DataTypeName: string;
    EventDataFlag: number;
    SubmittedDate: string;
}