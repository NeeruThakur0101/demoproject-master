export interface MedalionCount {
    MedallianType: string;
    MedallianTypeID: number;
    TotalCount: number;
}

export interface CallsTab {
    AIS: string;
    CCOpsID: number;
    ChangeType: string;
    ChangedDate: Date;
    ContractorCompanyName: string;
    ContractorID: number;
    ContractorName: string;
    LastFollowUpDate: Date | string;
    LastFollowupDateNew?: Date;
    Rep: string;
    RepResourceID: number;
    RepRole: object;
    State: string;
    CredentialingLicenseID: string;
    DateDue: Date;
    DateDueFilter: string;
    DateDueFilterNew: Date | string
    DateDueFilterNumeric: number
    DeliverableDue: string;
    HoverValue: string;
}

export interface AppSubmitted {
    AppType: string;
    CCOpsID: number;
    CONTR_CMPY_NM: string;
    CompanyName: string;
    ContrID: number;
    ContractorName: string;
    CountryID: number;
    Email: string;
    Fname: string;
    HoverValue: string;
    IsOwnerPrinciple: boolean;
    LastFollowupDate: Date | string;
    Lname: string;
    Rep: string;
    RepID: string;
    RepResourceID: number;
    RepRole: string;
    ResourceID: number;
    ResourceType: string;
    State: string;
    StateAbbreviationName: string;
    StateID: number;
    SubmitDate: Date | string;
}

export interface AppUpdate {
    AppType: string;
    CCOpsID: number;
    CompanyName: string;
    ContrID: number;
    ContractorName: string;
    CountryID: number;
    HoverValue: string;
    LastFollowupDate: Date | string;
    LastFollowupDateNew: Date;
    Rep: string;
    RepResourceID: number;
    StartedDate: Date | string;
    StateAbbreviationName: string;
    StateID: number;
    StateName: string;
    SubmitDate: Date | string;
}

export interface AppStarted {
    ContrID: number,
    CompanyName: string,
    ContractorName: string,
    StateID: number,
    StateName: string,
    StartedDate: Date | string,
    StateAbbreviationName: string,
    LastFollowupDate: Date | string,
    Rep: string,
    RepResourceID: number,
    RepRole: string,
    AppType: string,
    HoverValue: string,
    CCOpsID: number,
    CountryID: number,
    Email: string,
    Fname: string,
    Lname: string,
    IsOwnerPrinciple: boolean,
    ResourceID: number,
    ResourceType: string,
    Count: number
}

export interface ProfileChange {
    AIS: string;
    CCOpsID: number;
    ChangeType: string;
    ChangedDate: Date | string;
    ContractorCompanyName: string;
    ContractorID: number;
    ContractorName: string;
    LastFollowUpDate: Date | string;
    LastFollowupDateNew?: Date;
    Rep: string
    RepResourceID: number;
    RepRole: string
    State: string;
}

export interface Recerts {
    CCOpsID: number;
    ContractorCompanyName: string;
    ContractorID: number;
    ContractorName: string;
    MilestoneDate: Date | string;
    RecertStatus: string;
    Rep: string;
    RepID: number;
    RepResourceID: number;
    State: string;
}

export interface LegalIssue {
    CCOpsID: number;
    ContractorCompanyName: string;
    ContractorID: number;
    ContractorName: string;
    HoverValue: string;
    IssueDate: Date | string;
    LastFollowUpDate: Date | string;
    LastFollowupDateNew?: Date;
    LegalIssue: string;
    Rep: string;
    RepResourceID: number;
    State: string;
}

export interface CoverageArea {
    AIS: string;
    CCOpsID: number;
    ChangeType: string;
    ChangedDate: Date | string;
    ContractorCompanyName: string;
    ContractorID: number;
    ContractorName: string;
    LastFollowUpDate: Date | string;
    LastFollowUpDateNew?: Date;
    Rep: string;
    RepResourceID: number;
    RepRole: string;
    State: string;
}

export interface ContractorReassign {
    RepID: number;
    RepName: string;
    RepResourceID: number;
    RepRole: string;
}