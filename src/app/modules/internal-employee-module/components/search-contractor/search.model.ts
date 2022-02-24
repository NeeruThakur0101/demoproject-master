export interface SearchContractor {
CompanyName: string;
ContractorID: number;
City: string,
ContractorName: string;
DM: string | number;
PRNL_ID: number;
PostalCode: string;
PrimaryOwnerName: string;
State: string;
XNASymbilityID: string;
}
export interface ValueControl{
    contractorId:string;
    contractorName:string;
    ownerPrincipal:string;
    city:string;
    state:string;
    postalCode:string;
    dm:string
    xnaSymbility:string;
}

export interface DeviceResObj{
    pageObj:{
        buttonCount: number;
        info: boolean;
        pageSizes: boolean;
        previousNext: boolean;
        type: string;
    };
    pageSize:number;
    screen:string;
}
























// export const searchResults = [
//     {
//         "contractor": "(###) Contractor 1",
//         "st":"FL",
//         "city": "Sample City",
//         "postalcode":"####",
//         "owner":"Sample Owner 4",
//         "dm":"Sample DM 4",
//         "xna":"Sample.fl.2",
//         "simbility":"123-45-6789"
//     },
//     {
//         "contractor": "(###) Contractor 2",
//         "st":"GA",
//         "city": "Sample City",
//         "postalcode":"####",
//         "owner":"Sample Owner 1",
//         "dm":"Sample DM ",
//         "xna":"Sample.fl.2",
//         "simbility":"123-45-6789"
//     },
//     {
//         "contractor": "(###) Contractor 3",
//         "st":"MI",
//         "city": "Sample City",
//         "postalcode":"####",
//         "owner":"Sample Owner 3",
//         "dm":"Sample DM ",
//         "xna":"Sample.fl.2",
//         "simbility":"123-45-6789"
//     },
//     {
//         "contractor": "(###) Contractor 4",
//         "st":"TX",
//         "city": "Sample City",
//         "postalcode":"####",
//         "owner":"Sample Owner 4",
//         "dm":"Sample DM ",
//         "xna":"Sample.fl.2",
//         "simbility":"123-45-6789"
//     },
//     {
//         "contractor": "(###) Contractor 5",
//         "st":"FX",
//         "city": "Sample City",
//         "postalcode":"####",
//         "owner":"Sample Owner 5",
//         "dm":"Sample DM ",
//         "xna":"Sample.fl.2",
//         "simbility":"123-45-6789"
//     },
//     {
//         "contractor": "(###) Contractor 6",
//         "st":"FL",
//         "city": "Sample City",
//         "postalcode":"####",
//         "owner":"Sample Owner 6",
//         "dm":"Sample DM ",
//         "xna":"Sample.fl.2",
//         "simbility":"123-45-6789"
//     }
// ];
