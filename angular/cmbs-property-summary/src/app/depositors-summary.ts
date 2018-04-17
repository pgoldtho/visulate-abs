export class DepositorsSummary {
  depositor: Array<{
    name: string;
    cik: string;
    issuer: Array<{
      name: string;
      cik: string;
      property_count: number;
      average_secvalue: number;
      average_secnoi: number;
      sec_caprate: number;
      href: string;
    }>;
  }>;
  links: {
    self: string;
  };
}
