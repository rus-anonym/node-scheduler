import Task from "../lib/Task";

type TTaskStatus = "await" | "process" | "pause" | "done";

type TTaskProcess<Result, Err extends Error, Params extends object> = (
    this: Task<Result, Err, Params>
) => Result | Promise<Result>;
type TTaskOnDoneCallback<Result, Err extends Error, Params extends object> = (
    this: Task<Result, Err, Params>,
    response: Result,
    meta: ITaskLogMetaInfo<Result, Err, Params>
) => unknown;
type TTaskOnErrorCallback<Result, Err extends Error, Params extends object> = (
    this: Task<Result, Err, Params>,
    error: Err,
    meta: ITaskLogMetaInfo<Result, Err, Params>
) => unknown;

interface ITaskMetaInfo<Params> {
    readonly id: string;
    readonly type: string;
    readonly created: Date;
    readonly params: Params;
}

interface ITaskLogMetaInfo<Result, Err extends Error, Params extends object>
    extends ITaskMetaInfo<Params> {
    readonly nextExecute: Date;
    readonly executionTime: number;
    readonly delay: number;
    readonly task: Task<Result, Err, Params>;
}

interface ITaskParams<Result, Err extends Error, Params extends object> {
    type?: string;
    params?: Params;
    plannedTime?: Date | number;
    cron?: string;
    source: TTaskProcess<Result, Err, Params>;
    onDone?: TTaskOnDoneCallback<Result, Err, Params>;
    onError?: TTaskOnErrorCallback<Result, Err, Params>;
    intervalTimer?: number;
    intervalTriggers?: number;
    isInform?: boolean;
    isInterval?: boolean;
    isNextExecutionAfterDone?: boolean;
}

interface ITaskServiceInfo {
    nextExecute: number;
    status: TTaskStatus;
    isInform: boolean;
    isInterval: boolean;
    interval: {
        time: number;
        remainingTriggers: number;
        triggeringQuantity: number;
        isNextExecutionAfterDone: boolean;
        isInfinity: boolean;
    };
    cron?: string;
    timeout?: NodeJS.Timer;
}

export {
    ITaskMetaInfo,
    ITaskServiceInfo,
    TTaskProcess,
    TTaskOnDoneCallback,
    TTaskOnErrorCallback,
    ITaskParams,
    TTaskStatus,
    ITaskLogMetaInfo,
};
