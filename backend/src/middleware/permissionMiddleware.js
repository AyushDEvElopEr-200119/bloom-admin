const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Super Admin gets full access
    if (req.user.role.name === "Super Admin") {
      return next();
    }

    const userPermissions = req.user.role.permissions.map(
      (permission) => permission.name
    );

    const hasPermission = requiredPermissions.every(
      (permission) => userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

module.exports = authorize;