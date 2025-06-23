Special Components
Some experimental components ✨

Designed to explore new ideas, use with caution in production.

Preview
Code
'use client';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from 'src/components/ui/dropdown-menu.tsx';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { TextMorph } from 'src/components/motion-primitives/text-morph.tsx';

export function TextMorphDropdown() {
  const TRANSITION = {
    type: 'spring',
    stiffness: 280,
    damping: 18,
    mass: 0.3,
  };

  const [selectedValue, setSelectedValue] = useState('GPT-4');
  const options = ['o3', '4o', '4.5', '4o-1.5', 'o1-mini'];
  const label = 'ChatGPT';

  const handleSelect = (value: string) => {
    setSelectedValue(value);
  };

  return (
    <div className='flex items-center justify-center px-6 py-24 sm:py-32 lg:px-8'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            layout='size'
            className='overflow-hidden rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-[#f9f9f9]'
            transition={TRANSITION}
          >
            <motion.div
              layout='preserve-aspect'
              className='inline-flex items-center gap-1'
              transition={TRANSITION}
            >
              <span className='text-[#5d5d5d]'>{label}</span>
              <TextMorph className='lowercase'>{selectedValue}</TextMorph>
              <ChevronDown className='h-4 w-4 text-[#b4b4b4]' />
            </motion.div>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='shadow-sm'>
          {options.map((option) => (
            <DropdownMenuItem key={option} onClick={() => handleSelect(option)}>
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

"use client"

import { CaretRight, Check, Circle } from "@phosphor-icons/react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import * as React from "react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md backdrop-blur-xl",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...(checked !== undefined && { checked })}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
})
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <CaretRight className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg backdrop-blur-xl",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}

"use client"

import { AnimatePresence, motion } from "motion/react"
import { useId, useMemo } from "react"

import { cn } from "@/lib/utils"

type Transition = Record<string, unknown>
type Variants = Record<string, unknown>

export type TextMorphProps = {
  children: string
  as?: React.ElementType
  className?: string
  style?: React.CSSProperties
  variants?: Variants
  transition?: Transition
}

export function TextMorph({
  children,
  as: Component = "p",
  className,
  style,
  variants,
  transition,
}: TextMorphProps) {
  const uniqueId = useId()

  const characters = useMemo(() => {
    const charCounts: Record<string, number> = {}

    return children.split("").map((char) => {
      const lowerChar = char.toLowerCase()
      charCounts[lowerChar] = (charCounts[lowerChar] ?? 0) + 1

      return {
        id: `${uniqueId}-${lowerChar}${charCounts[lowerChar]}`,
        label: char === " " ? " " : char,
      }
    })
  }, [children, uniqueId])

  const defaultVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const defaultTransition: Transition = {
    type: "spring",
    stiffness: 280,
    damping: 18,
    mass: 0.3,
  }

  return (
    <Component className={cn(className)} aria-label={children} style={style}>
      <AnimatePresence mode="popLayout" initial={false}>
        {characters.map((character) => (
          <motion.span
            key={character.id}
            layoutId={character.id}
            className="inline-block"
            aria-hidden="true"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants ?? defaultVariants}
            transition={transition ?? defaultTransition}
          >
            {character.label}
          </motion.span>
        ))}
      </AnimatePresence>
    </Component>
  )
}
'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

const loadingPhases = [
  { label: '', isLoading: false },
  { label: 'Analyzing scope...', isLoading: false },
  { label: 'Synthesizing solutions...', isLoading: false },
  { label: 'Finalizing output...', isLoading: false },
];

export function TextEffectTrail() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [loading, setLoading] = useState(loadingPhases[0]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setText('');
      setIsLoading(true);
      setCurrentPhaseIndex(1);
      setLoading({
        label: loadingPhases[1].label,
        isLoading: true,
      });
    }
  };

  const handleAnimationComplete = () => {
    setLoading((prev) => ({
      ...prev,
      isLoading: false,
    }));

    const mockRandomDelay = Math.floor(Math.random() * 501) + 1500;

    if (currentPhaseIndex < loadingPhases.length - 1) {
      const nextIndex = currentPhaseIndex + 1;

      setTimeout(() => {
        setCurrentPhaseIndex(nextIndex);
        setLoading({
          label: loadingPhases[nextIndex].label,
          isLoading: true,
        });
      }, mockRandomDelay);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setCurrentPhaseIndex(0);
        setLoading(loadingPhases[0]);
      }, mockRandomDelay);
    }
  };

  return (
    <div className='flex items-center justify-center bg-zinc-950 px-6 py-24 sm:py-32 lg:px-8'>
      <div className='relative flex h-[66px] w-[400px] rounded-full bg-[#232323] px-[28px]'>
        <div className='flex flex-1 flex-row items-center gap-5'>
          <PlusIcon className='h-4 w-4 text-white' />
          <div className='h-[16px] w-[1px] bg-[#373739]' />
          <input
            type='text'
            className='w-full bg-transparent text-white outline-none'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SearchIcon } from 'lucide-react';
import { cn } from 'src/lib/utils.ts';

export function BackgroundGlowInput() {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 8000);
  }, [isLoading]);

  return (
    <div className='flex items-center justify-center px-6 py-24 sm:py-32 lg:px-8'>
      <div className='relative h-[56px] w-full max-w-[400px]'>
        <div className='relative h-[56px] w-full max-w-[400px] rounded-xl [perspective:1000px]'>
          <input
            className={cn(
              'h-full w-full rounded-xl bg-zinc-100 py-2 pl-[52px] pr-6 text-zinc-800 outline-none placeholder:text-black/30 dark:bg-zinc-800 dark:text-white/60 dark:placeholder:text-white/30'
            )}
            type='text'
            disabled={isLoading}
            value={isLoading ? '' : search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isLoading ? '' : 'Search...'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsLoading(true);
              }
            }}
          />

          <SearchIcon className='absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-zinc-700 dark:text-white/30' />
        </div>
      </div>
    </div>
  );
}

HERO SECTONS
'use client';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRef } from 'react';

