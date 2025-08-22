exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ error: 'No autorizado' });
      }
      next();
    } catch (err) {
      return res.status(403).json({ error: 'No autorizado' });
    }
  };
};


