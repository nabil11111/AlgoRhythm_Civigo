import fs from "node:fs";
import path from "node:path";

describe("server utils module", () => {
  const filePath = path.join(process.cwd(), "apps/civigo-gov/src/utils/supabase/server.ts");

  it("does not contain 'use server' directive", () => {
    const contents = fs.readFileSync(filePath, "utf8");
    expect(contents.includes("use server")).toBe(false);
  });

  it("imports without throwing", async () => {
    const mod = await import("@/utils/supabase/server");
    expect(typeof mod.getServerClient).toBe("function");
  });
});


