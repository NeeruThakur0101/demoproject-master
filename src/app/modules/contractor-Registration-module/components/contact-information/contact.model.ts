export interface StateModel {
    ID: number;
    Name: string;
    Abbreviation: string;
}
interface VisualCue {
    visualCue: boolean;
}

export interface Comments {
    Comment: string;
}
export interface AddressObj {
    AddressType?: string;
    StreetAddress?: string;
    StreetAddress2?: string;
    City?: string;
    State?: string;
    PostalCode?: string;
}
interface VisualAddressObj {
    AddressType: string;
    StreetAddress: boolean;
    StreetAddress2: boolean;
    City: boolean;
    State: boolean;
    PostalCode: boolean;
    visualCue: boolean;
}
interface ContactNumber {
    ContactNumberType?: string;
    ContactNumber?: string;
}
interface VisualContactNumber {
    ContactNumberType: string;
    ContactNumber: string;
    visualCue: boolean;
}

export interface Contact {
    BillingCompanyName: string;
    BillingContactName: string;
    BillingPhone: string;
    BillingFax: string;
    BillingEmail: string;
    ContractorEmails: string;
    CrawfordContractorConnectionContactName: string;
    CrawfordContractorConnectionContactNumber: string;
    CrawfordContractorConnectionContactEmail: string;
    CrawfordContractorConnectionTrainingContact: string;
    IsMailingAddressPhysicalAddressSame: boolean;
    IsBillingAddressPhysicalAddressSame: boolean;
    ContactNumbers?: ContactNumber[];
    Address?: AddressObj[];
    ResourceId?: number;
    CCopsId?: number;
    LastPageVisited?: string;
}
export interface ContactDetail {
    ContactDetails: Contact;
    ContactInfoLastTabVisited?: number;
    ContractorResourceNumber?: number;
    LastPageVisited?: string;
    ResourceId?: number;
    CCopsId?: number;
    CCC_ContactName?: string;
    CCC_PhoneNumber?: string;
    CCC_TrainingContact?: string;
}

