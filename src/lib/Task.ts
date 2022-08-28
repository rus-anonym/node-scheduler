import {
    ITaskLogMetaInfo,
    ITaskMetaInfo,
    ITaskParams,
    ITaskServiceInfo,
    TTaskStatus,
    TTaskOnDoneCallback,
    TTaskOnErrorCallback,
    TTaskProcess,
} from "../types/Task";

import { performance } from "perf_hooks";
import cronParser from "cron-parser";

import scheduler from "./core";
import manager from "./manager";

class Task<
    Result = unknown,
    Err extends Error = Error,
    Params extends object = Record<string, unknown>
> {
    public readonly meta: ITaskMetaInfo<Params>;

    protected service: ITaskServiceInfo;
    protected readonly process: TTaskProcess<Result, Err, Params>;
    protected onDoneCallback?: TTaskOnDoneCallback<Result, Err, Params>;
    protected onErrorCallback?: TTaskOnErrorCallback<Result, Err, Params>;

    constructor(task: ITaskParams<Result, Err, Params>) {
        let { plannedTime = 0, intervalTimer = 0 } = task;
        const {
            type = "missing",
            params = {} as Params,
            intervalTriggers = Infinity,
            isInform = false,
            isInterval = false,
            isNextExecutionAfterDone = false,
            source,
            cron,
            onDone,
            onError,
        } = task;

        if (cron && plannedTime === 0) {
            try {
                const interval = cronParser.parseExpression(cron);
                plannedTime = Number(interval.next().toDate());
            } catch (error) {
                throw new Error("CRON expression is invalid");
            }
        }

        if (isInterval && plannedTime === 0 && intervalTimer > 0) {
            plannedTime = Number(new Date()) + intervalTimer;
        }

        if (
            !source ||
            (!isInterval && intervalTimer === 0 && plannedTime === 0) ||
            new Date(plannedTime).toString() === "Invalid Date"
        ) {
            throw new Error(
                "One of the required parameters is missing or incorrect"
            );
        }

        if (isInterval && intervalTimer === 0 && !cron) {
            intervalTimer = Number(plannedTime) - Date.now();
        }

        this.meta = {
            id: manager.generateID(),
            type,
            created: new Date(),
            params,
        };

        this.service = {
            nextExecute: Number(plannedTime),
            status: "await",
            cron,
            isInform,
            isInterval,
            interval: {
                time: intervalTimer,
                isNextExecutionAfterDone,
                isInfinity: isInterval && intervalTriggers === Infinity,
                remainingTriggers: intervalTriggers,
                triggeringQuantity: 0,
            },
        };

        this.process = source;
        this.onDoneCallback = onDone;
        this.onErrorCallback = onError;

        if (scheduler.config.mode === "timeout") {
            this.useTimeout();
        }

        const taskIndex = manager.list.findIndex(
            (x) => x.plannedTime >= this.plannedTime && x.id !== this.id
        );
        manager.insert(
            taskIndex === -1 ? manager.list.length : taskIndex,
            this as unknown as Task
        );
    }

    /**
     * ID used by the task to identify it
     */
    public get id(): string {
        return this.meta.id;
    }

    /**
     * Mark in milliseconds when the task is to be executed
     * @returns {number}
     */
    public get plannedTime(): number {
        return this.service.nextExecute;
    }

    /**
     * Mark in time when the task is to be executed in Date
     * @returns {Date}
     */
    public get plannedDate(): Date {
        return new Date(this.plannedTime);
    }

    /**
     * Current task status
     * @returns {TTaskStatus}
     */
    public get status(): TTaskStatus {
        return this.service.status;
    }

    /**
     * Deleting a task
     * @returns {void}
     */
    public destroy(): void {
        this.clearTimeout();
        const index = manager.list.indexOf(this as unknown as Task);
        manager.list.splice(index, 1);
        return;
    }

    /**
     * A method forcing the use of Timeout for a task
     */
    public useTimeout(): this {
        if (this.service.timeout === null) {
            this.service.timeout = setTimeout(
                () => void this.execute(false),
                this.plannedTime - Date.now()
            );
        }
        return this;
    }

    /**
     * Timeout cleansing Method
     */
    public clearTimeout(): this {
        if (this.service.timeout !== null) {
            clearTimeout(this.service.timeout);
        }
        return this;
    }

    /**
     * The function that sets the сallback function in case of successful execution of the task
     * @param  {TTaskOnDoneCallback<Result, Err, Params>} callback Callback function
     */
    public onDone(callback: TTaskOnDoneCallback<Result, Err, Params>): this {
        this.onDoneCallback = callback;
        return this;
    }

    /**
     * A function that sets up a callback function in case of an error during the execution of a task
     * @param {TTaskOnErrorCallback<Result, Err, Params>} callback Callback function
     */
    public onError(callback: TTaskOnErrorCallback<Result, Err, Params>): this {
        this.onErrorCallback = callback;
        return this;
    }

    /**
     * Forced task execution
     * @param {boolean} [returnResult=true] Whether to return the result of the execution
     */
    public async execute(returnResult: false): Promise<void>;
    public async execute(
        returnResult?: true
    ): Promise<
        | ({ response: Result } & ITaskLogMetaInfo<Result, Err, Params>)
        | ({ error: Err } & ITaskLogMetaInfo<Result, Err, Params>)
    >;
    public async execute(
        returnResult = true
    ): Promise<
        | void
        | ({ response: Result } & ITaskLogMetaInfo<Result, Err, Params>)
        | ({ error: Err } & ITaskLogMetaInfo<Result, Err, Params>)
    > {
        this.service.status = "process";
        const oldPlannedTime = this.service.nextExecute;

        if (
            this.service.isInterval &&
            !this.service.interval.isNextExecutionAfterDone
        ) {
            this._setNextExecuteTime();
        }

        let response: Result | undefined;
        let error: Err | undefined;
        let end: number;

        const start = performance.now();
        try {
            response = await this.process();
            end = performance.now();
        } catch (err) {
            end = performance.now();
            error = err as Err;
        } finally {
            this._intervalIteration();

            if (
                this.service.isInterval &&
                this.service.interval.remainingTriggers > 0 &&
                this.service.status === "process"
            ) {
                this.service.status = "await";
            } else {
                this.service.status = "done";
            }

            if (this.service.status === "done") {
                this.destroy();
            } else {
                if (scheduler.config.mode === "timeout") {
                    this.service.timeout = setTimeout(
                        () => void this.execute(false),
                        this.plannedTime - Date.now()
                    );
                } else {
                    const newTaskIndex = manager.list.findIndex(
                        (x) =>
                            x.plannedTime >= this.plannedTime &&
                            x.id !== this.id
                    );
                    manager.move(
                        manager.list.findIndex((x) => x.id === this.id),
                        newTaskIndex === -1 ? manager.list.length : newTaskIndex
                    );
                }
            }
        }

        if (
            !returnResult &&
            !this.service.isInform &&
            !this.onDoneCallback &&
            !this.onErrorCallback
        ) {
            return;
        }

        const extendsTaskMetaInfo: ITaskLogMetaInfo<Result, Err, Params> = {
            task: this,
            delay: Date.now() - oldPlannedTime,
            executionTime: end - start,
            nextExecute: new Date(this.plannedTime),
            ...this.meta,
        };

        if (error) {
            if (this.onErrorCallback) {
                this.onErrorCallback(error, extendsTaskMetaInfo);
            }

            if (this.service.isInform) {
                scheduler.events.emit("exception", error, extendsTaskMetaInfo);
            }

            return { error: error, ...extendsTaskMetaInfo };
        } else {
            if (this.onDoneCallback) {
                this.onDoneCallback(response as Result, extendsTaskMetaInfo);
            }

            if (this.service.isInform) {
                scheduler.events.emit(
                    "response",
                    response,
                    extendsTaskMetaInfo
                );
            }

            return { response: response as Result, ...extendsTaskMetaInfo };
        }
    }

    private _setNextExecuteTime(): void {
        if (this.service.cron) {
            try {
                const interval = cronParser.parseExpression(this.service.cron);
                this.service.nextExecute = Number(interval.next().toDate());
            } catch (error) {
                this.service.status = "done";
            }
        } else {
            this.service.nextExecute = Date.now() + this.service.interval.time;
        }
    }

    private _intervalIteration(): void {
        if (this.service.isInterval) {
            ++this.service.interval.triggeringQuantity;
            if (!this.service.interval.isInfinity) {
                --this.service.interval.remainingTriggers;
            }
            if (this.service.interval.isNextExecutionAfterDone) {
                this._setNextExecuteTime();
            }
        }
    }
}

export default Task;
