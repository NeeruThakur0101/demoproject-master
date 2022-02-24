export interface CorrectionRequestComments {
    ApplicationPageID: number;
    Comment: Comments[];
    ApplicationPageGroupID: number;
    ApplicationPageName: string;
    ContractorCentralDataTypeID: number;
    CCOpsID: number;
}
export interface Comments {
    Comment: string;
}
export class User {
    resourceId: number;
    fname: string;
    lname: string;
    companyName: string;
    countryID: number;
    ccOpsID: number;
    resourceType: string;
    isOwnerPrinciple: boolean;
    email: string;
    contrID: number;
    JWTToken?: string;
    RoleDetails?: RoleMetadata[];
}
export interface LoginUser {
    CCOpsID: number;
    CompanyName: string;
    ContrID: number;
    ContractorResourceID: number;
    CountryID: number;
    Email: string;
    EmployeeFullName: string;
    EventName: string;
    EventTypeID: number;
    IsOwnerPrinciple: boolean;
    JWTToken: string;
    ResourceID: number;
    ResourceType: string;
    CurrentLanguageID: number;
}

export interface InternalLogin {
    Login: LoginUser[];
    RoleDetails: RoleMetadata[];
}
export interface RoleMetadata {
    ObjectPrivilegeDescription: string;
    RoleName: string;
}

export interface DeviceObj {
    screen: string;
    pageSize: number;
    pageObj: PageObj;
}

export interface PageObj {
    buttonCount: number;
    info: boolean;
    type: string;
    pageSizes: boolean;
    previousNext: boolean;
}

export interface JumpToDDL {
    ApplicationPageNameTranslated?: string;
    ApplicationPageName: string;
    ApplicationPageID: number;
    CorrectionRequestFlag?: string;
}

export interface FilterModel {
    PastDue?: string;
    Yesterday?: string;
    Today?: string;
    Tomorrow?: string;
    SevenDays?: string;
    ForteenDays?: string;
    ThirtyDays?: string;
    FortyDays?: string;
    SixtyDays?: string;
}
