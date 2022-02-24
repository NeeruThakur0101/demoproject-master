
export interface LocationData {
    LocationInformation?: LocationInformation;
    ContactDetails?: ContactDetails
}

export interface LocationInformation {
    OtherNetworkOfficeLocations?: boolean;
    OtherSatelliteLocations?: boolean;
    ContractorLocationList?: ContractorLocationList[];
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
}

export interface ContactDetails {
    Address: Address
}

export interface Address {
    AddressType?: string,
    StreetAddress?: string,
    StreetAddress2?: string,
    City?: string,
    State?: string,
    PostalCode?: string
}

export interface ContractorLocationList {
    SerialNumber?: number;
    LocationNumber?: number;
    IsPhysicalAddressSame?: boolean;
    FacilityTypeORLocationName?: string;
    LocationStreetAddress?: string;
    City?: string;
    State?: number | string;
    PostalCode?: string;
    ContractorLocationTypeNumber?: number;
    ContractorFacilityTypeNumber?: number;
    SpaceHoldTypeNumber?: number
    ContractorLocationSpaceUse?: number | string;
    OfficeOwnedIndicator?: number;
    SeparateOfficeFlag?: boolean;
    SpaceHoldTypeName?: string;
    SeparateEntranceFlag?: boolean
    ContractorFacilityTypeName?: string;
    ContractorLocationTypeName?: string;
    OfficeOwnedIndicatorName?: string;
    StateName?: string;
    SatelliteLocationFlag?: boolean;
    OtherNetworkOfficeFlag?: boolean;
    IsRowDisable?: boolean;
}

export interface VisualCueObject {
    SerialNumber?: number;
    LocationNumber?: number;
    IsPhysicalAddressSame?: boolean;
    FacilityTypeORLocationName?: string;
    LocationStreetAddress?: string;
    City?: string;
    State?: number | string;
    PostalCode?: string;
    ContractorLocationTypeNumber?: number;
    ContractorFacilityTypeNumber?: number;
    SpaceHoldTypeNumber?: number
    ContractorLocationSpaceUse?: number | string;
    OfficeOwnedIndicator?: number;
    SeparateOfficeFlag?: boolean;
    SpaceHoldTypeName?: string;
    SeparateEntranceFlag?: boolean
    ContractorFacilityTypeName?: string;
    ContractorLocationTypeName?: string;
    OfficeOwnedIndicatorName?: string;
    StateName?: string;
    SatelliteLocationFlag?: boolean;
    OtherNetworkOfficeFlag?: boolean;
    IsRowDisable?: boolean;

    isFacilityTypeORLocationName?: boolean,
    isLocationStreetAddress?: boolean,
    isCity?: boolean,
    isIsPhysicalAddressSame?: boolean,
    isStateName?: boolean,
    isPostalCode?: boolean,
    isContractorLocationTypeName?: boolean,
    isContractorFacilityTypeName?: boolean,
    isSpaceHoldTypeNumber?: boolean,
    isSpaceHoldTypeName?: boolean,
    isOfficeOwnedIndicatorName?: boolean,
    isContractorLocationSpaceUse?: boolean,
    isSeparateOfficeFlag?: boolean,
    isSeparateEntranceFlag?: boolean
}

export interface PageChange {
    skip: number;
    take: number;
}

export interface StateServiceModel {
    Name: string;
    ID: number;
    Abbreviation: string;
}

export interface LocationTypeServiceModel {
    ContractorLocationTypeTitle: string;
    ContractorLocationTypeID: number;
    ContractorLocationTypeTitleTranslated: string;
}

export interface FacilityTypeModel {
    ContractorFacilityTypeTitle: string;
    ContractorFacilityTypeID: number;
    ContractorFacilityTypeTitleTranslated: string;
}

export interface SpaceTypeModel {
    SpaceUseTypeTitle: string;
    SpaceUseTypeID: number;
}
export interface SelectType {
    SpaceHoldTypeTitle: string;
    SpaceHoldTypeID: number;
}

export interface LocationDropdownData {
    State: StateServiceModel[];
    contractorLocationData: LocationTypeServiceModel[];
    contractorfacilitydata: FacilityTypeModel[];
    spaceholdtypedata: SelectType[];
    spaceusertypedata: SpaceTypeModel[];
}



