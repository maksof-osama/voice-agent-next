"use client";

/** Language → voice → save flow. Voice list follows the chosen language;
 *  Save enables only after something changed, and saving restarts the conversation. */

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DISPLAY_NAMES, LANGUAGES, VOICES } from "@/constants";
import { useAgentStore } from "@/store/useAgentStore";
import type { LanguageCode } from "@/types";

export function SettingsPanel() {
  const { language, voice, applySettings } = useAgentStore();
  const [draftLanguage, setDraftLanguage] = useState<LanguageCode>(language);
  const [draftVoice, setDraftVoice] = useState<string>(voice);

  const dirty = draftLanguage !== language || draftVoice !== voice;

  const onLanguageChange = (value: string) => {
    const lang = value as LanguageCode;
    setDraftLanguage(lang);
    setDraftVoice(VOICES[lang][0].value); // language badli to us ki pehli voice
  };

  const onSave = () => {
    applySettings(draftLanguage, draftVoice);
    toast.success(
      `Saved: ${DISPLAY_NAMES[draftVoice]} (${draftLanguage === "en" ? "English" : "Urdu"}) — conversation restarted`
    );
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid min-w-40 gap-2">
        <Label>Language</Label>
        <Select value={draftLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid min-w-56 flex-1 gap-2">
        <Label>Voice</Label>
        <Select value={draftVoice} onValueChange={setDraftVoice}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VOICES[draftLanguage].map((v) => (
              <SelectItem key={v.value} value={v.value}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onSave} disabled={!dirty} className="btn-gradient">
        Save
      </Button>
    </div>
  );
}