export function Hero2() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });
  const rotateX = useTransform(scrollYProgress, [0.75, 1], [30, 0]);
  const theme = useTheme();

  return (
    <div ref={containerRef} className='relative bg-white dark:bg-zinc-900'>
      <header className='absolute inset-x-0 top-0 z-50'>
        <nav className='flex items-center justify-between p-6 lg:px-8'>
          <div className='flex lg:flex-1'>
            <a href='/docs' className='relative flex items-center'>
              <span className='sr-only'>Motion Primitives Pro</span>
              <svg
                role='img'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 70 70'
                aria-label='MP Logo'
                width='70'
                height='70'
                className='h-8 w-auto'
                fill='none'
              >
                <path
                  stroke='currentColor'
                  stroke-linecap='round'
                  stroke-width='3'
                  d='M51.883 26.495c-7.277-4.124-18.08-7.004-26.519-7.425-2.357-.118-4.407-.244-6.364 1.06M59.642 51c-10.47-7.25-26.594-13.426-39.514-15.664-3.61-.625-6.744-1.202-9.991.263'
                ></path>
              </svg>
            </a>
          </div>
          <div className='hidden lg:flex lg:gap-x-12'>
            <a
              href='#'
              className='text-sm/6 font-medium text-zinc-900 dark:text-zinc-200'
            >
              Product
            </a>
            <a
              href='#'
              className='text-sm/6 font-medium text-zinc-900 dark:text-zinc-200'
            >
              Features
            </a>
            <a
              href='#'
              className='text-sm/6 font-medium text-zinc-900 dark:text-zinc-200'
            >
              Marketplace
            </a>
            <a
              href='#'
              className='text-sm/6 font-medium text-zinc-900 dark:text-zinc-200'
            >
              Company
            </a>
          </div>
          <div className='hidden lg:flex lg:flex-1 lg:justify-end'>
            <a
              href='#'
              className='inline-flex items-center gap-1 text-sm/6 font-medium text-zinc-900 dark:text-zinc-200 [&_svg]:pointer-events-none'
            >
              Log in <ArrowRight className='h-4 w-4' />
            </a>
          </div>
        </nav>
      </header>

      <div className='relative isolate px-6 pt-14 lg:px-8'>
        <div className='mx-auto max-w-2xl py-24 sm:py-32'>
          <div className='text-center'>
            <h1 className='text-balance text-5xl tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl'>
              Build your dream website fast and easily
            </h1>
            <p className='mt-8 text-pretty text-lg text-zinc-500 dark:text-zinc-400 sm:text-lg/8'>
              Build beautiful websites effortlessly. Utilize our powerful tools
              to transform your ideas into reality in no time.
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <a
                href='#'
                className='rounded-md bg-zinc-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-600'
              >
                Start building
              </a>
              <a
                href='#'
                className='inline-flex items-center gap-1 text-sm/6 font-semibold text-zinc-900 dark:text-zinc-200'
              >
                Watch the film <ArrowRight className='h-4 w-4' />
              </a>
            </div>
          </div>
          <div className='mt-16'>
            <div className='mx-auto mt-4 max-w-screen-lg px-3 [mask-image:linear-gradient(to_bottom,black_60%,transparent)] [perspective:1000px]'>
              <motion.div
                className='relative aspect-[2/1] w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-900'
                style={{ rotateX }}
              >
                <img
                  src={
                    theme.theme === 'dark' ? '/mp_dark.png' : '/mp_light.png'
                  }
                  alt='motion primitives'
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


Features Section
'use client';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const FEATURES = [
  {
    title: 'Feature 1',
    description: 'Description 1',
    image:
      'https://images.beta.cosmos.so/a6d69ba1-ad19-4a77-864b-0f888ce93830?format=jpeg',
  },
  {
    title: 'Feature 2',
    description: 'Description 2',
    image:
      'https://images.beta.cosmos.so/9b3a88a7-692c-43b1-838a-96e555927db3.?format=jpeg',
  },
  {
    title: 'Feature 3',
    description: 'Description 3',
    image:
      'https://images.beta.cosmos.so/6bc5d3ba-1850-4e58-abf5-67eac6ed614d?format=jpeg',
  },
  {
    title: 'Feature 4',
    description: 'Description 4',
    image:
      'https://images.beta.cosmos.so/0a343dca-372a-4494-9b8a-65cdea0831b2?format=jpeg',
  },
  {
    title: 'Feature 5',
    description: 'Description 5',
    image:
      'https://images.beta.cosmos.so/a6d69ba1-ad19-4a77-864b-0f888ce93830?format=jpeg',
  },
  {
    title: 'Feature 6',
    description: 'Description 6',
    image:
      'https://images.beta.cosmos.so/9b3a88a7-692c-43b1-838a-96e555927db3.?format=jpeg',
  },
];

export function Feature4() {
  const [index, setIndex] = useState(0);

  return (
    <div className='py-24 sm:py-32'>
      <div className='container mx-auto mb-8 max-w-screen-lg px-4 md:mb-12'>
        <h2 className='mb-4 text-2xl font-medium text-zinc-900 dark:text-white md:text-4xl'>
          Visualize your ideas instantly
        </h2>
        <div className='flex space-x-2'>
          <button
            type='button'
            className='flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-30'
            aria-label='Previous slide'
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            <ChevronLeftIcon className='h-5 w-5' />
          </button>
          <button
            type='button'
            className='flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-30'
            aria-label='Next slide'
            disabled={index === 5}
            onClick={() => setIndex(index + 1)}
          >
            <ChevronRightIcon className='h-5 w-5' />
          </button>
        </div>
      </div>
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with commas for thousands, etc
 */
export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n)
}

/**
 * Creates a debounced function that delays invoking the provided function until after
 * the specified wait time has elapsed since the last time it was invoked.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export const isDev = process.env.NODE_ENV === "development"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Tables } from "@/types/database.types"

type AgentCardProps = {
  id: string
  name: string
  description: string
  avatar_url?: string | null
  className?: string
  isAvailable: boolean
  onClick?: () => void
  system_prompt?: string
  tools?: string[] | null
  mcp_config?: Tables<"agents">["mcp_config"] | null
  isLight?: boolean
}

export function AgentCard({
  name,
  description,
  avatar_url,
  className,
  isAvailable,
  onClick,
  system_prompt,
  tools,
  mcp_config,
  isLight = false,
}: AgentCardProps) {
  return (
    <button
      className={cn(
        "flex items-start justify-start",
        "bg-secondary hover:bg-accent cursor-pointer rounded-xl p-4 transition-colors",
        className,
        !isAvailable && "cursor-not-allowed opacity-50"
      )}
      type="button"
      onClick={(e) => {
        e.preventDefault()

        if (!isAvailable) return

        onClick?.()
      }}
    >
      <div className="flex flex-col items-start space-y-2">
        <div className="flex items-center space-x-2">
          {avatar_url ? (
            <div className="bg-muted size-4 overflow-hidden rounded-full">
              <Avatar className="h-full w-full object-cover">
                <AvatarImage
                  src={avatar_url}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              </Avatar>
            </div>
          ) : null}
          <h3 className="text-foreground text-base font-medium">{name}</h3>
        </div>

        <p className="text-foreground line-clamp-2 text-left text-sm">
          {description}
        </p>

        {!isLight && system_prompt && (
          <p className="text-muted-foreground line-clamp-2 text-left font-mono text-sm">
            {system_prompt}
          </p>
        )}

        {!isLight && (
          <div className="flex flex-wrap gap-2 text-xs">
            {tools && tools.length > 0 ? (
              <span className="text-muted-foreground">
                tools: {tools.join(", ")}
              </span>
            ) : mcp_config ? (
              <span className="text-muted-foreground">
                mcp: {mcp_config.server}
              </span>
            ) : (
              <span className="text-muted-foreground">tools: none</span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}

"use client"

import { useChat } from "@ai-sdk/react"
import { AnimatePresence, motion } from "motion/react"
import dynamic from "next/dynamic"
import { redirect, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"

// import { Conversation } from "@/app/components/chat/conversation" // Available for fallback
import { EnhancedConversation } from "@/app/components/chat/enhanced-conversation"
import { ChatInput } from "@/app/components/chat-input/chat-input"
import { toast } from "@/components/ui/toast"
import { useChatDraft } from "@/hooks/use-chat-draft"
import { useAgent } from "@/lib/agent-store/provider"
import { getOrCreateGuestUserId } from "@/lib/api"
import { useChats } from "@/lib/chat-store/chats/provider"
import { useMessages } from "@/lib/chat-store/messages/provider"
import { useChatSession } from "@/lib/chat-store/session/provider"
import {
  MESSAGE_MAX_LENGTH,
  MODEL_DEFAULT,
  SYSTEM_PROMPT_DEFAULT,
} from "@/lib/config"
import { Attachment } from "@/lib/file-handling"
import { API_ROUTE_CHAT } from "@/lib/routes"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { useUser } from "@/lib/user-store/provider"
import { cn } from "@/lib/utils"


import { useChatHandlers } from "./use-chat-handlers"
import { useChatUtils } from "./use-chat-utils"
import { useFileUpload } from "./use-file-upload"

const FeedbackWidget = dynamic(
  () => import("./feedback-widget").then((_mod) => _mod.FeedbackWidget),
  { ssr: false }
)

const DialogAuth = dynamic(
  () => import("./dialog-auth").then((_mod) => _mod.DialogAuth),
  { ssr: false }
)

// Create a separate component that uses useSearchParams
function SearchParamsProvider({
  setInput,
}: {
  setInput: (input: string) => void
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const prompt = searchParams.get("prompt")
    if (prompt) {
      setInput(prompt)
    }
  }, [searchParams, setInput])

  return null
}

export function Chat() {
  const { chatId } = useChatSession()
  const {
    createNewChat,
    getChatById,
    updateChatModel,
    isLoading: isChatsLoading,
  } = useChats()
  const currentChat = chatId ? getChatById(chatId) : null
  const { messages: initialMessages, cacheAndAddMessage } = useMessages()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { preferences } = useUserPreferences()
  const [hasDialogAuth, setHasDialogAuth] = useState(false)
  const [searchAgentId, setSearchAgentId] = useState<string | null>(null)
  const {
    files,
    setFiles,
    handleFileUploads,
    createOptimisticAttachments,
    cleanupOptimisticAttachments,
    handleFileUpload,
    handleFileRemove,
  } = useFileUpload()
  const [selectedModel, setSelectedModel] = useState(
    currentChat?.model ?? user?.preferred_model ?? MODEL_DEFAULT
  )
  const { currentAgent } = useAgent()
  const systemPrompt =
    currentAgent?.system_prompt ?? user?.system_prompt ?? SYSTEM_PROMPT_DEFAULT

  const [hydrated, setHydrated] = useState(false)
  const hasSentFirstMessageRef = useRef(false)

  const isAuthenticated = !!user?.id

  const { draftValue, clearDraft } = useChatDraft(chatId)

  const {
    messages,
    input,
    handleSubmit,
    status,
    error,
    reload,
    stop,
    setMessages,
    setInput,
    append,
  } = useChat({
    api: API_ROUTE_CHAT,
    initialMessages,
    initialInput: draftValue,
    onFinish: async (message) => {
      // store the assistant message in the cache
      await cacheAndAddMessage(message)
    },
  })

  const { checkLimitsAndNotify, ensureChatExists } = useChatUtils({
    isAuthenticated,
    chatId,
    messages,
    input,
    selectedModel,
    systemPrompt,
    selectedAgentId: searchAgentId ?? currentAgent?.id ?? null,
    createNewChat,
    setHasDialogAuth,
  })

  const { handleInputChange, handleModelChange, handleDelete, handleEdit } =
    useChatHandlers({
      messages,
      setMessages,
      setInput,
      setSelectedModel,
      selectedModel,
      chatId,
      updateChatModel,
      user,
    })

  // when chatId is null, set messages to an empty array
  useEffect(() => {
    if (chatId === null) {
      setMessages([])
    }
  }, [chatId, setMessages])

  useEffect(() => {
    setHydrated(true)
  }, [])

  // handle errors
  useEffect(() => {
    if (error) {
      let errorMsg = "Something went wrong."
      try {
        const parsed = JSON.parse(error.message)
        errorMsg = parsed.error ?? errorMsg
      } catch {
        errorMsg = error.message ?? errorMsg
      }
      toast({
        title: errorMsg,
        status: "error",
      })
    }
  }, [error])

  const submit = async () => {
    setIsSubmitting(true)

    const uid = await getOrCreateGuestUserId(user)
    if (!uid) return

    const optimisticId = `optimistic-${Date.now().toString()}`
    const optimisticAttachments =
      files.length > 0 ? createOptimisticAttachments(files) : []

    const optimisticMessage = {
      id: optimisticId,
      content: input,
      role: "user" as const,
      createdAt: new Date(),
      experimental_attachments:
        optimisticAttachments.length > 0 ? optimisticAttachments : [],
    }

    setMessages((prev) => [...prev, optimisticMessage as any])
    setInput("")

    const submittedFiles = [...files]
    setFiles([])

    const allowed = await checkLimitsAndNotify(uid)
    if (!allowed) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      setIsSubmitting(false)
      return
    }

    const currentChatId = await ensureChatExists(uid)
    if (!currentChatId) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      setIsSubmitting(false)
      return
    }

    if (input.length > MESSAGE_MAX_LENGTH) {
      toast({
        title: `The message you submitted was too long, please submit something shorter. (Max ${MESSAGE_MAX_LENGTH} characters)`,
        status: "error",
      })
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      setIsSubmitting(false)
      return
    }

    let attachments: Attachment[] | null = []
    if (submittedFiles.length > 0) {
      attachments = await handleFileUploads(uid, currentChatId)
      if (attachments === null) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
        setIsSubmitting(false)
        return
      }
    }

    const effectiveAgentId = searchAgentId ?? currentAgent?.id
    const options = {
      body: {
        chatId: currentChatId,
        userId: uid,
        model: selectedModel,
        isAuthenticated,
        systemPrompt: systemPrompt ?? SYSTEM_PROMPT_DEFAULT,
        ...(effectiveAgentId && { agentId: effectiveAgentId }),
      },
      experimental_attachments: attachments ?? undefined,
    }

    try {
      handleSubmit(undefined, options)
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      cacheAndAddMessage(optimisticMessage as any)
      clearDraft()
      hasSentFirstMessageRef.current = true
    } catch {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      toast({ title: "Failed to send message", status: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuggestion = useCallback(
    async (suggestion: string) => {
      setIsSubmitting(true)
      const optimisticId = `optimistic-${Date.now().toString()}`
      const optimisticMessage = {
        id: optimisticId,
        content: suggestion,
        role: "user" as const,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      const uid = await getOrCreateGuestUserId(user)

      if (!uid) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        setIsSubmitting(false)
        return
      }

      const allowed = await checkLimitsAndNotify(uid)
      if (!allowed) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        setIsSubmitting(false)
        return
      }

      const currentChatId = await ensureChatExists(uid)

      if (!currentChatId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        setIsSubmitting(false)
        return
      }

      const options = {
        body: {
          chatId: currentChatId,
          userId: uid,
          model: selectedModel,
          isAuthenticated,
          systemPrompt: SYSTEM_PROMPT_DEFAULT,
        },
      }

      append(
        {
          role: "user",
          content: suggestion,
        },
        options
      )
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      setIsSubmitting(false)
    },
    [
      ensureChatExists,
      selectedModel,
      user,
      append,
      checkLimitsAndNotify,
      isAuthenticated,
      setMessages,
    ]
  )

  const handleReload = async () => {
    const uid = await getOrCreateGuestUserId(user)
    if (!uid) {
      return
    }

    const options = {
      body: {
        chatId,
        userId: uid,
        model: selectedModel,
        isAuthenticated,
        systemPrompt: systemPrompt ?? SYSTEM_PROMPT_DEFAULT,
      },
    }

    reload(options)
  }

  // Handle search agent toggle
  const handleSearchToggle = useCallback(
    (enabled: boolean, agentId: string | null) => {
      setSearchAgentId(enabled ? agentId : null)
    },
    []
  )

  // not user chatId and no messages
  if (hydrated && chatId && !isChatsLoading && !currentChat) {
    return redirect("/")
  }

  return (
    <div
      className={cn(
        "@container/main relative flex h-full flex-col items-center justify-end md:justify-center",
        "bg-gradient-to-br from-slate-50 via-white to-slate-50/80",
        "dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/90",
        "transition-all duration-700 ease-out"
      )}
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-100/20 to-cyan-100/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-100/10 to-pink-100/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <DialogAuth open={hasDialogAuth} setOpen={setHasDialogAuth} />

      {/* Add Suspense boundary for SearchParamsProvider */}
      <Suspense>
        <SearchParamsProvider setInput={setInput} />
      </Suspense>

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-end md:justify-center">
        <AnimatePresence initial={false} mode="popLayout">
          {!chatId && messages.length === 0 ? (
            <motion.div
              key="onboarding"
              className="absolute bottom-[60%] mx-auto max-w-[50rem] md:relative md:bottom-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              layout="position"
              layoutId="onboarding"
              transition={{
                layout: {
                  duration: 0,
                },
                opacity: { duration: 0.6 },
                y: { duration: 0.6, ease: "easeOut" }
              }}
            >
              <motion.h1 
                className="mb-6 text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                What's on your mind?
              </motion.h1>
              <motion.p 
                className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Powered by advanced AI with specialized agents and comprehensive capabilities
              </motion.p>
            </motion.div>
          ) : (
            <EnhancedConversation
              key="conversation"
              messages={messages}
              status={status}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onReload={() => void handleReload()}
            />
          )}
        </AnimatePresence>
      </div>
      <motion.div
        className={cn(
          "relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl p-4"
        )}
        layout="position"
        layoutId="chat-input-container"
        transition={{
          layout: {
            duration: messages.length === 1 ? 0.3 : 0,
          },
        }}
      >
        <div className="relative">
          {/* Enhanced Chat Input Background */}
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-slate-700/50 shadow-2xl" />
          
          <div className="relative">
            <ChatInput
              value={input}
              onSuggestion={handleSuggestion}
              onValueChange={handleInputChange}
              onSend={() => void submit()}
              isSubmitting={isSubmitting}
              files={files}
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
              hasSuggestions={
                preferences.promptSuggestions && !chatId && messages.length === 0
              }
              onSelectModel={handleModelChange}
              selectedModel={selectedModel}
              isUserAuthenticated={isAuthenticated}
              stop={stop}
              status={status}
              onSearchToggle={handleSearchToggle}
            />
          </div>
        </div>
      </motion.div>

      {user?.id && <FeedbackWidget authUserId={user.id} />}
    </div>
  )
}

