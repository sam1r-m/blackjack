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
          standard basic strategy chart for multi-deck blackjack. use this as a
          reference for optimal play decisions.
        </p>
      </div>
    </Modal>
  );
}
