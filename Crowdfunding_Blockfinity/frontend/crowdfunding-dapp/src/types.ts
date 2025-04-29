export interface Campaign {
  id: number;
  title: string;
  goal: string;
  deadline: Date;
  totalContributed: string;
  totalBackers: number;
  creator: string;
  isFunded: boolean;
  isRefunded: boolean;
  isCancelled: boolean;
  userContribution: string;
}
