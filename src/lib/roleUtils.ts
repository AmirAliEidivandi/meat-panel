/**
 * Check if user has admin roles
 * Admin roles are those that DON'T end with "_SELF"
 * Roles without "_SELF" suffix are for admins/employees
 */
export function isAdmin(roles: string[]): boolean {
	if (!roles || roles.length === 0) return false;

	// Check if user has any role that doesn't end with "_SELF"
	// Also exclude special roles like "uma_protection" and "CUSTOMER"
	return roles.some(role => {
		const roleUpper = role.toUpperCase();
		// Exclude special system roles
		if (
			roleUpper === 'UMA_PROTECTION' ||
			roleUpper === 'CUSTOMER' ||
			roleUpper.startsWith('$')
		) {
			return false;
		}
		// Admin roles don't end with "_SELF"
		return !roleUpper.endsWith('_SELF');
	});
}

/**
 * Check if user has customer roles
 * Customer roles are those that end with "_SELF" indicating self-service access
 */
export function isCustomer(roles: string[]): boolean {
	if (!roles || roles.length === 0) return false;

	// Check if user has any role ending with "_SELF"
	return roles.some(role => {
		const roleUpper = role.toUpperCase();
		return roleUpper.endsWith('_SELF');
	});
}

/**
 * Determine user panel type based on roles
 */
export function getUserPanelType(
	roles: string[],
): 'admin' | 'customer' | 'both' {
	const hasAdmin = isAdmin(roles);
	const hasCustomer = isCustomer(roles);

	if (hasAdmin && hasCustomer) {
		return 'both';
	}
	if (hasAdmin) {
		return 'admin';
	}
	if (hasCustomer) {
		return 'customer';
	}

	// Default to customer if no specific roles found
	return 'customer';
}
