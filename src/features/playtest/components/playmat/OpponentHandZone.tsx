import Image from "next/image";
import { HAND_CARD_HEIGHT, HAND_CARD_WIDTH } from "./constants";

type OpponentHandZoneProps = {
  count: number;
};

export function OpponentHandZone({ count }: OpponentHandZoneProps) {
  const cards = Array.from({ length: count }, (_, i) => i);
  const spacing = 45;

  return (
    <div className="relative flex-1 h-full flex justify-center items-start overflow-visible">
      {cards.map((pos) => {
        const centerIndex = (count - 1) / 2;
        const distanceFromCenter = pos - centerIndex;

        const xOffset = distanceFromCenter * spacing;

        // 1. Inverti a rotação (removi o sinal de menos do template string)
        const rotate = distanceFromCenter * 4;

        // 2. Aumentei um pouco o ajuste base para as cartas não sumirem no topo
        // já que agora as pontas do leque vão "subir"
        const verticalAdjustment = 90;

        // 3. curveEffect agora é subtraído para criar o arco invertido
        const curveEffect = Math.abs(distanceFromCenter) * 4;

        return (
          <div
            key={`opponent-hand-${pos}`}
            className="absolute select-none pointer-events-none transition-all duration-300"
            style={{
              width: HAND_CARD_WIDTH,
              height: HAND_CARD_HEIGHT,
              left: "50%",
              top: 0,
              transformOrigin: "center top",
              transform: `
                translateX(calc(-50% + ${xOffset}px)) 
                translateY(${verticalAdjustment - curveEffect}px) 
                scaleY(-1) 
                rotate(${rotate}deg)
              `,
              zIndex: 10 + pos,
            }}
          >
            <div className="relative w-full h-full shadow-2xl rounded-[6px] border border-white/10 overflow-hidden bg-black/20">
              <Image
                src="/magic_card_back.png"
                alt="Carta do oponente"
                fill
                sizes="150px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
