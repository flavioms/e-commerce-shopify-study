"use client";

import { Minus, Plus } from "lucide-react";

import { IconButton } from "@/components/atoms/icon-button";

export interface QuantityStepperProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
}

/** −/quantity/+ control, e.g. for a cart line item. */
export function QuantityStepper({ quantity, onDecrease, onIncrease, disabled }: QuantityStepperProps) {
  return (
    <div className="flex items-center rounded-md border border-border">
      <IconButton
        icon={<Minus />}
        label="Decrease quantity"
        variant="ghost"
        disabled={disabled}
        onClick={onDecrease}
      />
      <span className="w-6 text-center text-sm tabular-nums">{quantity}</span>
      <IconButton
        icon={<Plus />}
        label="Increase quantity"
        variant="ghost"
        disabled={disabled}
        onClick={onIncrease}
      />
    </div>
  );
}
