export interface SignatureData {
    OwnershipDetails?: OwnershipDetails;
    ContractorSignatureInitials?: string;
    ContractorSignatureDate?: string;
    LoginUserEmail?: string;
    CCOpsData?: string;
    ResourceId: number;
    CCopsId: number;
    LastPageVisited: string;
}

export interface OwnershipDetails {
    OwnershipInformationList: OwnershipInformationList;
    OwnershipStructure: number;
}

export interface OwnershipInformationList {
    PRNL_ID?: number;
    OwnershipNumber?: number;
    ID?: number;
    OwnershipName?: string;
    ContrEmployeeTypeId: number;
    ContactEmail?: string;
    ContactPhone?: string;
    VeteranEmployeeMilitaryAffiliation?: string;
    SocialSecurityNumber?: string;
    DrivingLicense?: string;
    DateOfBirth?: string;
    OwnershipPercentage?: number;
    IsContractorActive?: string;
    VeteranFlag?: string;
    VeteranEmployeeHireDate?: string;
    LegalIssueFlag?: string;
    ActiveFlag?: boolean;
}