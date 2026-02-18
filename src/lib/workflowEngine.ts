import { IUser } from "@/models/User";

export enum WorkflowStatus {
    DRAFT = 'Draft',
    SUBMITTED = 'Submitted',
    MANAGER_APPROVED = 'Manager Approved',
    DIRECTOR_APPROVED = 'Director Approved',
    CHO_APPROVED = 'CHO Approved',
    IMPLEMENTED = 'Implemented',
    REJECTED = 'Rejected'
}

export type ActionType = 'APPROVE' | 'REJECT' | 'ESCALATE' | 'SUBMIT';

export interface WorkflowState {
    currentInfo: any;
    meta: {
        submittedBy: string;
        submittedAt: Date;
        status: WorkflowStatus;
        history: {
            actorId: string;
            action: ActionType;
            comment?: string;
            timestamp: Date;
            fromStatus: WorkflowStatus;
            toStatus: WorkflowStatus;
        }[];
    }
}

/**
 * Determines the next available actions for a user on a specific record based on their role and the record's status.
 */
export function getAvailableActions(user: IUser, record: WorkflowState): ActionType[] {
    const { status } = record.meta;
    const isOwner = record.meta.submittedBy === user.employeeId;
    const actions: ActionType[] = [];

    // 1. Owner Actions
    if (isOwner && status === WorkflowStatus.DRAFT) {
        actions.push('SUBMIT');
    }

    // 2. Manager Actions
    if (user.role === 'manager' && status === WorkflowStatus.SUBMITTED) {
        // Only if it's their direct report - handled by caller usually, but logic here assumes context is valid
        actions.push('APPROVE', 'REJECT');
    }

    // 3. Director Actions
    if (user.position.includes('Director') && (status === WorkflowStatus.MANAGER_APPROVED || status === WorkflowStatus.SUBMITTED)) {
        // Directors can override or are next step
        actions.push('APPROVE', 'REJECT', 'ESCALATE');
    }

    // 4. CHO Actions
    if (user.role === 'cho' && (status === WorkflowStatus.DIRECTOR_APPROVED || status === WorkflowStatus.MANAGER_APPROVED)) {
        actions.push('APPROVE', 'REJECT');
    }

    return actions;
}

/**
 * Transitions the state based on action
 */
export function transitionWorkflow(state: WorkflowState, action: ActionType, actor: IUser, comment?: string): WorkflowState {
    const oldStatus = state.meta.status;
    let newStatus = oldStatus;

    switch (action) {
        case 'SUBMIT':
            newStatus = WorkflowStatus.SUBMITTED;
            break;
        case 'APPROVE':
            if (actor.role === 'manager') newStatus = WorkflowStatus.MANAGER_APPROVED;
            else if (actor.position.includes('Director')) newStatus = WorkflowStatus.DIRECTOR_APPROVED;
            else if (actor.role === 'cho') newStatus = WorkflowStatus.CHO_APPROVED; // Or Implemented depending on flow
            break;
        case 'REJECT':
            newStatus = WorkflowStatus.REJECTED;
            break;
        case 'ESCALATE':
            // Status implies pending higher authority
            // Could stay same or move to specific 'Escalated' state
            break;
    }

    state.meta.status = newStatus;
    state.meta.history.push({
        actorId: actor.employeeId,
        action,
        comment,
        timestamp: new Date(),
        fromStatus: oldStatus,
        toStatus: newStatus
    });

    return state;
}
