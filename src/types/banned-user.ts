export type BannedUser = {
  auditLogId: string;
  executor: {
    id: string;
    username: string;
  };
  target: {
    id: string;
    username: string;
  };
  bannedAt: Date;
};
