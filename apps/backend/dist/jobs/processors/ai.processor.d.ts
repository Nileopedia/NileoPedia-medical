import { AiGenerationJob, PipelineError, MetadataResponse } from '../types';
export declare function processAiGeneration(job: AiGenerationJob): Promise<PipelineError | {
    success: boolean;
    responseId: string;
    metadata: MetadataResponse;
}>;
//# sourceMappingURL=ai.processor.d.ts.map