export const initialContactMockData: ContactDetail = {
    ContactDetails: {
        BillingCompanyName: null,
        BillingContactName: null,
        BillingPhone: null,
        BillingFax: null,
        BillingEmail: null,
        ContractorEmails: null,
        CrawfordContractorConnectionContactName: null,
        CrawfordContractorConnectionContactNumber: null,
        CrawfordContractorConnectionContactEmail: null,
        CrawfordContractorConnectionTrainingContact: null,
        IsMailingAddressPhysicalAddressSame: false,
        IsBillingAddressPhysicalAddressSame: false,
        ContactNumbers: [
        ],
        Address: [],
        ResourceId: null,
        CCopsId: null,
        LastPageVisited: null,
    },
    ResourceId: null,
    CCopsId: null,
    LastPageVisited: null,
};
export interface VisualCueObjectModel {
    BillingCompanyName: boolean;
    BillingContactName: boolean;
    BillingPhone: boolean;
    BillingFax: boolean;
    BillingEmail: boolean;
    ContractorEmails: boolean;
    CrawfordContractorConnectionContactName: boolean;
    CrawfordContractorConnectionContactNumber: boolean;
    CrawfordContractorConnectionContactEmail: boolean;
    CrawfordContractorConnectionTrainingContact: boolean;
    IsMailingAddressPhysicalAddressSame: boolean;
    IsBillingAddressPhysicalAddressSame: boolean;
    ContactNumbers: VisualContactNumber[];
    Address: VisualAddressObj[];
    Emails: VisualCue[];
    IsOfficeContactDisable?: boolean;
    IsAlternateContactDisable?: boolean;
    IsEmergencyContactDisable?: boolean;
    IsFaxContactDisable?: boolean;
    IsContractorEmailsDisable?: boolean;
    IsCrawfordContractorConnectionContactNameDisable?: boolean;
    IsCrawfordContractorConnectionContactNumberDisable?: boolean;
    IsCrawfordContractorConnectionContactEmailDisable?: boolean;
    IsCrawfordContractorConnectionTrainingContactDisable?: boolean;
    IsBillingCompanyNameDisable?: boolean;
    IsBillingContactNameDisable?: boolean;
    IsBillingPhoneDisable?: boolean;
    IsBillingFaxDisable?: boolean;
    IsBillingEmailDisable?: boolean;
    IsPhysicalStreetAddressDisable?: boolean;
    IsPhysicalStreetAddress2Disable?: boolean;
    IsPhysicalCityDisable?: boolean;
    IsPhysicalStateDisable?: boolean;
    IsPhysicalPostalCodeDisable?: boolean;
    IsMailingStreetAddressDisable?: boolean;
    IsMailingStreetAddress2Disable?: boolean;
    IsMailingCityDisable?: boolean;
    IsMailingStateDisable?: boolean;
    IsMailingPostalCodeDisable?: boolean;
    IsBillingStreetAddressDisable?: boolean;
    IsBillingStreetAddress2Disable?: boolean;
    IsBillingCityDisable?: boolean;
    IsBillingStateDisable?: boolean;
    IsBillingPostalCodeDisable?: boolean;
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

export const visualCueInitialObject: VisualCueObjectModel = {
    BillingCompanyName: false,
    BillingContactName: false,
    BillingPhone: false,
    BillingFax: false,
    BillingEmail: false,
    ContractorEmails: false,
    CrawfordContractorConnectionContactName: false,
    CrawfordContractorConnectionContactNumber: false,
    CrawfordContractorConnectionContactEmail: false,
    CrawfordContractorConnectionTrainingContact: false,
    IsMailingAddressPhysicalAddressSame: false,
    IsBillingAddressPhysicalAddressSame: false,
    ContactNumbers: [
        {
            ContactNumberType: 'Office',
            ContactNumber: '',
            visualCue: false,
        },
        {
            ContactNumberType: 'Alternate',
            ContactNumber: '',
            visualCue: false,
        },
        {
            ContactNumberType: 'Emergency',
            ContactNumber: '',
            visualCue: false,
        },
        {
            ContactNumberType: 'Fax',
            ContactNumber: '',
            visualCue: false,
        },
    ],
    Address: [
        {
            AddressType: 'Physical',
            StreetAddress: false,
            StreetAddress2: false,
            City: false,
            State: false,
            PostalCode: false,
            visualCue: false,
        },
        {
            AddressType: 'Mailing',
            StreetAddress: false,
            StreetAddress2: false,
            City: false,
            State: false,
            PostalCode: false,
            visualCue: false,
        },
        {
            AddressType: 'Billing',
            StreetAddress: false,
            StreetAddress2: false,
            City: false,
            State: false,
            PostalCode: false,
            visualCue: false,
        },
    ],
    Emails: [{ visualCue: false }, { visualCue: false }, { visualCue: false }, { visualCue: false }, { visualCue: false }],
};

export interface ApprovalContactDetail {
    BillingCompanyName?: string;
    BillingContactName?: string;
    BillingPhone?: string;
    BillingFax?: string;
    BillingEmail?: string;
    ContractorEmails?: string;
    CrawfordContractorConnectionContactName?: string;
    CrawfordContractorConnectionContactNumber?: string;
    CrawfordContractorConnectionContactEmail?: string;
    CrawfordContractorConnectionTrainingContact?: string;
    IsMailingAddressPhysicalAddressSame?: boolean;
    IsBillingAddressPhysicalAddressSame?: boolean;
    ContactNumbers?: {
        ContactNumberType?: string;
        ContactNumber?: string;
    }[];
    Address?: {
        AddressType?: string;
        StreetAddress?: string;
        StreetAddress2?: string;
        City?: string;
        State?: string;
        PostalCode?: string;
    }[];

    ContactInfoLastTabVisited?: number;
    ContractorResourceNumber?: number;
    LastPageVisited?: string;
    ResourceId?: number;
    CCopsId?: number;
}