"use client"

import { Info } from "@phosphor-icons/react"
import Link from "next/link"

import { HistoryTrigger } from "@/app/components/history/history-trigger"
import { AppInfoTrigger } from "@/app/components/layout/app-info/app-info-trigger"
import { ButtonNewChat } from "@/app/components/layout/button-new-chat"
import { UserMenu } from "@/app/components/layout/user-menu"
import { Button } from "@/components/ui/button"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { useAgent } from "@/lib/agent-store/provider"
import { APP_NAME } from "@/lib/config"
import { useUser } from "@/lib/user-store/provider"
import type { Agent } from "@/types/agent"

import { DialogPublish } from "./dialog-publish"
import { HeaderSidebarTrigger } from "./header-sidebar-trigger"

export type AgentHeader = Pick<
  Agent,
  "name" | "description" | "avatar_url" | "slug"
>

export function Header({ hasSidebar }: { hasSidebar: boolean }) {
  const isMobile = useBreakpoint(768)
  const { user } = useUser()
  const { currentAgent } = useAgent()

  const isLoggedIn = !!user

  return (
    <header className="h-app-header pointer-events-none fixed top-0 right-0 left-0 z-50">
      <div className="relative mx-auto flex h-full max-w-full items-center justify-between bg-transparent px-4 sm:px-6 lg:bg-transparent lg:px-8">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-1 items-center gap-2 pl-0 md:pl-0.5">
            {hasSidebar && <HeaderSidebarTrigger />}
            {(!currentAgent || !isMobile) && (
              <div className="flex-1">
                <Link
                  href="/"
                  className="pointer-events-auto text-xl font-medium tracking-tight"
                >
                  {APP_NAME}
                </Link>
              </div>
            )}
          </div>
          <div />
          {!isLoggedIn ? (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-4">
              <AppInfoTrigger
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background hover:bg-muted text-muted-foreground h-8 w-8 rounded-full"
                    aria-label={`About ${APP_NAME}`}
                  >
                    <Info className="size-4" />
                  </Button>
                }
              />
              <Link
                href="/auth"
                className="font-base text-muted-foreground hover:text-foreground text-base transition-colors"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-2">
              {currentAgent && <DialogPublish />}
              <ButtonNewChat />
              {!hasSidebar && <HistoryTrigger hasSidebar={hasSidebar} />}
              <UserMenu />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

"use client"

import { ArrowUp, Stop, Warning } from "@phosphor-icons/react"
import React, { useCallback, useEffect } from "react"

import { useAgentCommand } from "@/app/components/chat-input/use-agent-command"
import { ModelSelector } from "@/components/common/model-selector/base"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import { Button } from "@/components/ui/button"
import { useAgent } from "@/lib/agent-store/provider"
import { getModelInfo } from "@/lib/models"

import { PromptSystem } from "../suggestions/prompt-system"

import { AgentCommand } from "./agent-command"
import { ButtonFileUpload } from "./button-file-upload"
import { ButtonSearch } from "./button-search"
import { FileList } from "./file-list"
import { SelectedAgent } from "./selected-agent"
import { useSearchAgent } from "./use-search-agent"

type ChatInputProps = {
  value: string
  onValueChange: (value: string) => void
  onSend: () => void
  isSubmitting?: boolean
  hasMessages?: boolean
  files: File[]
  onFileUpload: (files: File[]) => void
  onFileRemove: (file: File) => void
  onSuggestion: (suggestion: string) => void
  hasSuggestions?: boolean
  onSelectModel: (model: string) => void
  selectedModel: string
  isUserAuthenticated: boolean
  stop: () => void
  status?: "submitted" | "streaming" | "ready" | "error"
  onSearchToggle?: (enabled: boolean, agentId: string | null) => void
}

export function ChatInput({
  value,
  onValueChange,
  onSend,
  isSubmitting,
  files,
  onFileUpload,
  onFileRemove,
  onSuggestion,
  hasSuggestions,
  onSelectModel,
  selectedModel,
  isUserAuthenticated,
  stop,
  status,
  onSearchToggle,
}: ChatInputProps) {
  const { currentAgent, curatedAgents, userAgents } = useAgent()
  const { isSearchEnabled, toggleSearch } = useSearchAgent()

  const agentCommand = useAgentCommand({
    value,
    onValueChange,
    agents: [...(curatedAgents ?? []), ...(userAgents ?? [])],
    defaultAgent: currentAgent,
  })

  const selectModelConfig = getModelInfo(selectedModel)
  const hasToolSupport = Boolean(selectModelConfig?.tools)
  const isOnlyWhitespace = (text: string) => !/[^\s]/.test(text)

  // Handle search toggle
  const handleSearchToggle = useCallback(
    (enabled: boolean) => {
      toggleSearch(enabled)
      const agentId = enabled ? "search" : null
      onSearchToggle?.(enabled, agentId)
    },
    [toggleSearch, onSearchToggle]
  )

  const handleSend = useCallback(() => {
    if (isSubmitting) {
      return
    }

    if (status === "streaming") {
      stop()
      return
    }

    onSend()
  }, [isSubmitting, onSend, status, stop])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // First process agent command related key handling
      agentCommand.handleKeyDown(e)

      if (isSubmitting) {
        e.preventDefault()
        return
      }

      if (e.key === "Enter" && status === "streaming") {
        e.preventDefault()
        return
      }

      if (e.key === "Enter" && !e.shiftKey && !agentCommand.showAgentCommand) {
        if (isOnlyWhitespace(value)) {
          return
        }

        e.preventDefault()
        onSend()
      }
    },
    [agentCommand, isSubmitting, onSend, status, value]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const hasImageContent = Array.from(items).some((item) =>
        item.type.startsWith("image/")
      )

      if (!isUserAuthenticated && hasImageContent) {
        e.preventDefault()
        return
      }

      if (isUserAuthenticated && hasImageContent) {
        const imageFiles: File[] = []

        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile()
            if (file) {
              const newFile = new File(
                [file],
                `pasted-image-${Date.now()}.${file.type.split("/")[1]}`,
                { type: file.type }
              )
              imageFiles.push(newFile)
            }
          }
        }

        if (imageFiles.length > 0) {
          onFileUpload(imageFiles)
        }
      }
      // Text pasting will work by default for everyone
    },
    [isUserAuthenticated, onFileUpload]
  )

  useEffect(() => {
    const el = agentCommand.textareaRef.current
    if (!el) return
    el.addEventListener("paste", handlePaste)
    return () => el.removeEventListener("paste", handlePaste)
  }, [agentCommand.textareaRef, handlePaste])

  return (
    <div className="relative flex w-full flex-col gap-4">
      {hasSuggestions && (
        <PromptSystem
          onValueChange={onValueChange}
          onSuggestion={onSuggestion}
          value={value}
        />
      )}
      <div className="relative order-2 px-2 pb-3 sm:pb-4 md:order-1">
        <PromptInput
          className="bg-popover relative z-10 p-0 pt-1 shadow-xs backdrop-blur-xl"
          maxHeight={200}
          value={value}
          onValueChange={agentCommand.handleValueChange}
        >
          {agentCommand.showAgentCommand && (
            <div className="absolute bottom-full left-0 w-full">
              <AgentCommand
                isOpen={agentCommand.showAgentCommand}
                searchTerm={agentCommand.agentSearchTerm}
                onSelect={agentCommand.handleAgentSelect}
                onClose={agentCommand.closeAgentCommand}
                activeIndex={agentCommand.activeAgentIndex}
                onActiveIndexChange={agentCommand.setActiveAgentIndex}
                curatedAgents={curatedAgents ?? []}
                userAgents={userAgents ?? []}
              />
            </div>
          )}
          <SelectedAgent
            selectedAgent={agentCommand.selectedAgent}
            removeSelectedAgent={agentCommand.removeSelectedAgent}
          />
          <FileList files={files} onFileRemove={onFileRemove} />
          <PromptInputTextarea
            placeholder="Ask Zola"
            onKeyDown={handleKeyDown}
            className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
            ref={agentCommand.textareaRef}
          />
          <PromptInputActions className="mt-5 w-full justify-between px-3 pb-3">
            <div className="flex gap-2">
              <ButtonFileUpload
                onFileUpload={onFileUpload}
                isUserAuthenticated={isUserAuthenticated}
                model={selectedModel}
              />
              <ModelSelector
                selectedModelId={selectedModel}
                setSelectedModelId={onSelectModel}
                isUserAuthenticated={isUserAuthenticated}
                className="rounded-full"
              />
              <ButtonSearch
                isSelected={isSearchEnabled}
                onToggle={handleSearchToggle}
                isAuthenticated={isUserAuthenticated}
              />
              {currentAgent && !hasToolSupport && (
                <div className="flex items-center gap-1">
                  <Warning className="size-4" />
                  <p className="line-clamp-2 text-xs">
                    {selectedModel} does not support tools. Agents may not work
                    as expected.
                  </p>
                </div>
              )}
            </div>
            <PromptInputAction
              tooltip={status === "streaming" ? "Stop" : "Send"}
            >
              <Button
                size="sm"
                className="size-9 rounded-full transition-all duration-300 ease-out"
                disabled={!value || isSubmitting || isOnlyWhitespace(value)}
                type="button"
                onClick={handleSend}
                aria-label={status === "streaming" ? "Stop" : "Send message"}
              >
                {status === "streaming" ? (
                  <Stop className="size-4" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  )
}

"use client"

import { Check, PencilSimple, TrashSimple, X } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useChatSession } from "@/lib/chat-store/session/provider"
import type { Chats } from "@/lib/chat-store/types"
import { cn } from "@/lib/utils"

