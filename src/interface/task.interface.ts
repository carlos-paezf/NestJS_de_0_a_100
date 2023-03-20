import { STATUS_TASK } from "src/constants";

export interface ITask {
    name: string;
    description: string;
    status: STATUS_TASK;
    responsableName: string;
}