export interface LangVeteranInfo {
    LangInfo: Languages[],
    VeteranInfo: Veteran[]
}

export interface Languages {
AfterBusinessHoursMultiLanguageFlag: boolean
AfterBusinessHoursMultiLanguageID: number
AfterBusinessHoursMultiLanguageTypeID: number
Contr_ID: number
DuringBusinessHoursMultiLanguageFlag: boolean
DuringBusinessHoursMultiLanguageID: number
DuringBusinessHoursMultiLanguageTypeID: number
LanguageName: string
WorldLanguageID: number
}

export interface Veteran{
 AffidavitDate: Date | null
AffidavitFlg: boolean
CONTR_ID: number
ContractorVeteranAffidavitID: number
ContractorVeteranPledgeID: number
CurrentVeteranCount: number
DisabledOwnedBusinessFlag: string
DisabledOwnedBusinessHammerHower: string
MinorityOwnedBusinessFlag: string
MinorityOwnedBusinessHammerHower: string
VeteranOwnedBusinessFlag: string
VeteranOwnedBusinessHammerHower: string
VeteranPledgeCount: number
VeteranPledgeDate: string
WomanOwnedBusinessFlag: string
WomanOwnedBusinessHammerHower: string
}

export interface ApprovalVeteranData {
        MinorityOwnedBusinessFlag?: number,
        WomanOwnedBusinessFlag?: number,
        VeteranOwnedBusinessFlag?: number,
        DisabledOwnedBusinessFlag?: number,
        VeteranPledgeDate?: string,
        VeteranPledgeCount?: string | number,
        NonVeteranFlag?: number | boolean,
        WorldLanguage?: ApprovalWorldLanguage[],
        IsMinorityOwnedBusinessFlagDisable?: boolean,
        IsDisabledOwnedBusinessFlagDisable?: boolean,
        IsVeteranOwnedBusinessFlagDisable?: boolean,
        IsWomanOwnedBusinessFlagDisable?: boolean,
        IsRowDisable?: boolean
    }
 export interface ApprovalWorldLanguage{
        WorldLanguageNumber: number,
        MultiLanguageNumber: number,
        MultiLanguageTypeNumber: number,
        MultiLanguageAnswer: number | boolean,
        LanguageName: string,
        IsRowDisable?: boolean
 }

export interface VisualCue {
    minorityOwned: boolean,
    womanOwned: boolean,
    veteranOwned: boolean,
    disableOwned: boolean,
    newEmpNum: boolean,
    nonVeteranFlg: boolean,
    pledgeDate: boolean,

    veternPledgeDisable? : boolean,
    minorityOwnedDisable?: boolean,
    womanOwnedDisable?: boolean,
    veteranOwnedDisable?: boolean,
    disableOwnedDisable?: boolean,
}