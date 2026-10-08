import { TaskPriority } from './runtime/types';
import { tryEvaluateMathExpression } from './storageChatHandler';
export type {
  FailureCategory,
  MethodExclusivity,
  ExecutionAttempt,
  AdaptiveFallbackPolicy,
  AdaptiveExecutionResult,
} from './adaptiveExecution';
export {
  recordAttempt,
  getGlobalAttemptHistory,
  getLatestAdaptiveResult,
  clearAttemptHistory,
  queryAttemptHistory,
  discoverFallbackMethods,
  verifyAttemptResult,
  generateAdaptiveReport,
  executeAdaptiveObjectiveSync,
} from './adaptiveExecution';

export type ActionExecutionType = 'single' | 'sequence' | 'parallel' | 'queue';
export type ActionDependencyCondition = 'on_success' | 'on_failure' | 'always';
export type ActionStatus = 'created' | 'pending' | 'executing' | 'completed' | 'failed' | 'skipped' | 'cancelled';
export type PlanStatus = 'created' | 'executing' | 'completed' | 'failed' | 'cancelled';

export interface ActionDependency {
  actionId: string;
  condition: ActionDependencyCondition;
}

export interface ActionNode {
  id: string;
  capabilityId: string;
  intent: string;
  target?: string;
  parameters?: Record<string, any>;
  description?: string;
  executionPolicy?: string;
  status?: ActionStatus;
  requiresConfirmation?: boolean;
  fallbackPolicy?: any;
  priority?: TaskPriority | any;
  dependencies?: ActionDependency[];
}

export interface ActionExecutionPlan {
  id: string;
  type: ActionExecutionType;
  name?: string;
  objective?: string;
  adaptivePolicy?: any;
  dependencies?: any;
  results?: any;
  errors?: any;
  attempts?: any[];
  executionPolicy?: string;
  status: PlanStatus;
  priority?: TaskPriority | any;
  actions: ActionNode[];
  createdAt: number;
}

export interface PlanExecutionResult {
  planId: string;
  status: PlanStatus;
  executed: boolean;
  targetScreen?: any;
  plan?: ActionExecutionPlan;
  attempts?: any[];
  completedActionIds: string[];
  failedActionIds: string[];
  skippedActionIds: string[];
  summary: string;
  results?: Record<string, any>;
}

let lastExecutionPlan: ActionExecutionPlan | null = null;

export function getLastExecutionPlan(): ActionExecutionPlan | null {
  return lastExecutionPlan;
}

export function setLastExecutionPlan(plan: ActionExecutionPlan | null): void {
  lastExecutionPlan = plan;
}

export function clearLastExecutionPlan(): void {
  lastExecutionPlan = null;
}

export function createSingleActionPlan(
  config: {
    id?: string;
    capabilityId: string;
    intent: string;
    target?: string;
    parameters?: Record<string, any>;
    description?: string;
    executionPolicy?: string;
    status?: ActionStatus;
  },
  executionPolicy?: string
): ActionExecutionPlan {
  const node: ActionNode = {
    id: config.id || 'action-1',
    capabilityId: config.capabilityId,
    intent: config.intent,
    target: config.target,
    parameters: config.parameters,
    description: config.description,
    executionPolicy: config.executionPolicy || executionPolicy,
    status: config.status || 'created',
  };
  return {
    id: `plan-${Date.now()}`,
    type: 'single',
    status: 'created',
    actions: [node],
    createdAt: Date.now(),
  };
}

export function createSequentialPlan(
  name: string,
  configs: Array<{
    id?: string;
    capabilityId: string;
    intent: string;
    target?: string;
    parameters?: Record<string, any>;
    description?: string;
    dependencies?: ActionDependency[];
  }>
): ActionExecutionPlan {
  const actions: ActionNode[] = [];
  for (let i = 0; i < configs.length; i++) {
    const c = configs[i];
    const id = c.id || `action-${i + 1}`;
    const deps = c.dependencies || (i > 0 ? [{ actionId: actions[i - 1].id, condition: 'on_success' as ActionDependencyCondition }] : []);
    actions.push({
      id,
      capabilityId: c.capabilityId,
      intent: c.intent,
      target: c.target,
      parameters: c.parameters,
      description: c.description,
      status: 'created',
      dependencies: deps,
    });
  }

  return {
    id: `plan-${Date.now()}`,
    name,
    type: 'sequence',
    status: 'created',
    actions,
    createdAt: Date.now(),
  };
}

