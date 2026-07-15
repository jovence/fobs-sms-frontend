import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quote-escapes embedded quotes", () => {
    expect(toCsv(["A"], [['he said "hi"']])).toContain('"he said ""hi"""');
  });

  it("neutralizes spreadsheet formula injection", () => {
    const csv = toCsv(
      ["v"],
      [["=1+1"], ["+cmd"], ["-2+3"], ["@SUM(A1)"], ["safe value"]],
    );
    expect(csv).toContain(`"'=1+1"`);
    expect(csv).toContain(`"'+cmd"`);
    expect(csv).toContain(`"'-2+3"`);
    expect(csv).toContain(`"'@SUM(A1)"`);
    // ordinary values are not prefixed
    expect(csv).toContain(`"safe value"`);
    expect(csv).not.toContain(`"'safe value"`);
  });

  it("renders a header row and CRLF-separates rows", () => {
    const csv = toCsv(["Name", "Age"], [["Amina", 12]]);
    expect(csv.split("\r\n")[0]).toBe('"Name","Age"');
    expect(csv.split("\r\n")[1]).toBe('"Amina","12"');
  });
});
