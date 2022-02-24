
export interface QuestionnariresPageModel {
    PAGEJSON?: QuestionnariresDataModel,
    DBJSON?: QuestionnariresDataModel,
    ContractorJSON?: QuestionnariresDataModel,
    ContractorNumber?: number
}
export interface QuestionnariresModel {
    QuestionTypeNumber?: number,
    QuestionTypeName?: string,
    QuestionAnswer?: string | boolean,
    visualCue?: boolean,
    IsQuestionAnswerDisable?: boolean
}
export interface QuestionnariresDataModel {
    ContractorQuestionnaire?: any,
    ContractorNumber?: number
    IsToggleValueDisable?: boolean
    ParentContractorQuestions?: QuestionnariresModel[],
    ChildContractorQuestions?: QuestionnariresModel[]
}

export interface QuestionnariresDBDataModel {
    ContractorNumber?: number
    ParentContractorQuestions: QuestionnariresDBModel[],
    ChildContractorQuestions: QuestionnariresDBModel[]
}

export interface QuestionnariresDBModel {
    QuestionTypeNumber: number,
    QuestionTypeName: string,
    QuestionAnswer: string | boolean,
}
