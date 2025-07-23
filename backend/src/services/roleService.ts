export enum UserRole {
  ADMIN = 'admin',
  PREMIUM = 'premium',
  USER = 'user',
  GUEST = 'guest'
}

export enum Permission {
  // 文档权限
  UPLOAD_DOCUMENT = 'upload_document',
  DELETE_DOCUMENT = 'delete_document',
  VIEW_ALL_DOCUMENTS = 'view_all_documents',
  
  // AI功能权限
  USE_AI_SUMMARIZE = 'use_ai_summarize',
  USE_AI_QA = 'use_ai_qa',
  USE_AI_KEYWORDS = 'use_ai_keywords',
  
  // 搜索权限
  USE_VECTOR_SEARCH = 'use_vector_search',
  USE_ARXIV_SEARCH = 'use_arxiv_search',
  USE_SEMANTIC_SEARCH = 'use_semantic_search',
  
  // 批量处理权限
  USE_BATCH_PROCESSING = 'use_batch_processing',
  
  // 管理权限
  MANAGE_USERS = 'manage_users',
  VIEW_SYSTEM_STATS = 'view_system_stats',
  MANAGE_SYSTEM = 'manage_system'
}

// 角色权限映射
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // 管理员拥有所有权限
    ...Object.values(Permission)
  ],
  
  [UserRole.PREMIUM]: [
    Permission.UPLOAD_DOCUMENT,
    Permission.DELETE_DOCUMENT,
    Permission.USE_AI_SUMMARIZE,
    Permission.USE_AI_QA,
    Permission.USE_AI_KEYWORDS,
    Permission.USE_VECTOR_SEARCH,
    Permission.USE_ARXIV_SEARCH,
    Permission.USE_SEMANTIC_SEARCH,
    Permission.USE_BATCH_PROCESSING,
    Permission.VIEW_SYSTEM_STATS
  ],
  
  [UserRole.USER]: [
    Permission.UPLOAD_DOCUMENT,
    Permission.DELETE_DOCUMENT,
    Permission.USE_AI_SUMMARIZE,
    Permission.USE_AI_QA,
    Permission.USE_AI_KEYWORDS,
    Permission.USE_VECTOR_SEARCH,
    Permission.USE_ARXIV_SEARCH,
    Permission.USE_SEMANTIC_SEARCH
  ],
  
  [UserRole.GUEST]: [
    Permission.USE_ARXIV_SEARCH,
    Permission.USE_SEMANTIC_SEARCH
  ]
};

// 使用限制
interface UsageLimit {
  daily_uploads: number;
  daily_ai_requests: number;
  max_document_size: number; // MB
  max_documents: number;
  batch_processing: boolean;
}

const ROLE_LIMITS: Record<UserRole, UsageLimit> = {
  [UserRole.ADMIN]: {
    daily_uploads: -1, // 无限制
    daily_ai_requests: -1,
    max_document_size: -1,
    max_documents: -1,
    batch_processing: true
  },
  
  [UserRole.PREMIUM]: {
    daily_uploads: 100,
    daily_ai_requests: 1000,
    max_document_size: 100,
    max_documents: 1000,
    batch_processing: true
  },
  
  [UserRole.USER]: {
    daily_uploads: 10,
    daily_ai_requests: 100,
    max_document_size: 50,
    max_documents: 100,
    batch_processing: false
  },
  
  [UserRole.GUEST]: {
    daily_uploads: 0,
    daily_ai_requests: 10,
    max_document_size: 0,
    max_documents: 0,
    batch_processing: false
  }
};

class RoleService {
  // 检查用户是否有特定权限
  hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }

  // 获取用户所有权限
  getUserPermissions(userRole: UserRole): Permission[] {
    return ROLE_PERMISSIONS[userRole] || [];
  }

  // 获取用户使用限制
  getUserLimits(userRole: UserRole): UsageLimit {
    return ROLE_LIMITS[userRole] || ROLE_LIMITS[UserRole.GUEST];
  }

  // 检查是否超出使用限制
  checkUsageLimit(userRole: UserRole, currentUsage: Partial<UsageLimit>): {
    allowed: boolean;
    exceeded: string[];
  } {
    const limits = this.getUserLimits(userRole);
    const exceeded: string[] = [];

    // 检查每日上传限制
    if (limits.daily_uploads !== -1 && (currentUsage.daily_uploads || 0) >= limits.daily_uploads) {
      exceeded.push('daily_uploads');
    }

    // 检查每日AI请求限制
    if (limits.daily_ai_requests !== -1 && (currentUsage.daily_ai_requests || 0) >= limits.daily_ai_requests) {
      exceeded.push('daily_ai_requests');
    }

    // 检查最大文档数限制
    if (limits.max_documents !== -1 && (currentUsage.max_documents || 0) >= limits.max_documents) {
      exceeded.push('max_documents');
    }

    return {
      allowed: exceeded.length === 0,
      exceeded
    };
  }

  // 获取角色显示名称
  getRoleDisplayName(role: UserRole): string {
    const names = {
      [UserRole.ADMIN]: '管理员',
      [UserRole.PREMIUM]: '高级用户',
      [UserRole.USER]: '普通用户',
      [UserRole.GUEST]: '访客'
    };
    return names[role] || '未知';
  }

  // 获取所有可用角色
  getAllRoles(): { value: UserRole; label: string; permissions: Permission[]; limits: UsageLimit }[] {
    return Object.values(UserRole).map(role => ({
      value: role,
      label: this.getRoleDisplayName(role),
      permissions: this.getUserPermissions(role),
      limits: this.getUserLimits(role)
    }));
  }
}

export const roleService = new RoleService();