import { formatDate, groupChatsByDate } from "./utils"

type CommandHistoryProps = {
  chatHistory: Chats[]
  onSaveEdit: (id: string, newTitle: string) => Promise<void>
  onConfirmDelete: (id: string) => Promise<void>
  trigger: React.ReactNode
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  hasPopover?: boolean
}

type CommandItemEditProps = {
  chat: Chats
  editTitle: string
  setEditTitle: (title: string) => void
  onSave: (id: string) => void
  onCancel: () => void
}

type CommandItemDeleteProps = {
  chat: Chats
  onConfirm: (id: string) => void
  onCancel: () => void
}

type CommandItemRowProps = {
  chat: Chats
  onEdit: (chat: Chats) => void
  onDelete: (id: string) => void
  editingId: string | null
  deletingId: string | null
}

// Component for editing a chat item
function CommandItemEdit({
  chat,
  editTitle,
  setEditTitle,
  onSave,
  onCancel,
}: CommandItemEditProps) {
  return (
    <form
      className="flex w-full items-center justify-between"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(chat.id)
      }}
    >
      <Input
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="border-input h-8 flex-1 rounded border bg-transparent px-3 py-1 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onSave(chat.id)
          }
        }}
      />
      <div className="ml-2 flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="group/edit-confirm text-muted-foreground hover:bg-primary/10 size-8 transition-colors duration-150"
              type="submit"
              aria-label="Confirm"
            >
              <Check className="group-hover/edit-confirm:text-primary size-4 transition-colors duration-150" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Confirm</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="group/edit-cancel text-muted-foreground hover:bg-primary/10 size-8 transition-colors duration-150"
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
            >
              <X className="group-hover/edit-cancel:text-primary size-4 transition-colors duration-150" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancel</TooltipContent>
        </Tooltip>
      </div>
    </form>
  )
}

