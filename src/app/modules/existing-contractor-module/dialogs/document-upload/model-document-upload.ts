export interface DocumentType {
    ContractorDocumentTypeID: number;
    ContractorDocumentTypeTitle: string;
}

export interface FilesCount {
    Count: number;
    RepositoryName: string;
}

export interface ListFiles {
    DocId: number;
    DocName: string;
    UploadedBy: string;
    UploadedDate: string;
}