export interface EditContractor{
  CCOpsData: string,
  ResourceId: number,
  EventTypeID: number,
  ContractorResourceID: number,
  CCOpsID: number,
  Contr_ID: number,
  ServerTimeStamp?: Date | null,
  LoginUserEmail: string,
  PageName: string,
  EventName: string,
  LastPageVisited: string,
  isInternal: boolean,
  EventDataFlag: boolean
}