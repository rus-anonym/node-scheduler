import {
    TTaskOnDoneCallback,
    TTaskOnErrorCallback,
    TTaskProcess,
} from "./Task";

interface IIntervalNoTime<Result, Err extends Error, Params extends object> {
    type?: string;
    params?: Params;
    intervalTriggers?: number;
    isInform?: boolean;
    isNextExecutionAfterDone?: boolean;
    onDone?: TTaskOnDoneCallback<Result, Err, Params>;
    onError?: TTaskOnErrorCallback<Result, Err, Params>;
}

interface IIntervalParamsPlannedTime<
    Result,
    Err extends Error,
    Params extends object
> extends IIntervalNoTime<Result, Err, Params> {
    plannedTime: Date | number;
    source: TTaskProcess<Result, Err, Params>;
}

interface IIntervalParamsCron<Result, Err extends Error, Params extends object>
    extends IIntervalNoTime<Result, Err, Params> {
    cron: string;
    source: TTaskProcess<Result, Err, Params>;
}

interface IIntervalParamsIntervalTimer<
    Result,
    Err extends Error,
    Params extends object
> extends IIntervalNoTime<Result, Err, Params> {
    intervalTimer: number;
    source: TTaskProcess<Result, Err, Params>;
}

type TIntervalParams<Result, Err extends Error, Params extends object> =
    | IIntervalParamsPlannedTime<Result, Err, Params>
    | IIntervalParamsCron<Result, Err, Params>
    | IIntervalParamsIntervalTimer<Result, Err, Params>;

export {
    IIntervalNoTime,
    IIntervalParamsPlannedTime,
    IIntervalParamsCron,
    IIntervalParamsIntervalTimer,
    TIntervalParams,
};
