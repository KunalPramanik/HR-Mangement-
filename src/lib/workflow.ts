import { IUser } from "@/models/User";
import { IApprovalStep } from "@/models/ApprovalRequest";

/**
 * Generates the required approval steps based on the requester and the type of work.
 */
export function generateApprovalSteps(requester: IUser, type: string, data?: any): IApprovalStep[] {
    const steps: IApprovalStep[] = [];

    // 1. Manager Approval (Common to most workflows for non-executives)
    // If the user has a manager, and isn't a Director/CXO themselves
    const isExecutive = ['director', 'vp', 'cxo', 'cho'].includes(requester.role);

    if (requester.managerId && !isExecutive) {
        steps.push({
            stepName: "Manager Approval",
            specificApproverId: requester.managerId,
            status: 'pending'
        });
    }

    // 2. Logic based on Type
    switch (type) {
        case 'leave':
            // Hierarchy Implementation as per User Request:
            // "cho/cxo/admin/hr/employee/inten taking any leave need to permisson assigner person"

            if (['cho', 'cxo', 'vp', 'admin', 'hr'].includes(requester.role)) {
                // High-level roles report to Director
                steps.push({
                    stepName: "Director Approval",
                    requiredRole: 'director',
                    status: 'pending'
                });
            } else {
                // Standard Employee/Intern: Manager (Added above) -> Then HR
                steps.push({
                    stepName: "HR Review",
                    requiredRole: 'hr',
                    status: 'pending'
                });
            }
            break;

        case 'profile_update':
        case 'general_update':
            // "all work do manager updates then approve by hr approve by admin"
            // This seems to be the "Standard Full Chain"

            // We already added Manager. Now add HR and Admin.
            steps.push({
                stepName: "HR Verification",
                requiredRole: 'hr',
                status: 'pending'
            });

            steps.push({
                stepName: "Admin Final Approval",
                requiredRole: 'admin',
                status: 'pending'
            });
            break;

        case 'major_update':
            // "Major fields directors"
            steps.push({
                stepName: "Director Approval",
                requiredRole: 'director',
                status: 'pending'
            });
            break;

        default:
            // Default fallback: HR
            steps.push({
                stepName: "HR Review",
                requiredRole: 'hr',
                status: 'pending'
            });
            break;
    }

    // Filter out duplicates or redundant steps if necessary
    return steps;
}
