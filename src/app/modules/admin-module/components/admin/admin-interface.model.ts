export interface UserRights {
    ResourceID: number;
    WebLogin: string;
    showValue: string;
    Email: string
}

export interface ContractorList {
    Contr_ID: number;
    ContractorName: string;
    showValue: string;
}

export interface SaveMultiLocationData {
    LeadContrId?: number;
    ChildContrId?: string;
    AssignUserRightsResourceID?: number
}

export interface AssignLiscenceData {
    licenseDropdown: LiscenseDropdown[];
    programTypeDropdown: ProgramTypeDropdown[];
    stateProvinceDropdown: StateProvinceDropdown[];
    tradeListDropdown: TradeListDropdown[];
}

export interface LiscenseDropdown {
    ContrLicenseDescription: string;
    ContrLicenseID: number;
    ContrLicenseName: string;
}
export interface ProgramTypeDropdown {
    ProgramTypeAbbreviationCode: string;
    ProgramTypeID: number;
    ProgramTypeName: string;
}
export interface StateProvinceDropdown {
    CountryID: number;
    StateAbbreviationCode: string;
    StateProvinceID: number;
    StateProvinceName: string;
}
export interface TradeListDropdown {
    tradeAbbreviationCode: string;
    tradeListID: number;
    tradeName: string;
}

export interface LicenseModel {
    stateProvince: string | null;
    assignLiscenseName: string | null;
    assignProgram: string | null;
    tradeSelect: string | null;
}

export interface LicenseData {
    ContrLicenseDesc: string | null;
    ContrLicenseID: number;
    ContrLicenseName: string;
    FullContrLicenseName: string;
}

export interface EquipmentType {
    EquipmentTypeID: number;
    EquipmentTypeName: string;
}

export interface EquipmentSelect {
    EquipmentListID: number;
    EquipmentListName: string;
    EquipmentTypeID: number;
    EquipmentTypeName: string;
}
