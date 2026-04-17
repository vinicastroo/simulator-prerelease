"use client";

import { useState } from "react";
import { generateCardDefId, generateCardInstanceId } from "@/lib/game/ids";
import type { CardDefinition, CardInstance, PlayerId } from "@/lib/game/types";

type TokenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (definition: CardDefinition, instance: CardInstance) => void;
  playerId: PlayerId;
};

export function TokenModal({
  isOpen,
  onClose,
  onConfirm,
  playerId,
}: TokenModalProps) {
  const [name, setName] = useState("Token");
  const [power, setPower] = useState("1");
  const [toughness, setToughness] = useState("1");
  const [type, setType] = useState("Creature — Token");
  const [color] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  if (!isOpen) return null;

  function handleCreate() {
    const defId = generateCardDefId();
    const instId = generateCardInstanceId();

    const definition: CardDefinition = {
      id: defId,
      sourceId: "custom-token",
      name,
      imageUrl: imageUrl || null,
      manaCost: null,
      type,
      oracleText: null,
      power: power || null,
      toughness: toughness || null,
    };

    const instance: CardInstance = {
      id: instId,
      definitionId: defId,
      ownerId: playerId,
      controllerId: playerId,
      zone: "battlefield",
      tapped: false,
      faceDown: false,
      counters: {},
      isToken: true,
      customName: name,
      tokenData: {
        name,
        power: power || null,
        toughness: toughness || null,
        color: color || null,
        type: type || null,
        imageUrl: imageUrl || null,
      },
      battlefield: {
        x: 150,
        y: 150,
        z: 100,
        attachedTo: null,
        attachments: [],
      },
    };

    onConfirm(definition, instance);
    onClose();
  }

  return (
    <div className="absolute left-1/2 top-[56px] z-50 w-[560px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0d1117]/95 p-6 shadow-[0_32px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/8 pb-5">
        <div>
          <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-white/90">
            Criar Token
          </h3>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">
            Define as propriedades da nova ficha
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-4 mt-0.5 flex h-6 w-6 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/8 hover:text-white/70"
        >
          ✕
        </button>
      </div>

      {/* Fields */}
      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="token-name"
            className="block text-[11px] font-semibold uppercase tracking-wider text-white/40"
          >
            Nome
          </label>
          <input
            id="token-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-blue-500/50 focus:bg-blue-950/20"
            placeholder="Ex: Soldier"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="token-power"
              className="block text-[11px] font-semibold uppercase tracking-wider text-white/40"
            >
              Poder
            </label>
            <input
              id="token-power"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-blue-500/50 focus:bg-blue-950/20"
              placeholder="1"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="token-toughness"
              className="block text-[11px] font-semibold uppercase tracking-wider text-white/40"
            >
              Resistência
            </label>
            <input
              id="token-toughness"
              value={toughness}
              onChange={(e) => setToughness(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-blue-500/50 focus:bg-blue-950/20"
              placeholder="1"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="token-type"
            className="block text-[11px] font-semibold uppercase tracking-wider text-white/40"
          >
            Tipo
          </label>
          <input
            id="token-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-blue-500/50 focus:bg-blue-950/20"
            placeholder="Ex: Creature — Elf Warrior"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="token-image"
            className="block text-[11px] font-semibold uppercase tracking-wider text-white/40"
          >
            URL da Imagem{" "}
            <span className="normal-case tracking-normal text-white/25">
              (opcional)
            </span>
          </label>
          <input
            id="token-image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-blue-500/50 focus:bg-blue-950/20"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/80"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleCreate}
          className="flex-1 rounded-xl bg-blue-600/80 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-600"
        >
          Criar Token
        </button>
      </div>
    </div>
  );
}
