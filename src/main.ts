import Task from "./lib/Task";
import Interval from "./lib/Interval";
import Timeout from "./lib/Timeout";

import scheduler from "./lib/core";

scheduler.config.useInterval();

export { Task, Interval, Timeout };

export default scheduler;
