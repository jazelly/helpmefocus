import React from 'react';
import { Cube } from '@phosphor-icons/react';

export const CubeSpinner = ({ size, color }: { size: number; color: string}) => {
  return (
    <Cube color={color} weight="duotone" size={size}>
      <animate
        attributeName="opacity"
        values="0;1;0"
        dur="4s"
        repeatCount="indefinite"
      ></animate>
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        dur="5s"
        from="0 0 0"
        to="360 0 0"
        repeatCount="indefinite"
      ></animateTransform>
    </Cube>
  );
};