// Component for deleting a chat item
function CommandItemDelete({
  chat,
  onConfirm,
  onCancel,
}: CommandItemDeleteProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onConfirm(chat.id)
      }}
      className="flex w-full items-center justify-between"
    >
      <div className="flex flex-1 items-center">
        <span className="line-clamp-1 text-base font-normal">{chat.title}</span>
        <input
          type="text"
          className="sr-only hidden"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault()
              onCancel()
            } else if (e.key === "Enter") {
              e.preventDefault()
              onConfirm(chat.id)
            }
          }}
        />
      </div>
      <div className="ml-2 flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="group/delete-confirm text-muted-foreground hover:text-destructive-foreground hover:bg-primary/10 size-8 transition-colors duration-150"
              type="submit"
              aria-label="Confirm"
            >
              <Check className="group-hover/delete-confirm:text-primary size-4 transition-colors duration-150" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Confirm</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="group/delete-cancel text-muted-foreground hover:text-foreground hover:bg-primary/10 size-8 transition-colors duration-150"
              onClick={onCancel}
              type="button"
              aria-label="Cancel"
            >
              <X className="group-hover/delete-cancel:text-primary size-4 transition-colors duration-150" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancel</TooltipContent>
        </Tooltip>
      </div>
    </form>
  )
}

