export interface SavedEquipment {
    EquipmentInformation: EquipmentInfo | null;
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string | null;
}
export interface EquipmentInfo {
    IsMarkedCompanyVehicles: false;
    EquipmentDetails: EquipmentDetail[] | null;
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string | null;
}
export interface EquipmentDetail {
    NumberOfEquipmentOwned: number;
    NumberOfEquipmentLease: number;
    EquipmentNumber: number;
    EquipmentName: string;
}
export interface EquipmentInfoTab {
    EquipmentTypeID: number;
    EquipmentTypeName: string;
    EquipmentCount: number;
    Equipments?: Equipment[] | null;
    Count: number | null;
    IsVisualFlag: boolean;
}

export interface Equipment {
    EQPL_ID_NB: number;
    EQPL_TX: string;
    EquipmentTypeID: number;
    own?: number | null;
    lease?: number | null;
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
}

export interface SaveEquipment {
    IsMarkedCompanyVehicles: boolean;
    EquipmentDetails: EquipmentDetail[];
    ResourceId: number;
    CCopsId: number;
    LastPageVisited: string | null;
}