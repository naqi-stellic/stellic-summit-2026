import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

import { Icon } from "@/components/icon"

/* What just happened, and the one press that takes it back.
 *
 * Every clearing action on Staff Home is undoable, and this is where the undo
 * lives: putting it in the row would mean the row has to stay to hold it, and
 * the whole point of clearing is that the row goes. A toast with Undo waits
 * longer than one without, because one of them is asking a question. */

type Toast = {
  id: number
  message: string
  /** A tick before the message, for something that finished rather than
   *  something that merely happened. */
  ok?: boolean
  action?: { label: string; onAct: () => void }
}

type Show = (message: string, options?: Omit<Toast, "id" | "message">) => void

const ToastContext = createContext<Show>(() => {})

/** Say it and move on. Used for everything that would leave Home in the real
 *  product, which on a prototype is most of the buttons. */
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback<Show>((message, options) => {
    const id = Date.now() + Math.random()
    setToasts((all) => [...all, { id, message, ...options }])
    window.setTimeout(() => {
      setToasts((all) => all.filter((toast) => toast.id !== id))
    }, options?.action ? 6500 : 4200)
  }, [])

  /* The provider re-renders on every toast, so the value is memoised on the
     callback alone — otherwise every consumer would re-render with it. */
  const value = useMemo(() => show, [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-80 flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex max-w-[560px] animate-settle items-center gap-3 rounded-md bg-gray-100 px-3.5 py-2.5 text-body-md text-white shadow-2xl"
          >
            {toast.ok && <Icon name="check-circle" size={16} className="shrink-0 text-success-50" />}
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action!.onAct()
                  setToasts((all) => all.filter((other) => other.id !== toast.id))
                }}
                className="shrink-0 cursor-pointer font-semibold whitespace-nowrap text-primary-5"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
