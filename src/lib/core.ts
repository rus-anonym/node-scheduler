import manager from "./manager";
import SchedulerEventsEmitter from "./events";

import { ISchedulerConfig, TSchedulerMode } from "../types/scheduler";

class SchedulerConfig {
    private _config: ISchedulerConfig = {
        mode: "not_work",
        interval: null,
        intervalMS: 1000,
    };

    /**
     * Get current scheduler mode
     * @returns {TSchedulerMode}
     */
    public get mode(): TSchedulerMode {
        return this._config.mode;
    }

    /**
     * Get scheduler interval in ms
     * @returns {TSchedulerMode}
     */
    public get interval(): number {
        return this._config.intervalMS;
    }

    /**
     * Sets the scheduler to run with Timeout
     *
     * In this mode, all tasks have their own setTimeout
     */
    public useTimeouts(): void {
        this._clearInterval();
        manager.execute((task) => void task.useTimeout());
        this._config.mode = "timeout";
    }

    /**
     * Sets the scheduler to run with Interval
     *
     * In this mode all tasks are regulated only by one setInterval
     *
     * @param {number} ms - Number of milliseconds in which tasks will be checked
     */
    public useInterval(ms: number = this._config.intervalMS): void {
        this._config.mode = "interval";
        this._config.intervalMS = ms;
        this._config.interval = setInterval(
            manager.executeOutdatedTasks.bind(manager),
            ms
        );
    }

    private _clearInterval(): void {
        if (this._config.interval) {
            clearInterval(this._config.interval);
        }
    }
}

class Scheduler {
    public config = new SchedulerConfig();
    public events = new SchedulerEventsEmitter();
}

export default new Scheduler();
