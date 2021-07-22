import { InputDescriptor } from "@sphereon/pe-models";

export interface SubmissionMarked {
    inputDescriptor: InputDescriptor,
    group?: Array<String>,
    inputCandidate: any
}