import AuditLog from '../models/AuditLog.js';

export const auditLog = (entityType) => {
    return async (req, res, next) => {
        // We want to capture the old state and new state.
        // For a generic middleware, we'll capture the request body as the 'change'
        // and let the controller handle complex diffs if needed.
        
        // Wait for the request to finish to ensure it was successful
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Only log successful modifications
                if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
                    try {
                        const entityId = req.params.id || res.locals.createdEntityId || 'UNKNOWN';
                        
                        await AuditLog.create({
                            action: req.method,
                            entityType,
                            entityId,
                            actorId: req.user?._id,
                            actorRole: req.user?.role,
                            changes: req.body, // The payload sent
                            ipAddress: req.ip,
                            userAgent: req.get('User-Agent')
                        });
                    } catch (error) {
                        console.error('Audit Log Error:', error);
                    }
                }
            }
        });

        next();
    };
};