// Component for displaying a normal chat row
function CommandItemRow({
  chat,
  onEdit,
  onDelete,
  editingId,
  deletingId,
}: CommandItemRowProps) {
  const { chatId } = useChatSession()
  const isCurrentChat = chat.id === chatId

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="line-clamp-1 text-base font-normal">
          {chat?.title || "Untitled Chat"}
        </span>
        {isCurrentChat && <Badge variant="outline">current</Badge>}
      </div>

      {/* Date and actions container */}
      <div className="relative flex min-w-[140px] flex-shrink-0 items-center justify-end">
        {/* Date that shows by default but hides on selection */}
        <span
          className={cn(
            "text-muted-foreground text-sm font-normal transition-opacity duration-150",
            "group-data-[selected=true]:opacity-0",
            Boolean(editingId ?? deletingId) && "opacity-100"
          )}
        >
          {formatDate(chat?.created_at)}
        </span>

        {/* Action buttons that appear on selection */}
        <div
          className={cn(
            "absolute right-0 flex items-center gap-1 opacity-0 transition-opacity duration-150",
            "group-data-[selected=true]:opacity-100",
            Boolean(editingId ?? deletingId) && "opacity-0"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="group/edit hover:bg-primary/10 size-8 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation()
                  if (chat) onEdit(chat)
                }}
                type="button"
                aria-label="Edit"
              >
                <PencilSimple className="text-muted-foreground group-hover/edit:text-primary size-4 transition-colors duration-150" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="group/delete text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation()
                  if (chat?.id) onDelete(chat.id)
                }}
                type="button"
                aria-label="Delete"
              >
                <TrashSimple className="text-muted-foreground group-hover/delete:text-destructive size-4 transition-colors duration-150" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </>
  )
}

