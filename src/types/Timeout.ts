import {
    TTaskOnDoneCallback,
    TTaskOnErrorCallback,
    TTaskProcess,
} from "./Task";

interface ITimeoutNoTime<Result, Err extends Error, Params extends object> {
    type?: string;
    params?: Params;
    isInform?: boolean;
    onDone?: TTaskOnDoneCallback<Result, Err, Params>;
    onError?: TTaskOnErrorCallback<Result, Err, Params>;
}

interface ITimeoutParamsPlannedTime<
    Result,
    Err extends Error,
    Params extends object
> extends ITimeoutNoTime<Result, Err, Params> {
    plannedTime: Date | number;
    source: TTaskProcess<Result, Err, Params>;
}

interface ITimeoutParamsCron<Result, Err extends Error, Params extends object>
    extends ITimeoutNoTime<Result, Err, Params> {
    cron: string;
    source: TTaskProcess<Result, Err, Params>;
}

type TTimeoutParams<Result, Err extends Error, Params extends object> =
    | ITimeoutParamsPlannedTime<Result, Err, Params>
    | ITimeoutParamsCron<Result, Err, Params>;

export {
    ITimeoutNoTime,
    ITimeoutParamsPlannedTime,
    ITimeoutParamsCron,
    TTimeoutParams,
};
