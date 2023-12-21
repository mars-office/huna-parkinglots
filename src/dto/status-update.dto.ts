export interface StatusUpdateDto {
  signal?: number;
  version?: string;
  freeheap?: number;
  cpufreq?: number;
  id: string;
  uptimemillis?: number;
  localtime?: number;
  modemimei?: string;
  simserial?: string;
  modemvlt?: number;
}