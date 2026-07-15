/** Platform-wide analytics fixtures for the SuperAdmin dashboard. */

export const platformTotals = {
  schools: 148,
  owners: 132,
  teachers: 2140,
  students: 41280,
  parents: 18640,
};

export const subscriptionBreakdown = { free: 71, basic: 54, pro: 23 };

/** XAF/year prices — mirrors the backend pricing. */
export const tierPrices = { free: 0, basic: 200000, pro: 250000 };

export const estimatedRevenue =
  subscriptionBreakdown.basic * tierPrices.basic +
  subscriptionBreakdown.pro * tierPrices.pro;

export const usersByRole = [
  { role: "owner", count: 132 },
  { role: "teacher", count: 2140 },
  { role: "parent", count: 18640 },
  { role: "admin", count: 6 },
];

export interface GrowthPoint {
  month: string;
  schools: number;
  users: number;
}

export const platformGrowth: GrowthPoint[] = [
  { month: "Apr", schools: 118, users: 15200 },
  { month: "May", schools: 122, users: 16400 },
  { month: "Jun", schools: 127, users: 17900 },
  { month: "Jul", schools: 131, users: 18800 },
  { month: "Aug", schools: 133, users: 19500 },
  { month: "Sep", schools: 138, users: 20900 },
  { month: "Oct", schools: 141, users: 21600 },
  { month: "Nov", schools: 143, users: 22400 },
  { month: "Dec", schools: 144, users: 22900 },
  { month: "Jan", schools: 146, users: 23600 },
  { month: "Feb", schools: 147, users: 24100 },
  { month: "Mar", schools: 148, users: 24800 },
];

export const topSchools = [
  { name: "Government Bilingual High School Molyko", acronym: "GBHS", students: 1284, tier: "basic" as const },
  { name: "Sacred Heart College Mankon", acronym: "SHC", students: 1160, tier: "pro" as const },
  { name: "Lycée Bilingue de Deido", acronym: "LBD", students: 1044, tier: "basic" as const },
  { name: "Presbyterian Secondary School", acronym: "PSS", students: 980, tier: "pro" as const },
  { name: "Collège Bilingue La Semence", acronym: "CBLS", students: 872, tier: "free" as const },
];

export const platformSpark = {
  schools: [118, 122, 127, 131, 133, 138, 141, 143, 148],
  students: [15200, 17900, 18800, 20900, 21600, 22900, 23600, 24800, 41280],
  revenue: [8, 9, 10, 11, 12, 13, 15, 16, 17],
};
