"use client";

import Modal from "@/components/common/Modal";
import Image from "next/image";

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StrategyModal({ isOpen, onClose }: StrategyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Basic Strategy Chart">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/basic_strategy_chart.png"
          alt="Blackjack basic strategy chart"
          width={600}
          height={400}
          className="rounded-lg"
          priority
        />
        <p className="text-center text-xs text-muted">
          Standard basic strategy chart for blackjack. This is optimal play for all hand 
          combinations (bringing the house edge down to around 0.5%) unless you're counting cards!{" "}
          <a href="https://www.blackjackapprenticeship.com/blackjack-strategy-charts/" target="_blank" rel="noopener noreferrer" className="text-info hover:underline">
            Source
          </a>.
        </p>
      </div>
    </Modal>
  );
}
