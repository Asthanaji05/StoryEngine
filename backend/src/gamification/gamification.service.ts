import { Injectable, Inject } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../database/database.module";

@Injectable()
export class GamificationService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async awardXp(userId: string, amount: number, reason: string) {
    // 1. Get current stats
    const { data: profile } = await this.supabase
      .from("profiles")
      .select("xp, level")
      .eq("id", userId)
      .single();

    if (!profile) return; // Should likely exist if authenticated

    const currentXp = profile.xp || 0;
    const currentLevel = profile.level || 1;
    const newXp = currentXp + amount;

    // 2. Calculate Level Up (Simple quadratic curve: Level^2 * 100)
    // Level 1: 0-100
    // Level 2: 100-400
    // Level 3: 400-900
    let newLevel = currentLevel;
    const nextLevelThreshold = (currentLevel + 1) * (currentLevel + 1) * 100;

    if (newXp >= nextLevelThreshold) {
      newLevel++;
      // Could insert a "Level Up" notification here
    }

    // 3. Update Profile
    await this.supabase
      .from("profiles")
      .update({ xp: newXp, level: newLevel })
      .eq("id", userId);

    // 4. Log to Ledger (Fire and forget, don't await strictly if not critical)
    await this.supabase.from("xp_ledger").insert({
      user_id: userId,
      amount,
      reason,
    });

    return { newXp, newLevel, leveledUp: newLevel > currentLevel };
  }
}
