export interface EmployeeData {
    EmpDetails: EmpDetails[];
    RoleDetails: RoleDetails[];
}

export interface EmpDetails {
    Srno?: number;
    CONTR_ID: number;
    ContrEmployeeTypeID: number | null;
    ContractorCompanyName: string;
    ContractorVeteranEmployeeID: number;
    EditFlag: boolean;
    Email: string | null;
    EmployeeRole: string;
    EmployeeRoleTranslated?: string;
    Name: string;
    PRNL_ID: number;
    Phone: string | null;
    VeteranEmployeeHireDate: string | null;
    VeteranFlg: boolean;
    VeteranFlgCount: number;
    VeteranMilitaryAffiliationData: VeteranMilitaryAffiliationData[] | null;
}

export interface VeteranMilitaryAffiliationData {
    AddedDate: Date;
    AddedResourceID: number;
    ContractorVeteranEmployeeNumber: string;
    MilitaryAffiliationName: string;
    MilitaryAffiliationNumber: string;
    OwnershipNumber: number;
    RemovedDate: Date;
    RemovedResourceID: number;
}

export interface RoleDetails {
    Percentage: number;
    RoleID: number;
    RoleName: string;
    Rolecount: number;
}

export interface EmpDropdowndata {
    _empType: EmpType[];
    _militaryAffiliation: MilitaryAffiliation[];
}

export interface EmpType {
    ContrEmployeeTypeID: number;
    EmployeeRole: string;
    EmployeeRoleTranslated: string
}

export interface MilitaryAffiliation {
    MilitaryAffiliation: string;
    MilitaryAffiliationID: string;
}

export interface VeteranMilitaryAffiliationDialog {
    AddedDate?: Date;
    AddedResourceID?: number;
    ContractorVeteranEmployeeNumber?: string;
    MilitaryAffiliationName?: string;
    MilitaryAffiliationNumber?: string;
    OwnershipNumber?: number;
    RemovedDate?: Date;
    RemovedResourceID?: number;
}

export interface EmpDeleteDetails {
    CONTR_ID: number;
    PRNL_ID: number;
    ContrEmployeeTypeID: number | null;
}