export function createParallelPlan(
  name: string,
  configs: Array<{
    id?: string;
    capabilityId: string;
    intent: string;
    target?: string;
    parameters?: Record<string, any>;
    description?: string;
  }>
): ActionExecutionPlan {
  const actions: ActionNode[] = configs.map((c, i) => ({
    id: c.id || `action-${i + 1}`,
    capabilityId: c.capabilityId,
    intent: c.intent,
    target: c.target,
    parameters: c.parameters,
    description: c.description,
    status: 'created',
    dependencies: [],
  }));

  return {
    id: `plan-${Date.now()}`,
    name,
    type: 'parallel',
    status: 'created',
    actions,
    createdAt: Date.now(),
  };
}

export function createQueuedPlan(
  name: string,
  configs: Array<{
    id?: string;
    capabilityId: string;
    intent: string;
    target?: string;
    parameters?: Record<string, any>;
    description?: string;
  }>
): ActionExecutionPlan {
  const actions: ActionNode[] = configs.map((c, i) => ({
    id: c.id || `action-${i + 1}`,
    capabilityId: c.capabilityId,
    intent: c.intent,
    target: c.target,
    parameters: c.parameters,
    description: c.description,
    status: 'created',
  }));

  return {
    id: `plan-${Date.now()}`,
    name,
    type: 'queue',
    status: 'created',
    actions,
    createdAt: Date.now(),
  };
}

export function reorderPlanActions(
  plan: ActionExecutionPlan,
  actionId: string,
  newIndex: number
): void {
  const idx = plan.actions.findIndex((a) => a.id === actionId);
  if (idx === -1) return;
  const [removed] = plan.actions.splice(idx, 1);
  plan.actions.splice(newIndex, 0, removed);

  if (plan.type === 'sequence') {
    for (let i = 0; i < plan.actions.length; i++) {
      if (i === 0) {
        plan.actions[i].dependencies = [];
      } else {
        plan.actions[i].dependencies = [
          { actionId: plan.actions[i - 1].id, condition: 'on_success' },
        ];
      }
    }
  }
}

export function setPlanPriority(plan: ActionExecutionPlan, priority: TaskPriority | any): void {
  plan.priority = priority;
  for (const a of plan.actions) {
    a.priority = priority;
  }
}

export function cancelPlan(plan: ActionExecutionPlan, reason?: string): void {
  plan.status = 'cancelled';
  for (const a of plan.actions) {
    a.status = 'cancelled';
  }
}

export function createRetryPlan(failedPlan: ActionExecutionPlan): ActionExecutionPlan | null {
  const failedActions = failedPlan.actions.filter((a) => a.status === 'failed');
  if (failedActions.length === 0) return null;

  const newActions: ActionNode[] = failedActions.map((a) => ({
    ...a,
    id: `retry_${a.id}`,
    status: 'created' as ActionStatus,
    dependencies: [],
  }));

  return {
    id: `retry-plan-${Date.now()}`,
    name: `Retry: ${failedPlan.name || failedPlan.id}`,
    type: failedPlan.type,
    status: 'created',
    actions: newActions,
    createdAt: Date.now(),
  };
}

export function evaluateActionDependencies(
  action: ActionNode,
  completedActionIds: string[],
  failedActionIds: string[]
): boolean {
  if (!action.dependencies || action.dependencies.length === 0) {
    return true;
  }

  for (const dep of action.dependencies) {
    const isCompleted = completedActionIds.includes(dep.actionId);
    const isFailed = failedActionIds.includes(dep.actionId);

    if (dep.condition === 'on_success') {
      if (!isCompleted) return false;
    } else if (dep.condition === 'always') {
      if (!isCompleted && !isFailed) return false;
    } else if (dep.condition === 'on_failure') {
      if (!isFailed) return false;
    }
  }

  return true;
}

export function executeActionNodeDirect(
  action: ActionNode,
  context: { currentScreen?: any; navigateTo?: (screen: any, options?: any) => void }
): { success: boolean; resultSummary?: string; error?: string } {
  action.status = 'executing';

  if (action.capabilityId === 'math_calculator' || action.intent === 'calculate') {
    const expr = (action.parameters?.expression || action.target || '').trim();
    const mathRes = tryEvaluateMathExpression(expr);
    if (mathRes) {
      action.status = 'completed';
      return { success: true, resultSummary: mathRes };
    } else {
      action.status = 'failed';
      return { success: false, error: `Invalid calculation expression: ${expr}` };
    }
  }

  if (action.capabilityId === 'workspace_navigation' || action.intent === 'open') {
    const target = action.target;
    if (target && context.navigateTo) {
      context.navigateTo(target, action.parameters);
      action.status = 'completed';
      return { success: true, resultSummary: `Navigated to ${target}` };
    }
    action.status = 'failed';
    return { success: false, error: `No destination provided` };
  }

  action.status = 'completed';
  return { success: true, resultSummary: `Action ${action.id} completed` };
}

