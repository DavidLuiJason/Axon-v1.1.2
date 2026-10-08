export enum TaskPriority {
  CRITICAL = 'critical',
  INTERACTIVE = 'interactive',
  NORMAL = 'normal',
  NORMAL_BACKGROUND = 'normal_background',
  LOW = 'low',
  BACKGROUND = 'background',
}

export type PriorityLevel = TaskPriority;
