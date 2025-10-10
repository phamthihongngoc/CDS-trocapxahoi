export const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized - No user ID provided' });
  }
  
  if (!userRole) {
    return res.status(401).json({ error: 'Unauthorized - No role provided' });
  }
  
  req.userId = userId;
  req.userRole = userRole;
  next();
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - No user ID provided' });
    }
    
    if (!userRole) {
      return res.status(401).json({ error: 'Unauthorized - No role provided' });
    }
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Forbidden - Insufficient permissions',
        required: allowedRoles,
        current: userRole
      });
    }
    
    req.userId = userId;
    req.userRole = userRole;
    next();
  };
};

export const requireOfficerOrAdmin = requireRole('OFFICER', 'ADMIN');
export const requireAdmin = requireRole('ADMIN');
