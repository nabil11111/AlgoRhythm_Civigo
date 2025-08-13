import fs from "node:fs";
import path from "node:path";

describe("server utils module", () => {
  const filePath = path.join(process.cwd(), "src/utils/supabase/server.ts");

  it("does not contain 'use server' directive", async () => {
    const contents = fs.readFileSync(filePath, "utf8");
    // Allow presence of comments; ensure no top-level use server directive
    expect(/^[\s\S]*?"use server"/.test(contents)).toBe(false);
  });

  it("imports without throwing", async () => {
    const mod = await import("@/utils/supabase/server");
    expect(typeof mod.getServerClient).toBe("function");
  });
});
