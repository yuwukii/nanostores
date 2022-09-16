import { assertEquals } from "https://deno.land/std@0.92.0/testing/asserts.ts";
import { Store } from "../src/bucket.ts";

Deno.test("StorageBucket", async (test) => {
    const bucket = new Store({
        stdTTL: 1000,
        checkperiod: 1000,
        maxKeys: 10,
    });

    await test.step("set", () => {
        bucket.set("test", "test");
        assertEquals(bucket.get("test"), "test");
    });

    await test.step("get", () => {
        assertEquals(bucket.get("test"), "test");
    });

    await test.step("delete", () => {
        bucket.delete("test");
        assertEquals(bucket.get("test"), undefined);
    });

    // test the delete event
    await test.step("delete event", () => {
        bucket.on("delete", (key) => {
            assertEquals(key, "test");
        });
        bucket.delete("test");
    });
});