export function CommandHistory({
  chatHistory,
  onSaveEdit,
  onConfirmDelete,
  trigger,
  isOpen,
  setIsOpen,
  hasPopover = true,
}: CommandHistoryProps) {
  const { chatId } = useChatSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearchQuery("")
      setEditingId(null)
      setEditTitle("")
      setDeletingId(null)
    }
  }

  const handleEdit = useCallback((chat: Chats) => {
    setEditingId(chat.id)
    setEditTitle(chat.title || "")
  }, [])

  const handleSaveEdit = useCallback(
    async (id: string) => {
      setEditingId(null)
      await onSaveEdit(id, editTitle)
    },
    [editTitle, onSaveEdit]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditTitle("")
  }, [])

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id)
  }, [])

  const handleConfirmDelete = useCallback(
    async (id: string) => {
      setDeletingId(null)
      await onConfirmDelete(id)
    },
    [onConfirmDelete]
  )

  const handleCancelDelete = useCallback(() => {
    setDeletingId(null)
  }, [])

  const filteredChat = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return query
      ? chatHistory.filter((chat) =>
          (chat.title || "").toLowerCase().includes(query)
        )
      : chatHistory
  }, [chatHistory, searchQuery])

  // Group chats by time periods
  const groupedChats = useMemo(
    () => groupChatsByDate(chatHistory, searchQuery),
    [chatHistory, searchQuery]
  )

  const renderChatItem = useCallback(
    (chat: Chats) => {
      const isCurrentChatSession = chat.id === chatId
      const isCurrentChatEditOrDelete =
        (chat.id === editingId) || (chat.id === deletingId)
      const isEditOrDeleteMode = editingId ?? deletingId

      return (
        <CommandItem
          key={chat.id}
          onSelect={() => {
            if (isCurrentChatSession) {
              setIsOpen(false)
              return
            }
            if (!editingId && !deletingId) {
              router.push(`/c/${chat.id}`)
            }
          }}
          className={cn(
            "group group data-[selected=true]:bg-accent flex w-full items-center justify-between rounded-md",
            isCurrentChatEditOrDelete ? "!py-2" : "py-2",
            isCurrentChatEditOrDelete &&
              "bg-accent data-[selected=true]:bg-accent",
            !isCurrentChatEditOrDelete &&
              isEditOrDeleteMode &&
              "data-[selected=true]:bg-transparent"
          )}
          value={chat.id}
          data-value-id={chat.id}
        >
          {editingId === chat.id ? (
            <CommandItemEdit
              chat={chat}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : deletingId === chat.id ? (
            <CommandItemDelete
              chat={chat}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          ) : (
            <CommandItemRow
              chat={chat}
              onEdit={handleEdit}
              onDelete={handleDelete}
              editingId={editingId}
              deletingId={deletingId}
            />
          )}
        </CommandItem>
      )
    },
    [
      chatId,
      router,
      setIsOpen,
      editingId,
      deletingId,
      editTitle,
      handleSaveEdit,
      handleCancelEdit,
      handleConfirmDelete,
      handleCancelDelete,
      handleEdit,
      handleDelete,
    ]
  )

  // Prefetch chat pages, later we will do pagination + infinite scroll
  useEffect(() => {
    if (!isOpen) return

    // Simply prefetch all the chat routes when dialog opens
    chatHistory.forEach((chat) => {
      void router.prefetch(`/c/${chat.id}`)
    })
  }, [isOpen, chatHistory, router])

  // Add keyboard shortcut to open dialog with Command+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey ?? e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [isOpen, setIsOpen])

  return (
    <>
      {hasPopover ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent>History ⌘+K</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <CommandDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title="Chat History"
        description="Search through your past conversations"
      >
        <Command shouldFilter={false} className="border-none">
          <CommandInput
            placeholder="Search history..."
            value={searchQuery}
            onValueChange={(value) => setSearchQuery(value)}
          />
          <CommandList className="max-h-[480px] min-h-[480px] flex-1 [&>[cmdk-list-sizer]]:space-y-6 [&>[cmdk-list-sizer]]:py-2">
            {filteredChat.length === 0 && (
              <CommandEmpty>No chat history found.</CommandEmpty>
            )}

            {searchQuery ? (
              // When searching, display a flat list without grouping
              <CommandGroup className="p-1.5">
                {filteredChat.map((chat) => renderChatItem(chat))}
              </CommandGroup>
            ) : (
              // When not searching, display grouped by date
              groupedChats?.map((group) => (
                <CommandGroup
                  key={group.name}
                  heading={group.name}
                  className="space-y-0 px-1.5"
                >
                  {group.chats.map((chat) => renderChatItem(chat))}
                </CommandGroup>
              ))
            )}
          </CommandList>

          {/* indicator command bar */}
          <div className="bg-card border-input right-0 bottom-0 left-0 flex items-center justify-between border-t px-4 py-3">
            <div className="text-muted-foreground flex w-full items-center gap-2 text-xs">
              <div className="flex w-full flex-row items-center justify-between gap-1">
                <div className="flex w-full flex-1 flex-row items-center gap-4">
                  <div className="flex flex-row items-center gap-1.5">
                    <div className="flex flex-row items-center gap-0.5">
                      <span className="border-border bg-muted inline-flex size-5 items-center justify-center rounded-sm border">
                        ↑
                      </span>
                      <span className="border-border bg-muted inline-flex size-5 items-center justify-center rounded-sm border">
                        ↓
                      </span>
                    </div>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="border-border bg-muted inline-flex size-5 items-center justify-center rounded-sm border">
                      ⏎
                    </span>
                    <span>Go to chat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-row items-center gap-0.5">
                      <span className="border-border bg-muted inline-flex size-5 items-center justify-center rounded-sm border">
                        ⌘
                      </span>
                      <span className="border-border bg-muted inline-flex size-5 items-center justify-center rounded-sm border">
                        K
                      </span>
                    </div>
                    <span>Toggle</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="border-border bg-muted inline-flex h-5 items-center justify-center rounded-sm border px-1">
                  Esc
                </span>
                <span>Close</span>
              </div>
            </div>
          </div>
        </Command>
      </CommandDialog>
    </>
  )
}

'use client'
import { ArrowUp, Robot, User, Sparkle, Lightning, Circle } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'motion/react'
import React, { useState, useRef, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { useChatStream } from '@/hooks/useChatStream'
import { cn } from '@/lib/utils'

interface ChatPaneProps {
  agentId: string
}

export function ChatPane({ agentId }: ChatPaneProps) {
  const { 
    messages, 
    sendMessage, 
    isConnected, 
    isTyping, 
    connectionStatus,
    reconnect 
  } = useChatStream(agentId)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !isConnected) return

    const userInput = input.trim()
    setInput('')

    try {
      await sendMessage(userInput)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const getAgentIcon = (agentId: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      'browser-view': Lightning,
      'poseidon': Sparkle,
      'weather-sage': Circle,
    }
    return icons[agentId] || Robot
  }

  const getAgentColor = (agentId: string) => {
    const colors: Record<string, string> = {
      'browser-view': 'from-purple-500 to-blue-500',
      'poseidon': 'from-blue-500 to-cyan-500',
      'weather-sage': 'from-emerald-500 to-green-500',
    }
    return colors[agentId] || 'from-slate-500 to-slate-600'
  }

  const AgentIcon = getAgentIcon(agentId)
  const agentGradient = getAgentColor(agentId)

  return (
    <div className="flex flex-col h-full relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-100/10 to-purple-100/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-emerald-100/10 to-cyan-100/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Agent Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-3 p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50"
      >
        <div className={cn(
          "p-2 rounded-xl bg-gradient-to-br",
          agentGradient,
          "text-white shadow-lg"
        )}>
          <AgentIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white capitalize">
            {agentId.replace('-', ' ')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time AI Agent
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-slate-400'
            )} />
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'connecting' ? 'Connecting...' :
               connectionStatus === 'error' ? 'Error' : 'Offline'}
            </span>
          </div>
          {connectionStatus === 'error' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={reconnect}
              className="h-6 px-2 text-xs"
            >
              Retry
            </Button>
          )}
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-auto p-4 space-y-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center max-w-md">
                <div className={cn(
                  "w-16 h-16 rounded-2xl bg-gradient-to-br mx-auto mb-4 flex items-center justify-center shadow-lg",
                  agentGradient
                )}>
                  <AgentIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Start a conversation
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  I'm ready to help you with real-time assistance using advanced AI capabilities.
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                      "w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md flex-shrink-0",
                      agentGradient
                    )}
                  >
                    <AgentIcon className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
                  message.role === 'user'
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-white/80 dark:bg-slate-700/80 backdrop-blur-xl border border-white/20 dark:border-slate-600/50 text-slate-900 dark:text-white"
                )}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                {message.role === 'user' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-md flex-shrink-0"
                  >
                    <User className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-3 justify-start"
            >
              <div className={cn(
                "w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                agentGradient
              )}>
                <AgentIcon className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-xl border border-white/20 dark:border-slate-600/50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="relative z-10 p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/50"
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${agentId.replace('-', ' ')}...`}
              disabled={isTyping || !isConnected}
              className={cn(
                "w-full px-4 py-3 pr-12 rounded-2xl border border-white/30 dark:border-slate-600/50",
                "bg-white/80 dark:bg-slate-700/80 backdrop-blur-xl",
                "text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                !isConnected && "border-red-300 dark:border-red-700"
              )}
            />
            <AnimatePresence>
              {input.trim() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isTyping || !isConnected}
                    className="h-8 w-8 p-0 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg disabled:bg-slate-400"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mt-3"
        >
          {[
            { label: "Help", action: "How can you help me?" },
            { label: "Capabilities", action: "What are your capabilities?" },
            { label: "Tools", action: "What tools do you have access to?" },
          ].map((suggestion) => (
            <motion.button
              key={suggestion.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInput(suggestion.action)}
              className="px-3 py-1.5 text-xs bg-white/60 dark:bg-slate-700/60 backdrop-blur-xl border border-white/30 dark:border-slate-600/50 rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-200 text-slate-600 dark:text-slate-300"
            >
              {suggestion.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.form>
    </div>
  )
}
