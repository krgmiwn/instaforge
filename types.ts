
export interface InstagramAccount {
  id: string;
  username: string;
  email: string;
  password: string;
  cookies: string;
  fullName: string;
  bio: string;
  createdAt: string;
  status: 'active' | 'pending' | 'flagged';
  proxy: string;
}

export interface SystemConfig {
  backendUrl: string;
  useProductionNode: boolean;
  proxyIp: string;
}

export type CreationStep = 'IDLE' | 'GENERATING' | 'CONNECTING' | 'SUBMITTING' | 'AWAITING_OTP' | 'VERIFYING' | 'SUCCESS' | 'ERROR';

export interface CreationLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'ai' | 'critical';
}
