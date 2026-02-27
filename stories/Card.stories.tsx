import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '@/components/ui/Card';

const meta: Meta<typeof Card> = {
  title: 'Foundation/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Card content',
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    variant: 'default',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
  },
};

export const Interactive: Story = {
  args: {
    variant: 'default',
    children: 'Clickable card',
    onClick: () => {
      // eslint-disable-next-line no-console
      console.log('Card clicked');
    },
  },
};

