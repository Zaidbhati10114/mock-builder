import { Id } from '../convex/_generated/dataModel';
interface projectType {
    _id: Id<"projects">,
    projectName: string,
    _creationTime: number
}

interface ResourceType {
    _id: Id<"resources">;
    creationTime: number;
    projectId: string;
    userId: Id<"users">;
    resourceName: string;
    data: any[];
    live: boolean;
}

export { projectType, resourceType }