"use client";

/** Editors for the knowledge base and both system prompts.
 *  Saves write to data/ files on the server and apply to the very next reply. */

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { fetchAgentConfig, saveAgentConfig } from "@/services/agentService";
import type { ConfigData } from "@/types";

export function SetupTab() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setConfig(await fetchAgentConfig());
    } catch {
      toast.error("Could not load configuration files");
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchAgentConfig()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch(() => toast.error("Could not load configuration files"));
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async (fields: Partial<ConfigData>, what: string) => {
    setSaving(true);
    try {
      await saveAgentConfig(fields);
      toast.success(`${what} saved — applies to the next reply`);
    } catch {
      toast.error(`Could not save ${what.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading files…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Edits here save to the <code>data/</code> files and apply to the{" "}
        <span className="font-medium text-foreground">very next reply</span> — no restart needed. In
        the prompts, <code>{"{agent_name}"}</code> and <code>{"{knowledge}"}</code> are placeholders
        the app fills in automatically.
      </p>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm">Company knowledge (data/knowledge.md)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            value={config.knowledge}
            onChange={(e) => setConfig({ ...config, knowledge: e.target.value })}
            rows={14}
            className="font-mono text-sm"
          />
          <div className="flex gap-3">
            <Button
              onClick={() => save({ knowledge: config.knowledge }, "Knowledge")}
              disabled={saving}
              className="btn-gradient"
            >
              Save knowledge
            </Button>
            <Button variant="outline" onClick={load} disabled={saving}>
              Reload from files
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Urdu system prompt (data/prompts/urdu.md)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              dir="rtl"
              value={config.promptUr}
              onChange={(e) => setConfig({ ...config, promptUr: e.target.value })}
              rows={16}
              className="text-sm"
            />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">English system prompt (data/prompts/english.md)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={config.promptEn}
              onChange={(e) => setConfig({ ...config, promptEn: e.target.value })}
              rows={16}
              className="text-sm"
            />
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={() => save({ promptUr: config.promptUr, promptEn: config.promptEn }, "Prompts")}
        disabled={saving}
        className="btn-gradient self-start"
      >
        Save prompts
      </Button>
    </div>
  );
}