export function executeActionPlanSync(
  plan: ActionExecutionPlan,
  context: { currentScreen?: any; navigateTo?: (screen: any, options?: any) => void; settingsHandlers?: any; storageHandlers?: any }
): PlanExecutionResult {
  setLastExecutionPlan(plan);

  if (plan.type === 'queue') {
    plan.status = 'executing';
    return {
      planId: plan.id,
      status: 'executing',
      executed: true,
      plan,
      completedActionIds: [],
      failedActionIds: [],
      skippedActionIds: [],
      summary: `Queued ${plan.actions.length} operations for background execution`,
    };
  }

  plan.status = 'executing';
  const completedActionIds: string[] = [];
  const failedActionIds: string[] = [];
  const skippedActionIds: string[] = [];
  const summaries: string[] = [];

  for (const action of plan.actions) {
    const canRun = evaluateActionDependencies(action, completedActionIds, failedActionIds);
    if (!canRun) {
      action.status = 'skipped';
      skippedActionIds.push(action.id);
      summaries.push(`Skipped ${action.description || action.id}`);
      continue;
    }

    const exec = executeActionNodeDirect(action, context);
    if (exec.success) {
      completedActionIds.push(action.id);
      if (exec.resultSummary) summaries.push(exec.resultSummary);
    } else {
      failedActionIds.push(action.id);
      if (exec.error) summaries.push(exec.error);
    }
  }

  const overallStatus: PlanStatus =
    failedActionIds.length > 0
      ? 'failed'
      : completedActionIds.length > 0
      ? 'completed'
      : 'failed';

  plan.status = overallStatus;

  return {
    planId: plan.id,
    status: overallStatus,
    executed: completedActionIds.length > 0 || failedActionIds.length > 0,
    plan,
    completedActionIds,
    failedActionIds,
    skippedActionIds,
    summary: summaries.join(' | ') || `Plan ${overallStatus}`,
  };
}

export function executeActionPlan(
  plan: ActionExecutionPlan,
  context: { currentScreen?: any; navigateTo?: (screen: any, options?: any) => void }
): Promise<PlanExecutionResult> {
  return Promise.resolve(executeActionPlanSync(plan, context));
}

export function resolveActionPlanFromInput(input: string, currentScreen?: any): ActionExecutionPlan | null {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // 1. Queued instruction
  if (lower.startsWith('queue ')) {
    const rest = trimmed.slice(6).trim();
    const parts = rest.split(/,\s*|\s+and\s+/i);
    const configs = parts.map((p) => parseSingleStep(p)).filter(Boolean) as any[];
    if (configs.length > 0) {
      return createQueuedPlan(input, configs);
    }
  }

  // 2. Conditional: "even if it fails"
  if (lower.includes('even if it fails')) {
    const parts = lower.split(/,\s*then\s+|\s+then\s+/i);
    if (parts.length >= 2) {
      const step1 = parseSingleStep(parts[0]);
      const step2 = parseSingleStep(parts[1].replace(/even if it fails/i, '').trim());
      if (step1 && step2) {
        step1.id = 'step-1';
        step2.id = 'step-2';
        step2.dependencies = [{ actionId: 'step-1', condition: 'always' }];
        return createSequentialPlan(input, [step1, step2]);
      }
    }
  }

  // 3. Sequential: "then" or ", then"
  if (lower.includes(' then ') || lower.includes(', then')) {
    const parts = trimmed.split(/,\s*then\s+|\s+then\s+/i);
    const configs = parts.map((p) => parseSingleStep(p)).filter(Boolean) as any[];
    if (configs.length >= 2) {
      return createSequentialPlan(input, configs);
    }
  }

  // 4. Parallel: "calculate X and open Y" or "X and Y"
  if (lower.includes(' and ')) {
    const parts = trimmed.split(/\s+and\s+/i);
    const configs = parts.map((p) => parseSingleStep(p)).filter(Boolean) as any[];
    if (configs.length >= 2) {
      return createParallelPlan(input, configs);
    }
  }

  return null;
}

function parseSingleStep(stepStr: string): {
  id?: string;
  capabilityId: string;
  intent: string;
  target?: string;
  parameters?: Record<string, any>;
  description?: string;
  dependencies?: ActionDependency[];
} | null {
  let s = stepStr.trim().replace(/^run\s+/i, '');

  if (/^(?:open|go to|navigate to)\s+/i.test(s)) {
    const target = s.replace(/^(?:open|go to|navigate to)\s+/i, '').trim();
    return {
      capabilityId: 'workspace_navigation',
      intent: 'open',
      target,
      description: `Open ${target}`,
    };
  }

  if (/^calculate\s+/i.test(s)) {
    const expr = s.replace(/^calculate\s+/i, '').trim();
    return {
      capabilityId: 'math_calculator',
      intent: 'calculate',
      target: expr,
      parameters: { expression: expr },
      description: `Calculate ${expr}`,
    };
  }

  return null;
}
