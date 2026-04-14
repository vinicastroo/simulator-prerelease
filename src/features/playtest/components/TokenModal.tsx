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
  const [color, setColor] = useState("");
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
    <div className="absolute left-1/2 top-[56px] z-50 w-[380px] -translate-x-1/2 rounded-2xl border border-white/8 bg-black/90 p-4 shadow-[0_24px_48px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-white/90">
            Criar Token
          </h3>
          <p className="mt-1 text-[10px] text-white/40">
            Define as propriedades da nova ficha
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="space-y-1">
          <label
            htmlFor="token-name"
            className="text-[10px] uppercase tracking-wider text-white/30"
          >
            Nome
          </label>
          <input
            id="token-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
            placeholder="Ex: Soldier"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label
              htmlFor="token-power"
              className="text-[10px] uppercase tracking-wider text-white/30"
            >
              Poder (P)
            </label>
            <input
              id="token-power"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
              placeholder="1"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="token-toughness"
              className="text-[10px] uppercase tracking-wider text-white/30"
            >
              Resistência (T)
            </label>
            <input
              id="token-toughness"
              value={toughness}
              onChange={(e) => setToughness(e.target.value)}
              className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
              placeholder="1"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="token-type"
            className="text-[10px] uppercase tracking-wider text-white/30"
          >
            Tipo
          </label>
          <input
            id="token-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
            placeholder="Ex: Creature — Elf Warrior"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="token-image"
            className="text-[10px] uppercase tracking-wider text-white/30"
          >
            URL da Imagem (opcional)
          </label>
          <input
            id="token-image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium text-white/70 hover:bg-white/10 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleCreate}
          className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
        >
          Criar Token
        </button>
      </div>
    </div>
  );
}
